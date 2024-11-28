import { motion, AnimatePresence } from 'framer-motion';
import { ALL_VIBES } from '../utils/genres';

export const FilterSection = ({
    yearFilter,
    genreFilter,
    onYearChange,
    onGenreChange,
    availableYears,
    showFilters,
    onToggleFilters
}) => {
    return (
        <div className="mb-6 bg-black/30 rounded-lg p-4 border border-zinc-800/50">
            <button
                onClick={onToggleFilters}
                className="flex items-center gap-2 text-zinc-400 hover:text-white w-full justify-between"
            >
                <span>Filters</span>
                <motion.svg
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
            </button>

            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-500">Year</label>
                                <input
                                    type="text"
                                    value={yearFilter}
                                    onChange={(e) => onYearChange(e.target.value)}
                                    placeholder="Filter by year..."
                                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg 
                                             text-white placeholder-zinc-500"
                                    list="year-options"
                                />
                                <datalist id="year-options">
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </datalist>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-500">Vibe</label>
                                <select
                                    value={genreFilter}
                                    onChange={(e) => onGenreChange(e.target.value)}
                                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg 
                                             text-white"
                                >
                                    {ALL_VIBES.map(vibe => (
                                        <option key={vibe} value={vibe}>{vibe}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};