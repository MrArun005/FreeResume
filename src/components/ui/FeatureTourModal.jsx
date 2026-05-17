import React, { useState } from 'react';
import { X, ChevronRight, CheckCircle, Sparkles, Briefcase, FileText, Download } from 'lucide-react';

const FeatureTourModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const steps = [
        {
            title: "Welcome to Your AI Job Assistant!",
            description: "We've upgraded your resume builder with powerful AI tools to help you land your dream job faster.",
            icon: <Sparkles size={48} className="text-brand-500" />,
            image: null
        },
        {
            title: "Tailor Your Resume Instantly",
            description: "Paste a job link or description, and our AI will rewrite your resume to match the job requirements perfectly. Look for the 'Tailor Resume' button.",
            icon: <Briefcase size={48} className="text-purple-500" />,
            highlight: "Tailor Resume"
        },
        {
            title: "Check Your ATS Score",
            description: "Get detailed feedback on how well your resume parses. We'll show you exactly what to fix to beat the bots.",
            icon: <CheckCircle size={48} className="text-green-500" />,
            highlight: "ATS Score"
        },
        {
            title: "Download & Apply",
            description: "Download your resume as a Word doc or PDF. Use the 'Printer' icon for the best visual quality PDF.",
            icon: <Download size={48} className="text-orange-500" />,
            highlight: "Download"
        }
    ];

    const currentStep = steps[step];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <X size={20} className="text-gray-400" />
                </button>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-100 w-full">
                    <div
                        className="h-full bg-brand-600 transition-all duration-300"
                        style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    />
                </div>

                <div className="p-8 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                        {currentStep.icon}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {currentStep.title}
                    </h2>

                    <p className="text-gray-600 leading-relaxed mb-8">
                        {currentStep.description}
                    </p>

                    <button
                        onClick={handleNext}
                        className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-brand-200"
                    >
                        {step === steps.length - 1 ? "Get Started" : "Next"}
                        {step < steps.length - 1 && <ChevronRight size={18} />}
                    </button>

                    <div className="mt-6 flex gap-2 justify-center">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-brand-600' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureTourModal;
