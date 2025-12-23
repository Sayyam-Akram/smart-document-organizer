// API Configuration
const API_BASE = 'http://localhost:8000';

// API Service - All backend communication
const api = {
    signup: async (username, email, password) => {
        const res = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        return res.json();
    },

    login: async (username, password) => {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return res.json();
    },

    uploadDocuments: async (files, token) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        const res = await fetch(`${API_BASE}/upload-documents`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        return res.json();
    },

    getCategories: async (token) => {
        const res = await fetch(`${API_BASE}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    getDocuments: async (category, token) => {
        const res = await fetch(`${API_BASE}/documents?category=${category}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    summarizeDocument: async (documentId, token) => {
        const res = await fetch(`${API_BASE}/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ document_id: documentId })
        });
        return res.json();
    },

    getLLMStatus: async () => {
        const res = await fetch(`${API_BASE}/llm-status`);
        return res.json();
    },

    deleteDocument: async (documentId, token) => {
        const res = await fetch(`${API_BASE}/documents/${documentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    downloadZip: async (token) => {
        const res = await fetch(`${API_BASE}/download-zip`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Download failed');
        }

        // Return blob for download
        return res.blob();
    }
};

// Inspirational quotes for document organization
export const quotes = [
    { text: "A well-organized document is a well-organized mind.", author: "Unknown" },
    { text: "Order is the shape upon which beauty depends.", author: "Pearl S. Buck" },
    { text: "For every minute spent organizing, an hour is earned.", author: "Benjamin Franklin" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
];

// Category colors for visual distinction - Bookish theme
export const categoryColors = {
    "Resume": "bg-amber-50 border-amber-400 text-amber-800 hover:bg-amber-100",
    "Report": "bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100",
    "Legal Document": "bg-violet-50 border-violet-400 text-violet-800 hover:bg-violet-100",
    "Other": "bg-stone-50 border-stone-400 text-stone-700 hover:bg-stone-100"
};

// Password validation helper
export const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasDigit = /\d/.test(password);
    return {
        isValid: minLength && hasDigit,
        minLength,
        hasDigit
    };
};

// Confidence color helper
export const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (confidence >= 0.6) return 'bg-amber-100 text-amber-700 border-amber-300';
    return 'bg-orange-100 text-orange-700 border-orange-300';
};

export default api;
