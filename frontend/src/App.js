import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPages';
import UploadPage from './pages/UploadPage';
import OrganizedPage from './pages/OrganizedPage';
import { ToastProvider } from './components/Toast';
import { saveSession, loadSession, clearSession } from './services/api';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('App Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center paper-texture p-4">
                    <div className="bg-cream-50 dark:bg-dark-300 rounded-2xl p-8 max-w-md text-center card-shadow-lg">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-brown-700 dark:text-cream-100 mb-2">Something went wrong</h2>
                        <p className="text-brown-500 dark:text-cream-300 mb-6">The application encountered an unexpected error.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gradient-to-r from-brown-600 to-brown-700 text-white rounded-xl font-semibold hover:from-brown-700 hover:to-brown-800 transition-all"
                        >
                            Reload App
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Main App - Router with Toast Notifications and Session Persistence
export default function App() {
    const [page, setPage] = useState('auth');
    const [token, setToken] = useState(null);
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Load session on mount
    useEffect(() => {
        const session = loadSession();
        if (session && session.token && session.username) {
            setToken(session.token);
            setUsername(session.username);
            setPage('upload');
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (newToken, newUsername) => {
        setToken(newToken);
        setUsername(newUsername);
        saveSession(newToken, newUsername);
        setPage('upload');
    };

    const handleLogout = () => {
        setToken(null);
        setUsername('');
        clearSession();
        setPage('auth');
    };

    // Show loading state while checking session
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center paper-texture">
                <div className="w-16 h-16 border-4 border-golden-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <ToastProvider>
                <div className="page-transition">
                    {page === 'auth' && <AuthPage onNavigate={setPage} onLogin={handleLogin} />}
                    {page === 'upload' && <UploadPage token={token} username={username} onNavigate={setPage} onLogout={handleLogout} />}
                    {page === 'organized' && <OrganizedPage token={token} username={username} onNavigate={setPage} onLogout={handleLogout} />}
                </div>
            </ToastProvider>
        </ErrorBoundary>
    );
}