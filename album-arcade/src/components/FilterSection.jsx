// src/components/FilterSection.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FilterSection = ({ yearFilter, genreFilter, onYearChange, onGenreFilter, yearOptions, genreOptions }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-white mb-2"
            >
                <motion.svg
                    className="w-4 h-4"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="none"
                        d="M19 9l-7 7-7-7"
                    />
                </motion.svg>
                <span>Filters</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4"
                    >
                        {/* Your filter inputs */}
                        <div className="flex gap-4">
                            {/* Year and Genre inputs */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};