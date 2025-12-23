import React, { useState, useEffect } from 'react';
import { AlertCircle, User, Lock, Mail, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import api, { quotes, validatePassword } from '../services/api';
import { ThemeToggle, Logo } from '../components/shared';
import { useToast } from '../components/Toast';

// Animated Quote Component
const AnimatedQuote = () => {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setQuoteIndex((prev) => (prev + 1) % quotes.length);
                setIsVisible(true);
            }, 500);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-golden-500 flex-shrink-0 mt-1" />
                <div>
                    <p className="text-brown-600 dark:text-cream-200 italic text-lg">"{quotes[quoteIndex].text}"</p>
                    <p className="text-brown-400 dark:text-cream-300 text-sm mt-1">— {quotes[quoteIndex].author}</p>
                </div>
            </div>
        </div>
    );
};

// Password Requirements Component
const PasswordRequirements = ({ password }) => {
    const { minLength, hasDigit } = validatePassword(password);

    return (
        <div className="mt-2 space-y-1 text-sm animate-slideUp">
            <div className={`flex items-center gap-2 transition-colors duration-300 ${minLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`}>
                {minLength ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>At least 6 characters</span>
            </div>
            <div className={`flex items-center gap-2 transition-colors duration-300 ${hasDigit ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`}>
                {hasDigit ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>At least 1 digit</span>
            </div>
        </div>
    );
};

// Auth Toggle Component
const AuthToggle = ({ isLogin, onToggle }) => {
    return (
        <div className="flex justify-center mb-6">
            <div className="relative bg-cream-200 dark:bg-dark-400 rounded-full p-1 flex">
                {/* Sliding indicator */}
                <div
                    className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-brown-600 to-brown-700 dark:from-golden-500 dark:to-golden-600 rounded-full transition-all duration-300 ease-out ${isLogin ? 'left-1' : 'left-[calc(50%-2px)]'
                        }`}
                />
                <button
                    onClick={() => onToggle(true)}
                    className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${isLogin ? 'text-cream-50' : 'text-brown-600 dark:text-cream-300'
                        }`}
                >
                    Sign In
                </button>
                <button
                    onClick={() => onToggle(false)}
                    className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${!isLogin ? 'text-cream-50' : 'text-brown-600 dark:text-cream-300'
                        }`}
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
};

// Combined Auth Page with Toggle
const AuthPage = ({ onNavigate, onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPasswordHints, setShowPasswordHints] = useState(false);
    const toast = useToast();

    // Reset form when switching
    const handleToggle = (loginMode) => {
        setIsLogin(loginMode);
        setFormData({ username: '', email: '', password: '' });
        setError('');
        setShowPasswordHints(false);
    };

    const handleSubmit = async () => {
        if (isLogin) {
            // Login logic
            if (!formData.username || !formData.password) {
                setError('All fields are required');
                return;
            }

            setError('');
            setLoading(true);

            try {
                const result = await api.login(formData.username, formData.password);
                if (result.error || result.detail) {
                    setError(result.error || result.detail);
                    toast.error(result.error || result.detail);
                } else {
                    toast.success(`Welcome back, ${result.username}!`, 2000);
                    setTimeout(() => onLogin(result.token, result.username), 500);
                }
            } catch (err) {
                setError('Server error. Make sure backend is running.');
                toast.error('Server error. Make sure backend is running.');
            } finally {
                setLoading(false);
            }
        } else {
            // Signup logic
            if (!formData.username || !formData.email || !formData.password) {
                setError('All fields are required');
                return;
            }

            const { isValid } = validatePassword(formData.password);
            if (!isValid) {
                setError('Password must be at least 6 characters with 1 digit');
                return;
            }

            setError('');
            setLoading(true);

            try {
                const result = await api.signup(formData.username, formData.email, formData.password);
                if (result.error || result.detail) {
                    setError(result.error || result.detail);
                    toast.error(result.error || result.detail);
                } else {
                    toast.success('Account created successfully! Please login.');
                    setIsLogin(true);
                    setFormData({ username: formData.username, email: '', password: '' });
                }
            } catch (err) {
                setError('Server error. Make sure backend is running.');
                toast.error('Server error. Make sure backend is running.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen paper-texture flex items-center justify-center p-4">
            {/* Theme Toggle - Top Right */}
            <div className="absolute top-4 right-4 animate-fadeIn">
                <ThemeToggle />
            </div>

            <div className="bg-cream-50 dark:bg-dark-300 rounded-2xl card-shadow-lg p-8 w-full max-w-md border border-cream-300 dark:border-dark-400 animate-slideUp">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <Logo size="large" />
                    </div>
                </div>

                {/* Toggle */}
                <AuthToggle isLogin={isLogin} onToggle={handleToggle} />

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-brown-700 dark:text-cream-100">
                        {isLogin ? 'Welcome Back!' : 'Create Your Account'}
                    </h2>
                    <p className="text-brown-500 dark:text-cream-300 mt-1 text-sm">
                        {isLogin ? 'Sign in to access your documents' : 'Join us to organize intelligently'}
                    </p>
                </div>

                {/* Animated Quote - Only on Login */}
                {isLogin && (
                    <div className="mb-6 p-4 bg-cream-100 dark:bg-dark-400 rounded-xl border border-cream-200 dark:border-dark-500 animate-fadeIn">
                        <AnimatedQuote />
                    </div>
                )}

                <div className="space-y-4">
                    <div className="animate-slideUp stagger-1" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                        <label className="flex items-center text-sm font-semibold mb-2 text-brown-700 dark:text-cream-200">
                            <User className="w-4 h-4 mr-2 text-golden-600 dark:text-golden-400" />
                            Username
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-cream-300 dark:border-dark-400 rounded-xl bg-white dark:bg-dark-400 text-brown-700 dark:text-cream-100 focus:border-golden-500 focus:ring-2 focus:ring-golden-200 dark:focus:ring-golden-600/30 transition-all outline-none input-focus-ring"
                            placeholder={isLogin ? "Enter your username" : "johndoe"}
                        />
                    </div>

                    {/* Email - Only for Signup */}
                    {!isLogin && (
                        <div className="animate-slideUp stagger-2" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                            <label className="flex items-center text-sm font-semibold mb-2 text-brown-700 dark:text-cream-200">
                                <Mail className="w-4 h-4 mr-2 text-golden-600 dark:text-golden-400" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-cream-300 dark:border-dark-400 rounded-xl bg-white dark:bg-dark-400 text-brown-700 dark:text-cream-100 focus:border-golden-500 focus:ring-2 focus:ring-golden-200 dark:focus:ring-golden-600/30 transition-all outline-none input-focus-ring"
                                placeholder="john@example.com"
                            />
                        </div>
                    )}

                    <div className={`animate-slideUp ${isLogin ? 'stagger-2' : 'stagger-3'}`} style={{ opacity: 0, animationFillMode: 'forwards' }}>
                        <label className="flex items-center text-sm font-semibold mb-2 text-brown-700 dark:text-cream-200">
                            <Lock className="w-4 h-4 mr-2 text-golden-600 dark:text-golden-400" />
                            Password
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onFocus={() => !isLogin && setShowPasswordHints(true)}
                            className="w-full px-4 py-3 border-2 border-cream-300 dark:border-dark-400 rounded-xl bg-white dark:bg-dark-400 text-brown-700 dark:text-cream-100 focus:border-golden-500 focus:ring-2 focus:ring-golden-200 dark:focus:ring-golden-600/30 transition-all outline-none input-focus-ring"
                            placeholder="••••••••"
                        />
                        {!isLogin && showPasswordHints && <PasswordRequirements password={formData.password} />}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm animate-shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-brown-600 to-brown-700 dark:from-golden-600 dark:to-golden-700 text-cream-50 py-4 rounded-xl font-semibold hover:from-brown-700 hover:to-brown-800 dark:hover:from-golden-700 dark:hover:to-golden-800 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg btn-glow animate-slideUp ${isLogin ? 'stagger-3' : 'stagger-4'}`}
                        style={{ opacity: 0, animationFillMode: 'forwards' }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cream-50"></div>
                                {isLogin ? 'Signing in...' : 'Creating Account...'}
                            </span>
                        ) : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </div>

                {/* Alternative action text */}
                <div className="mt-6 text-center text-sm text-brown-500 dark:text-cream-300 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                    {isLogin ? (
                        <span>New here? <button onClick={() => handleToggle(false)} className="text-golden-600 dark:text-golden-400 font-semibold hover:text-golden-700">Create an account</button></span>
                    ) : (
                        <span>Already have an account? <button onClick={() => handleToggle(true)} className="text-golden-600 dark:text-golden-400 font-semibold hover:text-golden-700">Sign in</button></span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Legacy exports for backwards compatibility (if needed elsewhere)
const SignupPage = ({ onNavigate }) => <AuthPage onNavigate={onNavigate} onLogin={() => { }} />;
const LoginPage = ({ onNavigate, onLogin }) => <AuthPage onNavigate={onNavigate} onLogin={onLogin} />;

export { SignupPage, LoginPage, AuthPage };
export default AuthPage;
