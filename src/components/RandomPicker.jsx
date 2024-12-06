import { motion, AnimatePresence } from 'framer-motion';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const RandomPicker = ({
    filteredAlbums,
    selectedAlbum,
    onPick,
    onListen,
    setSelectedAlbum  // Added to clear selection after remove
}) => {
    const handleCopy = async (album) => {
        const textToCopy = `${album.artist} - ${album.album}`;
        try {
            await navigator.clipboard.writeText(textToCopy);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleRemove = async (album) => {
        try {
            await deleteDoc(doc(db, 'albums', album.id));
            setSelectedAlbum(null); // Clear the selected album after removal
        } catch (err) {
            console.error('Failed to remove album:', err);
        }
    };

    return (
        <div className="space-y-6">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onPick}
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
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleCopy(selectedAlbum)}
                                className="text-zinc-400 hover:text-cyan-400 transition-colors p-2"
                                title="Copy album info"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                </svg>
                            </motion.button>
                            <h3 className="text-2xl font-bold text-white">{selectedAlbum.album}</h3>
                            <p className="text-zinc-400">{selectedAlbum.artist}</p>
                            <p className="text-sm text-zinc-500">
                                {selectedAlbum.year} • {selectedAlbum.genre}
                            </p>
                            <div className="flex gap-4 mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onListen(selectedAlbum)}
                                    className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 
                                         border border-green-500/30 rounded-lg text-green-400"
                                >
                                    Listened
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleRemove(selectedAlbum)}
                                    className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30
                                         border border-red-500/30 rounded-lg text-red-400"
                                >
                                    Remove
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};