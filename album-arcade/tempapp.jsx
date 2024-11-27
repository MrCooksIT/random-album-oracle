
import React, { useState, useEffect } from 'react'
import { db } from './firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { RandomPicker } from './components/RandomPicker';
import { Library } from './components/Library';
import { normalizeYear, normalizeGenre } from './utils/normalizers';
import './App.css';
import { query, orderBy } from 'firebase/firestore';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

function App() {
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLibrary, setShowLibrary] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [yearFilter, setYearFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [limit] = useState(50); // Show 50 albums per page
  const [lastVisible, setLastVisible] = useState(null);
  // Cache albums locally
  const [albums, setAlbums] = useState(() => {
    const cached = localStorage.getItem('cachedAlbums');
    return cached ? JSON.parse(cached) : [];
  });
  const refreshLibrary = async () => {
    const lastUpdate = localStorage.getItem('lastLibraryUpdate');
    const now = Date.now();

    // Only update if it's been more than an hour
    if (!lastUpdate || (now - parseInt(lastUpdate)) > 3600000) {
      await fetchAlbums();
      localStorage.setItem('lastLibraryUpdate', now.toString());
    }
  };
  // Update cache when albums change
  useEffect(() => {
    localStorage.setItem('cachedAlbums', JSON.stringify(albums));
  }, [albums]);


  const handlePickRandom = () => {
    if (filteredAlbums.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredAlbums.length);
      setSelectedAlbum(filteredAlbums[randomIndex]);
    }
  };

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true); // Add loading state
        const albumsRef = collection(db, 'albums');
        const q = query(albumsRef, orderBy('artist'), limit(limit));
        const snapshot = await getDocs(q);
        const albumData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAlbums(albumData);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [limit]);


  const years = React.useMemo(() => {
    const allYears = new Set(albums.map(a => normalizeYear(a.year)));
    const decades = ["Pre-70s", "70's", "80's", "90's"];
    const modernYears = Array.from(allYears)
      .filter(year => !decades.includes(year) && year !== 'Unknown' && parseInt(year) >= 2000)
      .sort();
    return ['All Years', ...decades, ...modernYears, 'Unknown'];
  }, [albums]);

  const genres = React.useMemo(() => {
    const normalizedGenres = new Set(albums.map(a => normalizeGenre(a.genre)));
    return ['All Genres', ...Array.from(normalizedGenres).sort()];
  }, [albums]);

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
            let albumName = "";
            let artistName = "";
            let year = "";
            let genre = "";

            for (let i = 0; i < keys.length; i++) {
              switch (keys[i].textContent) {
                case "Album":
                  albumName = keys[i].nextElementSibling.textContent;
                  break;
                case "Artist":
                  artistName = keys[i].nextElementSibling.textContent;
                  break;
                case "Year":
                  year = keys[i].nextElementSibling.textContent;
                  break;
                case "Genre":
                  genre = keys[i].nextElementSibling.textContent;
                  break;
              }
            }

            if (albumName && artistName) {
              newAlbums.add(JSON.stringify({
                album: albumName,
                artist: artistName,
                year: year || 'Unknown',
                genre: genre || 'Unknown',
                listens: 0,
                skips: 0
              }));
            }
          }

          // Batch add albums
          const batch = db.batch();
          const albumsArray = Array.from(newAlbums).map(item => JSON.parse(item));

          for (const album of albumsArray) {
            const ref = doc(collection(db, 'albums'));
            batch.set(ref, album);
          }

          await batch.commit();

          // Refresh albums list
          const snapshot = await getDocs(collection(db, 'albums'));
          const albumData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAlbums(albumData);

          alert(`Successfully imported ${albumsArray.length} albums!`);
        } catch (error) {
          console.error('Error importing:', error);
          setError('Failed to import albums');
        }
      };
      reader.readAsText(file);
    }
  };
  // Filter albums
  const filteredAlbums = React.useMemo(() => {
    return albums.filter(album => {
      const normalizedYear = normalizeYear(album.year);
      const normalizedGenre = normalizeGenre(album.genre);
      const matchesYear = !yearFilter || yearFilter === 'All Years' || normalizedYear === yearFilter;
      const matchesGenre = !genreFilter || genreFilter === 'All Genres' || normalizedGenre === genreFilter;
      return matchesYear && matchesGenre;
    });
  }, [albums, yearFilter, genreFilter]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white p-4">
      <div className="max-w-5xl mx-auto"> {/* Remove extra p-4 */}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-md bg-black/30 rounded-lg p-6 mb-6 flex justify-between items-center"
        >
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
            onClick={() => setShowLibrary(!showLibrary)}
            className="px-4 py-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-all
                       border border-zinc-700/50 hover:border-zinc-600/50"
          >
            {showLibrary ? 'Hide Library' : 'Show Library'}
          </button>
        </motion.div>

        {/* Main Content */}
        <div className={`grid ${showLibrary ? 'grid-cols-[3fr,2fr]' : 'grid-cols-1'} gap-4 transition-all`}>
          {/* Left Column */}
          <div className="space-y-4">
            {/* Filters */}
            <div className="backdrop-blur-md bg-black/30 rounded-lg p-6 border border-zinc-800/50">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4"
              >
                <span>Filters</span>
                <svg
                  className={`w-2 h-2 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showFilters && (
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      placeholder="Filter by year..."
                      className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
                      list="year-options"
                    />
                    <datalist id="year-options">
                      {years.map(year => (
                        <option key={year} value={year} />
                      ))}
                    </datalist>

                    <input
                      type="text"
                      value={genreFilter}
                      onChange={(e) => setGenreFilter(e.target.value)}
                      placeholder="Filter by genre..."
                      className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
                      list="genre-options"
                    />
                    <datalist id="genre-options">
                      {genres.map(genre => (
                        <option key={genre} value={genre} />
                      ))}
                    </datalist>
                  </div>
                </div>
              )}
            </div>


            {/* Random Picker */}
            <div className="max-w-md mx-auto">
              <RandomPicker
                filteredAlbums={filteredAlbums}
                selectedAlbum={selectedAlbum}
                onPick={handlePickRandom}  // Now this will work
                onListen={handleListen}
                onSkip={handleSkip}
              />
            </div>
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
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Library */}
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
            />
          )}
        </div>

        {/* Error*/}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-red-400">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;