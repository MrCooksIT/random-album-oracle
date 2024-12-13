import { motion, AnimatePresence } from 'framer-motion';
import { normalizeGenre, ALL_VIBES } from '../utils/normalizers';

export const FilterSection = ({
    yearFilter,
    genreFilter,
    onYearChange,
    onGenreChange,
    availableYears,
    showFilters,
    onToggleFilters
}) => {
    const sortedVibes = ALL_VIBES.filter(vibe => vibe !== 'Unknown');
    const sortedYears = [...availableYears].sort((a, b) => {
        const decades = ["All Years", "Pre-70s", "70's", "80's", "90's"];
        if (decades.includes(a) && decades.includes(b)) {
            return decades.indexOf(a) - decades.indexOf(b);
        }
        if (decades.includes(a)) return -1;
        if (decades.includes(b)) return 1;
        if (a === "Unknown") return 1;
        if (b === "Unknown") return -1;
        return parseInt(a) - parseInt(b);
    });

    return (
        <div className="mb-4 sm:mb-6 bg-black/30 rounded-lg p-3 sm:p-4 border border-zinc-800/50">
            <button
                onClick={onToggleFilters}
                className="flex items-center gap-2 text-zinc-400 hover:text-white w-full justify-between p-1"
            >
                <div className="flex items-center gap-2">
                    <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                    </svg>
                    <span className="text-sm sm:text-base">Filters</span>
                </div>
                <motion.svg
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </motion.svg>
            </button>

            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 sm:mt-4 overflow-hidden"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-xs sm:text-sm text-zinc-500 block px-1">Year</label>
                                <select
                                    value={yearFilter}
                                    onChange={(e) => onYearChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-800/75 border border-zinc-700/75 rounded-lg 
                                             text-white text-sm appearance-none hover:border-zinc-600
                                             focus:outline-none focus:border-cyan-500/50"
                                >
                                    {sortedYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-xs sm:text-sm text-zinc-500 block px-1">Genre</label>
                                <select
                                    value={genreFilter}
                                    onChange={(e) => onGenreChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-800/75 border border-zinc-700/75 rounded-lg 
                                             text-white text-sm appearance-none hover:border-zinc-600
                                             focus:outline-none focus:border-cyan-500/50"
                                >
                                    {sortedVibes.map(vibe => (
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