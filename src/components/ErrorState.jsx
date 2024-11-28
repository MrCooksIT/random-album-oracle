// src/components/ErrorState.jsx
export const ErrorState = ({ message }) => (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
        <h3 className="text-red-400 font-bold mb-2">Error</h3>
        <p className="text-zinc-400">{message}</p>
    </div>
);

export default ErrorState;