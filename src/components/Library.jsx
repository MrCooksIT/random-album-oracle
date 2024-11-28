import { motion, AnimatePresence } from 'framer-motion';
import { LoadingState } from './LoadingState';
import { useState, useMemo } from 'react';

export const Library = ({ albums, onRemove, loading }) => {
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortBy, setSortBy] = useState('album');

    const sortedAlbums = useMemo(() =>
        [...albums].sort((a, b) => {
            const aValue = a[sortBy]?.toLowerCase() || '';
            const bValue = b[sortBy]?.toLowerCase() || '';
            return sortOrder === 'asc' ?
                aValue.localeCompare(bValue) :
                bValue.localeCompare(aValue);
        }), [albums, sortBy, sortOrder]
    );

    if (loading) return <LoadingState />;

    return (
        <motion.div
            initial={false}
            className="backdrop-blur-md bg-black/30 rounded-lg border border-zinc-800/50"
        >
            <div className="p-4 border-b border-zinc-800/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-cyan-400">Your Library</h2>
                    <button
                        onClick={() => setSortOrder(current => current === 'asc' ? 'desc' : 'asc')}
                        className="p-1 hover:bg-zinc-700/30 rounded-lg transition-colors"
                    >
                        <svg
                            className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
                <div className="text-sm text-zinc-400">
                    {albums.length} albums
                </div>
            </div>
            <div className="h-[calc(100vh-16rem)] overflow-y-auto">
                <div className="p-4 space-y-2">
                    {sortedAlbums.map((item) => (
                        <div
                            key={item.id}
                            className="group p-4 bg-zinc-800/30 hover:bg-zinc-700/30 rounded-lg
                                     border border-zinc-700/30 hover:border-zinc-600/30
                                     transition-colors"
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
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};