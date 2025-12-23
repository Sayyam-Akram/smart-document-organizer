import React, { useState } from 'react';
import AuthPage from './pages/AuthPages';
import UploadPage from './pages/UploadPage';
import OrganizedPage from './pages/OrganizedPage';
import { ToastProvider } from './components/Toast';

// Main App - Router with Toast Notifications
export default function App() {
    const [page, setPage] = useState('auth');
    const [token, setToken] = useState(null);
    const [username, setUsername] = useState('');

    const handleLogin = (newToken, newUsername) => {
        setToken(newToken);
        setUsername(newUsername);
        setPage('upload');
    };

    const handleLogout = () => {
        setToken(null);
        setUsername('');
        setPage('auth');
    };

    return (
        <ToastProvider>
            <div className="page-transition">
                {page === 'auth' && <AuthPage onNavigate={setPage} onLogin={handleLogin} />}
                {page === 'upload' && <UploadPage token={token} username={username} onNavigate={setPage} onLogout={handleLogout} />}
                {page === 'organized' && <OrganizedPage token={token} username={username} onNavigate={setPage} onLogout={handleLogout} />}
            </div>
        </ToastProvider>
    );
}