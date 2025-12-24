import React, { useState, useEffect } from 'react';
import { AlertCircle, Upload, FolderOpen, FileText, LogOut, Search, CheckCircle, Sparkles, MessageSquare, X, Loader2, Trash2, Download, Archive } from 'lucide-react';
import api, { quotes, categoryColors } from '../services/api';
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
                <Sparkles className="w-5 h-5 text-golden-500 flex-shrink-0 mt-1 animate-pulse" />
                <div>
                    <p className="text-brown-600 dark:text-cream-200 italic text-lg">"{quotes[quoteIndex].text}"</p>
                    <p className="text-brown-400 dark:text-cream-300 text-sm mt-1">— {quotes[quoteIndex].author}</p>
                </div>
            </div>
        </div>
    );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, doc, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-brown-800/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-cream-50 dark:bg-dark-300 rounded-2xl p-6 max-w-md w-full card-shadow-lg border border-cream-300 dark:border-dark-400 animate-scaleIn">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-brown-700 dark:text-cream-100">Delete Document?</h3>
                        <p className="text-sm text-brown-500 dark:text-cream-300">{doc?.filename}</p>
                    </div>
                </div>
                <p className="text-brown-600 dark:text-cream-200 mb-6">
                    This action cannot be undone. The document will be permanently deleted.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 px-4 border-2 border-cream-300 dark:border-dark-400 text-brown-700 dark:text-cream-100 rounded-xl font-semibold hover:bg-cream-100 dark:hover:bg-dark-400 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// Summary Modal Component
const SummaryModal = ({ isOpen, onClose, summary, loading, error, filename }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-brown-800/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-cream-50 dark:bg-dark-300 rounded-2xl card-shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden border border-cream-300 dark:border-dark-400 animate-scaleIn glass">
                <div className="flex items-center justify-between p-6 border-b border-cream-300 dark:border-dark-400">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-brown-700 dark:text-cream-100">AI Summary</h3>
                            <p className="text-sm text-brown-500 dark:text-cream-300">{filename}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-cream-200 dark:hover:bg-dark-400 rounded-lg transition-all">
                        <X className="w-5 h-5 text-brown-600 dark:text-cream-200" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-12 h-12 text-golden-500 animate-spin" />
                            <p className="mt-4 text-brown-600 dark:text-cream-200">Generating AI summary...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
                            <div className="flex items-center gap-2 font-semibold mb-2">
                                <AlertCircle className="w-5 h-5" />Error
                            </div>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {!loading && !error && summary && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-brown-700 dark:text-cream-100 mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-golden-500" />Summary
                                </h4>
                                <p className="text-brown-600 dark:text-cream-200 bg-cream-100 dark:bg-dark-400 p-4 rounded-xl border border-cream-300 dark:border-dark-500">
                                    {summary.summary}
                                </p>
                            </div>

                            {summary.key_points && summary.key_points.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-brown-700 dark:text-cream-100 mb-2">Key Points</h4>
                                    <ul className="space-y-2">
                                        {summary.key_points.map((point, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-brown-600 dark:text-cream-200">
                                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {summary.document_type && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-brown-500 dark:text-cream-300">Document Type:</span>
                                    <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium">
                                        {summary.document_type}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-cream-300 dark:border-dark-400 bg-cream-100/50 dark:bg-dark-400/50">
                    <button onClick={onClose} className="w-full py-3 bg-brown-600 dark:bg-golden-600 text-white rounded-xl font-semibold hover:bg-brown-700 dark:hover:bg-golden-700 transition-all">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Organized Page
const OrganizedPage = ({ token, username, onNavigate, onLogout }) => {
    const [categories, setCategories] = useState({});
    const [documents, setDocuments] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [summaryModal, setSummaryModal] = useState({ isOpen: false, loading: false, summary: null, error: null, filename: '' });
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, doc: null });
    const [downloading, setDownloading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const result = await api.getCategories(token);
            if (result.categories) {
                setCategories(result.categories);
            }
        } catch (err) {
            console.error('Failed to load categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadDocuments = async (category) => {
        setSelectedCategory(category);
        setSearchQuery('');
        try {
            const result = await api.getDocuments(category, token);
            if (result.documents) {
                setDocuments(result.documents);
            }
        } catch (err) {
            console.error('Failed to load documents:', err);
        }
    };

    const handleSummarize = async (doc) => {
        setSummaryModal({ isOpen: true, loading: true, summary: null, error: null, filename: doc.filename });
        try {
            const result = await api.summarizeDocument(doc.id, token);
            if (result.success) {
                setSummaryModal(prev => ({ ...prev, loading: false, summary: result }));
            } else {
                setSummaryModal(prev => ({ ...prev, loading: false, error: result.error || 'Failed to generate summary' }));
            }
        } catch (err) {
            setSummaryModal(prev => ({ ...prev, loading: false, error: 'Failed to connect to LLM service' }));
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm.doc) return;
        try {
            const result = await api.deleteDocument(deleteConfirm.doc.id, token);
            if (result.message) {
                setDocuments(docs => docs.filter(d => d.id !== deleteConfirm.doc.id));
                setCategories(cats => ({
                    ...cats,
                    [selectedCategory]: Math.max(0, (cats[selectedCategory] || 1) - 1)
                }));
                toast.success('Document deleted', 2000);
            }
        } catch (err) {
            toast.error('Failed to delete document');
        }
        setDeleteConfirm({ isOpen: false, doc: null });
    };

    const handleDownloadZip = async () => {
        setDownloading(true);
        try {
            const blob = await api.downloadZip(token);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `documents_${username}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            toast.success('Download started!', 2000);
        } catch (err) {
            toast.error(err.message || 'Failed to download');
        }
        setDownloading(false);
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
        if (confidence >= 0.6) return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
        return 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300';
    };

    const filteredDocuments = documents.filter(doc =>
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalDocs = Object.values(categories).reduce((sum, count) => sum + count, 0);

    return (
        <div className="min-h-screen paper-texture">
            {/* Navigation Bar */}
            <nav className="bg-cream-50/95 dark:bg-dark-300/95 backdrop-blur-sm border-b border-cream-300 dark:border-dark-400 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    {/* Clickable Logo - navigates to upload page */}
                    <Logo size="small" onClick={() => onNavigate('upload')} />

                    <div className="flex items-center gap-4">
                        <span className="text-brown-600 dark:text-cream-300 hidden sm:block">
                            Welcome, <strong className="text-brown-700 dark:text-cream-100">{username}</strong>
                        </span>
                        <ThemeToggle />
                        <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-8">
                {/* Header with Action Buttons - No back button needed */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-brown-700 dark:text-cream-100">Your Document Collection</h2>
                        <p className="text-brown-500 dark:text-cream-300 mt-1">
                            {totalDocs > 0 ? `${totalDocs} document${totalDocs !== 1 ? 's' : ''} organized across ${Object.keys(categories).length} categories` : 'Upload documents to get started'}
                        </p>
                    </div>

                    {/* Aesthetic Action Buttons - Premium Design */}
                    <div className="flex flex-wrap items-center gap-4">
                        {totalDocs > 0 && (
                            <button
                                onClick={handleDownloadZip}
                                disabled={downloading}
                                className="group relative flex items-center gap-3 px-6 py-3.5 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                            >
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                                <div className="relative flex items-center gap-3">
                                    {downloading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <div className="p-1.5 bg-white/20 rounded-lg">
                                            <Archive className="w-4 h-4" />
                                        </div>
                                    )}
                                    <span>{downloading ? 'Preparing...' : 'Download All'}</span>
                                </div>
                            </button>
                        )}

                        <button
                            onClick={() => onNavigate('upload')}
                            className="group relative flex items-center gap-3 px-6 py-3.5 bg-gradient-to-br from-brown-600 via-brown-700 to-brown-800 dark:from-golden-500 dark:via-golden-600 dark:to-amber-600 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-brown-500/25 dark:shadow-golden-500/25 hover:shadow-xl hover:shadow-brown-500/40 dark:hover:shadow-golden-500/40 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                        >
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                            <div className="relative flex items-center gap-3">
                                <div className="p-1.5 bg-white/20 rounded-lg">
                                    <Upload className="w-4 h-4" />
                                </div>
                                <span>Upload More</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Quote */}
                <div className="mb-8 p-6 bg-cream-50 dark:bg-dark-300 rounded-xl border border-cream-300 dark:border-dark-400 card-shadow">
                    <AnimatedQuote />
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-golden-400 to-golden-600 rounded-2xl flex items-center justify-center animate-pulse-slow">
                            <FolderOpen className="w-8 h-8 text-cream-50" />
                        </div>
                        <p className="mt-4 text-brown-600 dark:text-cream-200">Loading your documents...</p>
                    </div>
                ) : (
                    <>
                        {/* Category Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {Object.entries(categories).map(([category, count]) => (
                                <button
                                    key={category}
                                    onClick={() => loadDocuments(category)}
                                    className={`p-6 rounded-2xl border-2 ${categoryColors[category] || categoryColors["Other"]} transition-all card-hover ${selectedCategory === category ? 'ring-2 ring-golden-500 ring-offset-2 dark:ring-offset-dark-50' : ''}`}
                                >
                                    <FolderOpen className="w-12 h-12 mx-auto mb-3" />
                                    <h3 className="font-bold text-lg mb-1">{category}</h3>
                                    <p className="text-sm opacity-75">{count} document{count !== 1 ? 's' : ''}</p>
                                </button>
                            ))}
                        </div>

                        {/* Documents List */}
                        {selectedCategory && (
                            <div className="bg-cream-50 dark:bg-dark-300 rounded-2xl card-shadow-lg p-8 border border-cream-300 dark:border-dark-400">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-brown-700 dark:text-cream-100">{selectedCategory} Documents</h3>
                                    <button onClick={() => setSelectedCategory(null)} className="text-brown-500 dark:text-cream-300 hover:text-brown-700 dark:hover:text-cream-100 transition-colors">
                                        Clear selection
                                    </button>
                                </div>

                                {documents.length > 0 && (
                                    <div className="mb-6">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brown-400 dark:text-cream-300" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search documents..."
                                                className="w-full pl-12 pr-4 py-3 border-2 border-cream-300 dark:border-dark-500 rounded-xl bg-white dark:bg-dark-400 text-brown-700 dark:text-cream-100 focus:border-golden-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {documents.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FolderOpen className="w-16 h-16 text-cream-300 dark:text-dark-500 mx-auto mb-4" />
                                        <p className="text-brown-500 dark:text-cream-300">No documents in this category</p>
                                    </div>
                                ) : filteredDocuments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Search className="w-16 h-16 text-cream-300 dark:text-dark-500 mx-auto mb-4" />
                                        <p className="text-brown-500 dark:text-cream-300">No documents match "{searchQuery}"</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredDocuments.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-4 bg-cream-100 dark:bg-dark-400 rounded-xl border border-cream-300 dark:border-dark-500 card-hover">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-brown-500 to-brown-700 dark:from-golden-500 dark:to-golden-700 rounded-xl flex items-center justify-center">
                                                        <FileText className="w-6 h-6 text-cream-50" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-brown-700 dark:text-cream-100">{doc.filename}</p>
                                                        <p className="text-sm text-brown-500 dark:text-cream-300">{new Date(doc.timestamp).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleSummarize(doc)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-violet-700 transition-all shadow-md btn-glow"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span className="hidden sm:inline">AI Summary</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm({ isOpen: true, doc })}
                                                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getConfidenceColor(doc.confidence)}`}>
                                                        {(doc.confidence * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Empty States */}
                        {!selectedCategory && totalDocs === 0 && (
                            <div className="text-center py-16 bg-cream-50 dark:bg-dark-300 rounded-2xl card-shadow border border-cream-300 dark:border-dark-400">
                                <FolderOpen className="w-20 h-20 text-cream-300 dark:text-dark-500 mx-auto mb-4 animate-float" />
                                <p className="text-xl text-brown-600 dark:text-cream-200 font-medium">No documents yet</p>
                                <button onClick={() => onNavigate('upload')} className="mt-6 px-8 py-3 bg-gradient-to-r from-golden-500 to-golden-600 text-white rounded-xl font-semibold hover:from-golden-600 hover:to-golden-700 transition-all shadow-lg">
                                    Upload Documents
                                </button>
                            </div>
                        )}

                        {!selectedCategory && totalDocs > 0 && (
                            <div className="text-center py-16 bg-cream-50 dark:bg-dark-300 rounded-2xl card-shadow border border-cream-300 dark:border-dark-400">
                                <FolderOpen className="w-20 h-20 text-cream-300 dark:text-dark-500 mx-auto mb-4 animate-float" />
                                <p className="text-xl text-brown-500 dark:text-cream-300">Select a category above to view documents</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <SummaryModal
                isOpen={summaryModal.isOpen}
                onClose={() => setSummaryModal({ isOpen: false, loading: false, summary: null, error: null, filename: '' })}
                summary={summaryModal.summary}
                loading={summaryModal.loading}
                error={summaryModal.error}
                filename={summaryModal.filename}
            />

            <DeleteModal
                isOpen={deleteConfirm.isOpen}
                doc={deleteConfirm.doc}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, doc: null })}
            />
        </div>
    );
};

export default OrganizedPage;
