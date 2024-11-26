// src/components/Library.jsx
import { motion, AnimatePresence } from 'framer-motion';

export const Library = ({ albums, onRemove }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="backdrop-blur-md bg-black/30 rounded-lg border border-zinc-800/50"
        >
            <div className="p-4 border-b border-zinc-800/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-cyan-400">Your Library</h2>
                <div className="text-sm text-zinc-400">
                    {albums.length} albums
                </div>
            </div>
            <div className="h-[calc(100vh-16rem)] overflow-y-auto">
                <div className="p-4 space-y-2">
                    <AnimatePresence>
                        {albums.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="group p-4 bg-zinc-800/30 hover:bg-zinc-700/30 rounded-lg
                                          border border-zinc-700/30 hover:border-zinc-600/30
                                          transition-all cursor-pointer"
                            >
                                <div className="font-medium">{item.album}</div>
                                <div className="text-sm text-zinc-400">{item.artist}</div>
                                <div className="text-xs text-zinc-500 mt-1">
                                    {item.year} • {item.genre}
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-xs text-zinc-500">
                                        Plays: {item.listens || 0} | Skips: {item.skips || 0}
                                    </div>
                                    <button
                                        onClick={() => onRemove(item.id)}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 
                                                 hover:text-red-300 transition-opacity"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};