import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { motion, AnimatePresence } from 'framer-motion';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_KEY = 'albumArcadeCache';

export default function OptimizedRandomPicker() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [yearFilter, setYearFilter] = useState('');
    const [genreFilter, setGenreFilter] = useState('');

    useEffect(() => {
        const loadAlbums = async () => {
            try {
                // Check cache first
                const cache = localStorage.getItem(CACHE_KEY);
                if (cache) {
                    const { data, timestamp } = JSON.parse(cache);
                    const isExpired = Date.now() - timestamp > CACHE_DURATION;

                    if (!isExpired) {
                        setAlbums(data);
                        setLoading(false);
                        return;
                    }
                }

                // Cache miss or expired, fetch from Firestore
                setLoading(true);
                const albumsRef = collection(db, 'albums');
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
    }, []);

    // Filter albums based on criteria
    const filteredAlbums = albums.filter(album => {
        const matchesYear = !yearFilter || album.year.toString().includes(yearFilter);
        const matchesGenre = !genreFilter || album.genre.toLowerCase().includes(genreFilter.toLowerCase());
        return matchesYear && matchesGenre;
    });

    const handlePickRandom = () => {
        if (filteredAlbums.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredAlbums.length);
            setSelectedAlbum(filteredAlbums[randomIndex]);
        }
    };

    const handleAction = async (album, action) => {
        try {
            const field = action === 'listen' ? 'listens' : 'skips';
            const newCount = (album[field] || 0) + 1;

            // Optimistically update UI
            setAlbums(prevAlbums =>
                prevAlbums.map(a =>
                    a.id === album.id ? { ...a, [field]: newCount } : a
                )
            );

            // Update cache
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
            cache.data = cache.data.map(a =>
                a.id === album.id ? { ...a, [field]: newCount } : a
            );
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

            // Update Firestore in background
            await updateDoc(doc(db, 'albums', album.id), {
                [field]: newCount
            });

            setSelectedAlbum(null);
        } catch (err) {
            setError(`Failed to update ${action} count`);
            // Revert optimistic update on error
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
            setAlbums(cache.data);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="space-y-6">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePickRandom}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg
                  hover:from-blue-500 hover:to-cyan-500 transition-all
                  font-bold text-lg shadow-lg"
            >
                Pick Random Album ({filteredAlbums.length})
            </motion.button>

            <AnimatePresence mode="wait">
                {selectedAlbum && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-6 bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 rounded-lg p-6
                     border border-zinc-700/30 backdrop-blur-md"
                    >
                        <div className="text-center space-y-4">
                            <div className="text-cyan-400 font-medium">Now Playing</div>
                            <h3 className="text-2xl font-bold text-white">{selectedAlbum.album}</h3>
                            <p className="text-zinc-400">{selectedAlbum.artist}</p>
                            <p className="text-sm text-zinc-500">
                                {selectedAlbum.year} • {selectedAlbum.genre}
                            </p>
                            <p className="text-sm text-zinc-500">
                                Plays: {selectedAlbum.listens || 0} • Skips: {selectedAlbum.skips || 0}
                            </p>
                            <div className="flex gap-4 mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAction(selectedAlbum, 'listen')}
                                    className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 
                           border border-green-500/30 rounded-lg text-green-400"
                                >
                                    Listened
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAction(selectedAlbum, 'skip')}
                                    className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30
                           border border-red-500/30 rounded-lg text-red-400"
                                >
                                    Skip
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}