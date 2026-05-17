import React from 'react';
import { X, Linkedin, Heart, Copy, Check } from 'lucide-react';

const ShareModal = ({ isOpen, onClose }) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const shareUrl = window.location.href; // Uses the current deployed URL
    const shareText =
        'I just updated my resume using Paperjet — AI-powered, ATS-friendly, and privacy-first. Try it: ' +
        shareUrl;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-6 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                        <Heart className="fill-white text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold mb-1">Resume Downloaded!</h2>
                    <p className="text-brand-100 text-sm">Good luck with your applications! 🚀</p>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <h3 className="text-gray-900 font-semibold mb-2">Help us keep this tool free?</h3>
                        <p className="text-gray-500 text-sm">
                            We don't run ads or sell data. The only way we grow is if you tell your network.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-[#0077b5] hover:bg-[#006396] text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-500/30"
                        >
                            <Linkedin size={20} />
                            Share on LinkedIn
                        </a>

                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors border border-gray-200"
                        >
                            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                            {copied ? 'Copied to Clipboard!' : 'Copy Link to Share'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
