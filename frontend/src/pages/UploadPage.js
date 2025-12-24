import React, { useState, useEffect } from 'react';
import { AlertCircle, Upload, FolderOpen, FileText, LogOut, Search, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import api, { getConfidenceColor } from '../services/api';
import { ThemeToggle, Logo } from '../components/shared';
import { useToast } from '../components/Toast';

// Typewriter Effect Component
const TypewriterText = ({ text, speed = 50 }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text, speed]);

    useEffect(() => {
        setDisplayText('');
        setCurrentIndex(0);
    }, [text]);

    return (
        <span>
            {displayText}
            <span className="animate-pulse">|</span>
        </span>
    );
};

// Processing Indicator Component with enhanced animations
const ProcessingIndicator = ({ filesCount }) => (
    <div className="fixed inset-0 bg-brown-800/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-cream-50 dark:bg-dark-300 rounded-2xl p-8 max-w-md w-full mx-4 text-center card-shadow-lg border border-cream-300 dark:border-dark-400 animate-scaleIn glass">
            <div className="relative inline-block">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-golden-400 to-golden-600 flex items-center justify-center animate-pulse-slow">
                    <FileText className="w-10 h-10 text-cream-50" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-brown-700 dark:bg-golden-500 rounded-full flex items-center justify-center animate-bounce">
                    <Search className="w-3 h-3 text-cream-50" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-brown-700 dark:text-cream-100 mt-6">Processing Documents</h3>
            <p className="text-brown-500 dark:text-cream-300 mt-2">Analyzing {filesCount} document{filesCount !== 1 ? 's' : ''} with AI...</p>
            <div className="mt-4 text-sm text-brown-400 dark:text-cream-300">
                <TypewriterText text="Extracting text → Analyzing content → Classifying..." speed={40} />
            </div>
            <div className="mt-6 flex justify-center gap-1">
                <div className="w-2 h-2 bg-golden-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-golden-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-golden-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    </div>
);

// Feature Card Component with hover effect
const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
    <div
        className="bg-cream-100/50 dark:bg-dark-400/50 rounded-xl p-4 border border-cream-300 dark:border-dark-500 hover:bg-cream-100 dark:hover:bg-dark-400 transition-all card-hover animate-slideUp"
        style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: 'forwards' }}
    >
        <div className="w-10 h-10 bg-gradient-to-br from-golden-400 to-golden-600 rounded-lg flex items-center justify-center mb-3">
            <Icon className="w-5 h-5 text-cream-50" />
        </div>
        <h4 className="font-semibold text-brown-700 dark:text-cream-100 mb-1">{title}</h4>
        <p className="text-sm text-brown-500 dark:text-cream-300">{description}</p>
    </div>
);

// Upload Page - Handles file upload
const UploadPage = ({ token, username, onNavigate, onLogout }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [uploadResults, setUploadResults] = useState(null);
    const toast = useToast();

    const allowedExtensions = ['.pdf', '.docx'];
    const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);

        if (selected.length > 5) {
            setError('Maximum 5 files allowed per upload');
            toast.warning('Maximum 5 files allowed per upload');
            return;
        }

        const validFiles = selected.filter(f => {
            const ext = '.' + f.name.split('.').pop().toLowerCase();
            return allowedExtensions.includes(ext) || allowedMimeTypes.includes(f.type);
        });

        if (validFiles.length !== selected.length) {
            setError('Only PDF and DOCX files are allowed');
            toast.warning('Only PDF and DOCX files are allowed');
            return;
        }

        setFiles(validFiles);
        setError('');
        setUploadResults(null);
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setError('Please select at least one document');
            toast.warning('Please select at least one document');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const result = await api.uploadDocuments(files, token);
            if (result.error || result.detail) {
                setError(result.error || result.detail);
                toast.error(result.error || result.detail);
            } else {
                setUploadResults(result.results);
                setFiles([]);
                toast.success(`Successfully classified ${result.results.length} document${result.results.length > 1 ? 's' : ''}!`);
            }
        } catch (err) {
            setError('Upload failed. Please try again.');
            toast.error('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen paper-texture">
            {uploading && <ProcessingIndicator filesCount={files.length} />}

            {/* Navigation Bar - Logo is clickable but stays on upload page */}
            <nav className="bg-cream-50/95 dark:bg-dark-300/95 backdrop-blur-sm border-b border-cream-300 dark:border-dark-400 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Logo size="small" onClick={() => onNavigate('upload')} />
                    <div className="flex items-center gap-4">
                        <span className="text-brown-600 dark:text-cream-300 hidden sm:block">
                            Welcome, <strong className="text-brown-700 dark:text-cream-100">{username}</strong>
                        </span>
                        <button
                            onClick={() => onNavigate('organized')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                        >
                            <FolderOpen className="w-4 h-4" />
                            <span className="hidden sm:inline">View Documents</span>
                        </button>
                        <ThemeToggle />
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-cream-50 dark:bg-dark-300 rounded-2xl card-shadow-lg p-8 border border-cream-300 dark:border-dark-400 animate-slideUp">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-brown-700 dark:text-cream-100">Upload Documents</h2>
                        <p className="text-brown-500 dark:text-cream-300 mt-2">
                            Let AI classify and organize your documents instantly
                        </p>
                    </div>

                    {/* Animated tip */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-golden-50 to-amber-50 dark:from-golden-600/20 dark:to-amber-600/20 rounded-xl border border-golden-200 dark:border-golden-600/30 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-2 text-golden-700 dark:text-golden-400">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span className="font-medium">Pro Tip:</span>
                            <span className="text-golden-600 dark:text-golden-300">Upload multiple documents at once for batch classification!</span>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-cream-300 dark:border-dark-500 rounded-2xl p-12 text-center hover:border-golden-400 dark:hover:border-golden-500 hover:bg-cream-100/50 dark:hover:bg-dark-400/50 transition-all cursor-pointer group card-hover">
                        <input
                            type="file"
                            accept=".pdf,.docx"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-golden-400 to-golden-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform group-hover:animate-glow">
                                <Upload className="w-10 h-10 text-cream-50" />
                            </div>
                            <p className="text-lg font-semibold text-brown-700 dark:text-cream-100 mt-6">
                                Click to select files
                            </p>
                            <p className="text-brown-500 dark:text-cream-300 mt-2">or drag and drop your documents</p>
                            <div className="flex items-center justify-center gap-3 mt-4">
                                <span className="px-3 py-1 bg-cream-200 dark:bg-dark-400 text-brown-600 dark:text-cream-200 rounded-full text-sm font-medium">
                                    PDF
                                </span>
                                <span className="px-3 py-1 bg-cream-200 dark:bg-dark-400 text-brown-600 dark:text-cream-200 rounded-full text-sm font-medium">
                                    DOCX
                                </span>
                                <span className="px-3 py-1 bg-golden-100 dark:bg-golden-600/30 text-golden-700 dark:text-golden-300 rounded-full text-sm font-medium">
                                    Max 5 files
                                </span>
                            </div>
                        </label>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-6 animate-slideUp">
                            <h3 className="font-semibold text-brown-700 dark:text-cream-100 mb-3">Selected Files ({files.length}/5)</h3>
                            <div className="space-y-2">
                                {files.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-4 bg-cream-100 dark:bg-dark-400 rounded-xl border border-cream-300 dark:border-dark-500 card-hover animate-slideUp"
                                        style={{ animationDelay: `${idx * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-brown-500 to-brown-700 rounded-lg flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-cream-50" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-brown-700 dark:text-cream-100">{file.name}</p>
                                                <p className="text-sm text-brown-500 dark:text-cream-300">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(idx)}
                                            className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors hover:scale-110"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Results */}
                    {uploadResults && (
                        <div className="mt-6 p-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-700 animate-scaleIn">
                            <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Classification Complete!
                            </h3>
                            <div className="space-y-3">
                                {uploadResults.map((result, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 bg-white dark:bg-dark-400 rounded-lg border border-emerald-100 dark:border-emerald-800 animate-slideUp"
                                        style={{ animationDelay: `${idx * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-brown-600 dark:text-cream-200" />
                                            <span className="font-medium text-brown-700 dark:text-cream-100">{result.filename}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-brown-100 dark:bg-dark-300 text-brown-700 dark:text-cream-200 rounded-full text-sm font-medium">
                                                {result.category}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getConfidenceColor(result.confidence)}`}>
                                                {(result.confidence * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => onNavigate('organized')}
                                className="mt-4 w-full py-3 bg-emerald-600 dark:bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all btn-glow"
                            >
                                View Organized Documents →
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 animate-shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {!uploadResults && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading || files.length === 0}
                            className="mt-8 w-full bg-gradient-to-r from-brown-600 to-brown-700 dark:from-golden-600 dark:to-golden-700 text-cream-50 py-4 rounded-xl font-semibold hover:from-brown-700 hover:to-brown-800 dark:hover:from-golden-700 dark:hover:to-golden-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg flex items-center justify-center gap-3 btn-glow"
                        >
                            <Upload className="w-5 h-5" />
                            Upload & Classify Documents
                        </button>
                    )}
                </div>

                {/* Features showcase when no files */}
                {files.length === 0 && !uploadResults && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FeatureCard
                            icon={Search}
                            title="Smart Classification"
                            description="AI analyzes document content to categorize automatically"
                            delay={100}
                        />
                        <FeatureCard
                            icon={FolderOpen}
                            title="Organized View"
                            description="Browse documents by category in a clean interface"
                            delay={200}
                        />
                        <FeatureCard
                            icon={Sparkles}
                            title="Instant Results"
                            description="Get classification results in seconds"
                            delay={300}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadPage;
