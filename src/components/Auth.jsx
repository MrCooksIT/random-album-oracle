import { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Auth({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            onLogin?.();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white p-8">
            <div className="max-w-md mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="backdrop-blur-md bg-black/30 rounded-lg p-8 border border-zinc-800/50"
                >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text mb-8">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg 
                         text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                                required
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg 
                         text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg
                       font-medium hover:from-cyan-400 hover:to-blue-400 transition-all"
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="w-full mt-4 text-zinc-400 hover:text-white text-sm"
                    >
                        {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}