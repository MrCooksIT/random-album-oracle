// App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { RandomPicker } from './components/RandomPicker.jsx';
import Auth from './components/Auth.jsx';
import { auth, db } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from 'framer-motion';
import { collection, getDocs, updateDoc, doc, addDoc, writeBatch } from 'firebase/firestore';
import { FilterSection } from './components/FilterSection';
import { Library } from './components/Library';
import { normalizeYear, normalizeGenre, ALL_VIBES } from './utils/normalizers';

function App() {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null)
    const [showLibrary, setShowLibrary] = useState(false);
    const [user] = useAuthState(auth);
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [yearFilter, setYearFilter] = useState('');
    const [genreFilter, setGenreFilter] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const availableYears = useMemo(() => {
        ``
        if (!albums.length) return ['All Years'];
        const years = new Set(albums.map(a => normalizeYear(a.year)));
        return ['All Years', ...Array.from(years)].filter(y => y !== 'Unknown');
    }, [albums]);

    const availableGenres = useMemo(() => {
        if (!albums.length) return ['All Genres'];  // Changed from ALL_VIBES
        const genres = new Set(albums.map(a => normalizeGenre(a.genre)));
        return ['All Genres', ...Array.from(genres)].filter(g => g !== 'Unknown');
    }, [albums]);

    const filteredAlbums = useMemo(() => {
        return albums.filter(album => {
            const normalizedGenre = normalizeGenre(album.genre);
            const matchesYear = !yearFilter || yearFilter === 'All Years' || normalizeYear(album.year) === yearFilter;
            const matchesGenre = !genreFilter || genreFilter === 'All Genres' || normalizedGenre === genreFilter;
            console.log({
                originalGenre: album.genre,
                normalizedGenre,
                filterGenre: genreFilter,
                matches: matchesGenre
            });
            return matchesYear && matchesGenre;
        });
    }, [albums, yearFilter, genreFilter]);

    React.useEffect(() => {
        if (user) {
            const loadAlbums = async () => {
                try {
                    const albumsRef = collection(db, 'albums');
                    const snapshot = await getDocs(albumsRef);
                    const albumData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setAlbums(albumData);
                } catch (err) {
                    setError('Failed to load albums');
                }
            };
            loadAlbums();
        }
    }, [user]);
    const handlePickRandom = () => {
        if (filteredAlbums.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredAlbums.length);
            const album = filteredAlbums[randomIndex];
            console.log({
                original: album.genre,
                normalized: normalizeGenre(album.genre),
                filter: genreFilter
            });
            setSelectedAlbum(album);
        }
    };
    const handleFileUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        const BATCH_SIZE = 400; // Stay under Firebase's 500 limit

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                setLoading(true);
                const text = e.target.result;
                const rows = text.split('\n');

                // Skip header row and create album objects
                const albums = rows.slice(1)
                    .map(row => {
                        const [artist, album, genre, year] = row.split(',').map(field => field.trim());
                        return {
                            artist,
                            album,
                            genre,
                            year,
                            listens: 0,
                            skips: 0
                        };
                    })
                    .filter(album =>
                        album.artist &&
                        album.album &&
                        !album.album.toLowerCase().includes('single') &&
                        !album.album.toLowerCase().includes('preview') &&
                        !album.album.toLowerCase().includes('sample')
                    );

                // Delete existing albums
                const existingAlbums = await getDocs(collection(db, 'albums'));
                const deleteBatch = writeBatch(db);
                existingAlbums.docs.forEach(doc => {
                    deleteBatch.delete(doc.ref);
                });
                await deleteBatch.commit();

                // Upload in chunks
                for (let i = 0; i < albums.length; i += BATCH_SIZE) {
                    const chunk = albums.slice(i, i + BATCH_SIZE);
                    const batch = writeBatch(db);

                    chunk.forEach(album => {
                        const ref = doc(collection(db, 'albums'));
                        batch.set(ref, album);
                    });

                    await batch.commit();
                }

                const snapshot = await getDocs(collection(db, 'albums'));
                setAlbums(snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));

                setSelectedFile(null);
                setLoading(false);
                setError(null);

                alert(`Successfully imported ${albums.length} albums!`);
            } catch (error) {
                console.error('Error importing:', error);
                setError('Failed to import albums');
                setLoading(false);
            }
        };

        reader.readAsText(selectedFile);
    };
    const handleManualAdd = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const albumData = {
            album: formData.get('album'),
            artist: formData.get('artist'),
            year: formData.get('year') || 'Unknown',
            genre: formData.get('genre') || 'Unknown',
            listens: 0,
            skips: 0
        };

        try {
            const albumsRef = collection(db, 'albums');
            await addDoc(albumsRef, albumData);

            // Refresh albums list
            const snapshot = await getDocs(albumsRef);
            setAlbums(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));

            e.target.reset();
            setError(null);
        } catch (err) {
            setError('Failed to add album');
        }
    };
    const resetLibrary = async () => {
        const batch = writeBatch(db);
        const existingAlbums = await getDocs(collection(db, 'albums'));
        existingAlbums.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        setAlbums([]);
    };
    const handleListen = async (album) => {
        try {
            const newListens = (album.listens || 0) + 1;
            await updateDoc(doc(db, 'albums', album.id), {
                listens: newListens
            });
            setAlbums(albums.map(a =>
                a.id === album.id ? { ...a, listens: newListens } : a
            ));
            setSelectedAlbum(null);
        } catch (err) {
            setError('Failed to update listen count');
        }
    };

    const handleSkip = async (album) => {
        try {
            const newSkips = (album.skips || 0) + 1;
            await updateDoc(doc(db, 'albums', album.id), {
                skips: newSkips
            });
            setAlbums(albums.map(a =>
                a.id === album.id ? { ...a, skips: newSkips } : a
            ));
            setSelectedAlbum(null);
        } catch (err) {
            setError('Failed to update skip count');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    if (!user) {
        return <Auth onLogin={() => console.log('Logged in!')} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white antialiased">
            <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="backdrop-blur-lg bg-black/40 rounded-2xl p-4 mb-4 shadow-xl
                         border border-zinc-800/50"
                >
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="relative"
                            >
                                {/* Outer glow */}
                                <motion.div
                                    animate={{
                                        rotate: 360,
                                        boxShadow: [
                                            "0 0 10px rgba(34, 211, 238, 0.2)",
                                            "0 0 20px rgba(34, 211, 238, 0.4)",
                                            "0 0 10px rgba(34, 211, 238, 0.2)"
                                        ]
                                    }}
                                    transition={{
                                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                        boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full absolute inset-0"
                                />
                                {/* Main CD */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 sm:w-20 sm:h-20 relative"
                                >
                                    <svg viewBox="0 0 24 24" className="text-cyan-400 w-full h-full">
                                        {/* Outer ring */}
                                        <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.1" />
                                        <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="0.5" />

                                        {/* Grooves */}
                                        {[...Array(8)].map((_, i) => (
                                            <circle
                                                key={i}
                                                cx="12"
                                                cy="12"
                                                r={10 - i}
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="0.1"
                                                opacity={0.3 - i * 0.02}
                                            />
                                        ))}

                                        {/* Label */}
                                        <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.2" />
                                        <circle cx="12" cy="12" r="3" fill="currentColor" />

                                        {/* Center hole */}
                                        <circle cx="12" cy="12" r="0.5" fill="black" />

                                        {/* Reflection effect */}
                                        <path
                                            d="M8 8 Q12 12 16 8"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="0.2"
                                            opacity="0.3"
                                        />
                                    </svg>
                                </motion.div>

                                {/* Shine effect */}
                                <motion.div
                                    animate={{
                                        opacity: [0.3, 0.7, 0.3],
                                        rotate: 360
                                    }}
                                    transition={{
                                        opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                                        rotate: { duration: 6, repeat: Infinity, ease: "linear" }
                                    }}
                                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400 to-transparent opacity-30"
                                    style={{
                                        borderRadius: '50%',
                                        mixBlendMode: 'overlay'
                                    }}
                                />
                            </motion.div>
                            <span className="whitespace-nowrap">Album Arcade</span>
                        </h1>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => setShowLibrary(!showLibrary)}
                                className="px-3 py-1.5 bg-zinc-800/80 rounded-lg hover:bg-zinc-700/80 
                                     transition-all text-sm font-medium text-zinc-200
                                     active:scale-95 shadow-lg border border-zinc-700/50"
                            >
                                {showLibrary ? 'Hide' : 'Show'} Library
                            </button>
                            <button
                                onClick={() => auth.signOut()}
                                className="px-3 py-1.5 bg-zinc-800/80 rounded-lg hover:bg-zinc-700/80 
                                     transition-all text-sm font-medium text-zinc-200
                                     active:scale-95 shadow-lg border border-zinc-700/50"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </motion.div>
                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                        {error}
                    </div>
                )}
                {/* Content grid for larger screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Left column */}
                    <div className="space-y-4">
                        <div className="backdrop-blur-lg bg-black/40 rounded-2xl shadow-xl border border-zinc-800/50">
                            <FilterSection
                                yearFilter={yearFilter}
                                genreFilter={genreFilter}
                                onYearChange={setYearFilter}
                                onGenreChange={setGenreFilter}
                                availableYears={availableYears}
                                availableGenres={availableGenres}
                                showFilters={showFilters}
                                onToggleFilters={() => setShowFilters(!showFilters)}
                            />
                        </div>

                        <div className="backdrop-blur-lg bg-black/40 rounded-2xl shadow-xl border border-zinc-800/50">
                            <RandomPicker
                                filteredAlbums={filteredAlbums}
                                selectedAlbum={selectedAlbum}
                                onPick={handlePickRandom}
                                onListen={handleListen}
                                setSelectedAlbum={setSelectedAlbum}
                            />
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        <div className="backdrop-blur-lg bg-black/40 rounded-2xl shadow-xl border border-zinc-800/50">
                            {/* Upload section */}
                            <button
                                onClick={() => setShowUpload(!showUpload)}
                                className="w-full p-4 text-left text-zinc-400 hover:text-white 
                                     text-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 4v16m8-8H4" />
                                </svg>
                                {showUpload ? 'Hide Upload Options' : 'Show Upload Options'}
                            </button>

                            {showUpload && (
                                <div className="mt-4 space-y-4">
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to delete all albums? This cannot be undone.')) {
                                                setLoading(true);
                                                try {
                                                    const batch = writeBatch(db);
                                                    const existingAlbums = await getDocs(collection(db, 'albums'));
                                                    existingAlbums.docs.forEach(doc => {
                                                        batch.delete(doc.ref);
                                                    });
                                                    await batch.commit();
                                                    setAlbums([]);
                                                    setError(null);
                                                } catch (err) {
                                                    setError('Failed to reset library');
                                                }
                                                setLoading(false);
                                            }
                                        }}
                                        className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 
               rounded-lg text-red-400 text-sm"
                                    >
                                        Reset Library
                                    </button>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        className="w-full p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50 text-sm"
                                    />
                                    <button
                                        onClick={handleFileUpload}
                                        disabled={!selectedFile}
                                        className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg
                hover:from-blue-500 hover:to-cyan-500 transition-all text-sm
                disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Upload Library
                                    </button>
                                    <p className="text-xs text-zinc-500">
                                        Import your iTunes library file
                                    </p>
                                    {/* Manual album entry */}
                                    <form onSubmit={handleManualAdd} className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Album Name"
                                            className="w-full p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Artist"
                                            className="w-full p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Year"
                                                className="flex-1 p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Genre"
                                                className="flex-1 p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:bg-zinc-700/50"
                                        >
                                            Add Album
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                    {showLibrary && (
                        <Library
                            albums={filteredAlbums}
                            onRemove={async (id) => {
                                try {
                                    await doc(db, 'albums', id).delete();
                                    setAlbums(albums.filter(a => a.id !== id));
                                } catch (err) {
                                    setError('Failed to remove album');
                                }
                            }}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );

}

export default App;