import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY = 'albumArcadeCache';

export function useAlbums(userId) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [albums, setAlbums] = useState([]);

    // Load albums
    useEffect(() => {
        const loadAlbums = async () => {
            if (!userId) return;

            try {
                // Check cache
                const cache = localStorage.getItem(CACHE_KEY);
                if (cache) {
                    const { data, timestamp } = JSON.parse(cache);
                    if (Date.now() - timestamp <= CACHE_DURATION) {
                        setAlbums(data);
                        setLoading(false);
                        return;
                    }
                }

                // Fetch from Firestore
                setLoading(true);
                const albumsRef = collection(db, 'users', userId, 'albums');
                const snapshot = await getDocs(albumsRef);
                const albumData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Update cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: albumData,
                    timestamp: Date.now()
                }));

                setAlbums(albumData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadAlbums();
    }, [userId]);

    // Update album stats
    const updateAlbumStats = async (albumId, field) => {
        try {
            const album = albums.find(a => a.id === albumId);
            if (!album) return;

            const newCount = (album[field] || 0) + 1;

            // Optimistic update
            setAlbums(prev => prev.map(a =>
                a.id === albumId ? { ...a, [field]: newCount } : a
            ));

            // Update cache
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
            cache.data = cache.data.map(a =>
                a.id === albumId ? { ...a, [field]: newCount } : a
            );
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

            // Update Firestore
            await updateDoc(doc(db, 'users', userId, 'albums', albumId), {
                [field]: newCount
            });
        } catch (err) {
            setError(`Failed to update ${field}`);
            // Revert on error
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
            setAlbums(cache.data);
        }
    };

    return {
        albums,
        loading,
        error,
        updateAlbumStats
    };
}