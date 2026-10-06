// frontend/src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const userData = await login(email, password);

            // Role-Based Redirection Matrix
            switch (userData.role) {
                case 'Admin':
                case 'Manager':
                    navigate('/manager');
                    break;
                case 'Waiter':
                    navigate('/waiter');
                    break;
                case 'Kitchen':
                    navigate('/kitchen');
                    break;
                default:
                    navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Please check credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 transition-colors duration-200"
            style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-main)' }}
        >
            <div
                className="w-full max-w-sm p-6 rounded-2xl shadow-xl border space-y-5"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
            >
                {/* BRAND HEADER */}
                <div className="text-center">
                    <div
                        className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center font-black text-xl mb-3 shadow-md"
                        style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                    >
                        HMS
                    </div>
                    <h1 className="text-lg font-extrabold">Staff Portal</h1>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Sign in to access your operational dashboard
                    </p>
                </div>

                {/* ERROR BANNER */}
                {error && (
                    <div className="p-3 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-center animate-shake">
                        {error}
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="e.g. manager@hotel.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1.5 p-3 text-xs rounded-xl border focus:outline-none transition-all"
                            style={{
                                borderColor: 'var(--border-subtle)',
                                backgroundColor: 'var(--bg-canvas)',
                                color: 'var(--text-main)',
                            }}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1.5 p-3 text-xs rounded-xl border focus:outline-none transition-all"
                            style={{
                                borderColor: 'var(--border-subtle)',
                                backgroundColor: 'var(--bg-canvas)',
                                color: 'var(--text-main)',
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 text-xs font-extrabold text-white rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In →'}
                    </button>
                </form>

                <div className="text-center pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Customers do not need an account. Simply scan your table's QR Code.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;