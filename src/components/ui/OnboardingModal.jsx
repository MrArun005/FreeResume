import React from 'react';
import { Upload, FileText, X } from 'lucide-react';

const OnboardingModal = ({ onUpload, onCreateNew, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden relative animate-fade-in-up">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                    <X size={24} />
                </button>

                <div className="p-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">How would you like to start?</h2>
                    <p className="text-gray-500 mb-10 text-lg">
                        You can upload your existing resume to auto-fill details or start from scratch.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Option 1: Upload */}
                        <button
                            onClick={onUpload}
                            className="group flex flex-col items-center p-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-500 hover:bg-brand-50 transition-all text-left"
                        >
                            <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Resume</h3>
                            <p className="text-sm text-gray-500 text-center">
                                Parse your existing PDF/DOCX to automatically fill in your details.
                            </p>
                        </button>

                        {/* Option 2: Create New */}
                        <button
                            onClick={onCreateNew}
                            className="group flex flex-col items-center p-8 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-left"
                        >
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileText size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Create New</h3>
                            <p className="text-sm text-gray-500 text-center">
                                Start with a blank slate and fill in your details manually.
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
