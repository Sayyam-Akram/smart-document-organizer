import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Toast Context for global access
const ToastContext = createContext(null);

// Toast types with their configurations
const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/40',
        borderColor: 'border-emerald-200 dark:border-emerald-700',
        iconColor: 'text-emerald-500',
        progressColor: 'bg-emerald-500',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/40',
        borderColor: 'border-red-200 dark:border-red-700',
        iconColor: 'text-red-500',
        progressColor: 'bg-red-500',
    },
    warning: {
        icon: AlertCircle,
        bgColor: 'bg-amber-50 dark:bg-amber-900/40',
        borderColor: 'border-amber-200 dark:border-amber-700',
        iconColor: 'text-amber-500',
        progressColor: 'bg-amber-500',
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-50 dark:bg-blue-900/40',
        borderColor: 'border-blue-200 dark:border-blue-700',
        iconColor: 'text-blue-500',
        progressColor: 'bg-blue-500',
    },
};

// Individual Toast Component
const Toast = ({ id, type, message, onClose, duration = 4000 }) => {
    const [isExiting, setIsExiting] = useState(false);
    const config = toastConfig[type] || toastConfig.info;
    const Icon = config.icon;

    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300);
    }, [id, onClose]);

    useEffect(() => {
        const timer = setTimeout(handleClose, duration);
        return () => clearTimeout(timer);
    }, [duration, handleClose]);

    return (
        <div
            className={`
                ${isExiting ? 'animate-slideOutRight' : 'animate-slideInRight'}
                ${config.bgColor} ${config.borderColor}
                border rounded-xl p-4 pr-12 shadow-lg relative overflow-hidden
                min-w-[320px] max-w-[420px]
            `}
        >
            <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <p className="text-brown-700 dark:text-cream-100 text-sm font-medium leading-relaxed">
                    {message}
                </p>
            </div>

            {/* Close button */}
            <button
                onClick={handleClose}
                className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
                <X className="w-4 h-4 text-brown-400 dark:text-cream-300" />
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/10">
                <div
                    className={`h-full ${config.progressColor}`}
                    style={{ animation: `countdown ${duration}ms linear forwards` }}
                />
            </div>
        </div>
    );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    type={toast.type}
                    message={toast.message}
                    duration={toast.duration}
                    onClose={removeToast}
                />
            ))}
        </div>
    );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, message, duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, message, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toast = {
        success: (message, duration) => addToast('success', message, duration),
        error: (message, duration) => addToast('error', message, duration),
        warning: (message, duration) => addToast('warning', message, duration),
        info: (message, duration) => addToast('info', message, duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

// Hook to use toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export default ToastProvider;
