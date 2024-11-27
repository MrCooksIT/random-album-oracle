// App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { RandomPicker } from './components/RandomPicker.jsx';
import Auth from './components/Auth.jsx';
import { auth, db } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from 'framer-motion';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { FilterSection } from './components/FilterSection';
import { useFilters } from './hooks/useFilters';
import { normalizeYear, normalizeGenre } from './utils/normalizers';

function App() {

    const [user, loading] = useAuthState(auth);
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [yearFilter, setYearFilter] = useState('');
    const [genreFilter, setGenreFilter] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const availableYears = useMemo(() => {
        if (!albums.length) return ['All Years'];
        const years = new Set(albums.map(a => normalizeYear(a.year)));
        return ['All Years', ...Array.from(years)].filter(y => y !== 'Unknown');
    }, [albums]);

    const availableGenres = useMemo(() => {
        if (!albums.length) return ['All Genres'];
        const genres = new Set(albums.map(a => normalizeGenre(a.genre)));
        return ['All Genres', ...Array.from(genres)].filter(g => g !== 'Unknown');
    }, [albums]);

    const filteredAlbums = useFilters(albums, yearFilter, genreFilter);

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
        if (albums.length > 0) {
            const randomIndex = Math.floor(Math.random() * albums.length);
            setSelectedAlbum(albums[randomIndex]);
        }
    };
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(e.target.result, "text/xml");
                    const tracks = xml.getElementsByTagName("dict")[0].getElementsByTagName("dict");
                    const newAlbums = new Set();

                    for (let track of tracks) {
                        const keys = track.getElementsByTagName("key");
                        let albumData = {
                            album: "",
                            artist: "",
                            year: "Unknown",
                            genre: "Unknown",
                            listens: 0,
                            skips: 0
                        };

                        for (let i = 0; i < keys.length; i++) {
                            switch (keys[i].textContent) {
                                case "Album":
                                    albumData.album = keys[i].nextElementSibling.textContent;
                                    break;
                                case "Artist":
                                    albumData.artist = keys[i].nextElementSibling.textContent;
                                    break;
                                case "Year":
                                    albumData.year = keys[i].nextElementSibling.textContent;
                                    break;
                                case "Genre":
                                    albumData.genre = keys[i].nextElementSibling.textContent;
                                    break;
                            }
                        }

                        if (albumData.album && albumData.artist) {
                            newAlbums.add(JSON.stringify(albumData));
                        }
                    }

                    const albumsRef = collection(db, 'albums');
                    for (const albumJson of newAlbums) {
                        await addDoc(albumsRef, JSON.parse(albumJson));
                    }

                    // Refresh albums list
                    const snapshot = await getDocs(albumsRef);
                    setAlbums(snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })));

                    setError(null);
                } catch (err) {
                    setError('Failed to import albums');
                }
            };
            reader.readAsText(file);
        }
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

        <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white p-4">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="backdrop-blur-md bg-black/30 rounded-lg p-6 mb-6"
                >
                    <div className="flex justify-between items-center">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text flex items-center gap-4">
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
                                    className="w-12 h-12 rounded-full absolute inset-0"
                                />

                                {/* Main CD */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="w-12 h-12 relative"
                                >
                                    <svg viewBox="0 0 24 24" className="text-cyan-400">
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
                            Album Arcade
                        </h1>
                        <button
                            onClick={() => auth.signOut()}
                            className="px-4 py-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-all
                     border border-zinc-700/50 hover:border-zinc-600/50 text-sm"
                        >
                            Sign Out
                        </button>
                    </div>
                </motion.div>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                        {error}
                    </div>
                )}
                {albums.length === 0 && (
                    <div className="mb-4">
                    </div>
                )}
                <div className="space-y-4 mb-6">
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



                    <RandomPicker
                        filteredAlbums={filteredAlbums}
                        selectedAlbum={selectedAlbum}
                        onPick={handlePickRandom}
                        onListen={handleListen}
                        onSkip={handleSkip}
                    />
                    <div className="backdrop-blur-md bg-black/30 rounded-lg p-4 border border-zinc-800/50">
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            className="text-zinc-400 hover:text-white text-sm flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {showUpload ? 'Hide Upload Options' : 'Show Upload Options'}
                        </button>

                        {showUpload && (
                            <div className="mt-4 space-y-4">
                                <input
                                    type="file"
                                    accept=".xml"
                                    onChange={handleFileUpload}
                                    className="w-full p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50 text-sm"
                                />
                                <p className="text-xs text-zinc-500">
                                    Import your iTunes library.xml file
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
            </div>
        </div>
    );

}

export default App;