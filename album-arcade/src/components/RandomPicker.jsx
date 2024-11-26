// src/components/RandomPicker.jsx
import { motion, AnimatePresence } from 'framer-motion';

export const RandomPicker = ({
    filteredAlbums,
    selectedAlbum,
    onPick,
    onListen,
    onSkip
}) => {
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
                            <div className="text-cyan-400 font-medium">Now Playing</div>
                            <h3 className="text-2xl font-bold text-white">{selectedAlbum.album}</h3>
                            <p className="text-zinc-400">{selectedAlbum.artist}</p>
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
                                    onClick={() => onSkip(selectedAlbum)}
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
};