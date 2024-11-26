// App.jsx
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { RandomPicker } from './components/RandomPicker';
import { Library } from './components/Library';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

function App() {
  // State
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLibrary, setShowLibrary] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [yearFilter, setYearFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  // Get unique years and genres for filters
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

  // Load albums from Firebase
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'albums'));
        const albumData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAlbums(albumData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-md bg-black/30 rounded-lg p-6 mb-6 flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
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
      <div className={`grid ${showLibrary ? 'grid-cols-[2fr,1fr]' : 'grid-cols-1'} gap-6 transition-all`}>
        {/* Left Column */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="backdrop-blur-md bg-black/30 rounded-lg p-6 border border-zinc-800/50">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4"
            >
              <span>Filters</span>
              <svg
                className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showFilters && (
              <div className="space-y-4">
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
          <RandomPicker
            filteredAlbums={filteredAlbums}
            selectedAlbum={selectedAlbum}
            onPick={() => {
              if (filteredAlbums.length > 0) {
                const randomIndex = Math.floor(Math.random() * filteredAlbums.length);
                setSelectedAlbum(filteredAlbums[randomIndex]);
              }
            }}
            onListen={handleListen}
            onSkip={handleSkip}
          />
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

      {/* Error Toast */}
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
  );
}

export default App;