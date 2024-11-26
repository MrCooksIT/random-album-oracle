import { motion, AnimatePresence } from 'framer-motion';

export const FilterSection = ({
    yearFilter,
    genreFilter,
    onYearChange,
    onGenreChange,
    availableYears,
    availableGenres,
    showFilters,
    onToggleFilters
}) => {
    return (
        <div className="mb-6">
            <button
                onClick={onToggleFilters}
                className="flex items-center gap-2 text-zinc-400 hover:text-white"
            >
                <motion.svg
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
                <span>Filters</span>
            </button>

            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 mt-4"
                    >
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={yearFilter}
                                onChange={(e) => onYearChange(e.target.value)}
                                placeholder="Filter by year..."
                                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
                                list="year-options"
                            />
                            <datalist id="year-options">
                                <option value="">All Years</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </datalist>

                            <input
                                type="text"
                                value={genreFilter}
                                onChange={(e) => onGenreChange(e.target.value)}
                                placeholder="Filter by genre..."
                                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
                                list="genre-options"
                            />
                            <datalist id="genre-options">
                                <option value="">All Genres</option>
                                {availableGenres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </datalist>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};