// src/hooks/useAlbums.js
import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export const useAlbums = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAlbums = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'albums'));
            const albumData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAlbums(albumData);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateAlbum = async (albumId, updates) => {
        try {
            await updateDoc(doc(db, 'albums', albumId), updates);
            setAlbums(albums.map(album => 
                album.id === albumId 
                    ? { ...album, ...updates }
                    : album
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    return { albums, loading, error, updateAlbum };
};