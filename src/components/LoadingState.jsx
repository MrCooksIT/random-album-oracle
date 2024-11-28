import { motion } from 'framer-motion';

export const LoadingState = () => (
    <div className="flex flex-col items-center justify-center h-64">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
        />
        <p className="mt-4 text-zinc-400">Loading your library...</p>
    </div>
);

export default LoadingState;