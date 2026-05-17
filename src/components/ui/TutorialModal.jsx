import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, FileText, Edit3, PlusCircle, Trash2, Palette, Download } from 'lucide-react';

const TutorialModal = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Paperjet! 🎉",
            icon: <Sparkles className="w-12 h-12" />,
            iconColor: "from-yellow-400 to-orange-500",
            description: "Let's take a quick tour to help you create your perfect resume in minutes.",
            content: (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-brand-50 to-indigo-50 p-4 rounded-xl border border-brand-100">
                            <div className="text-3xl mb-2">🎨</div>
                            <h4 className="font-bold text-gray-900 mb-1">10+ Templates</h4>
                            <p className="text-sm text-gray-600">Professional designs</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                            <div className="text-3xl mb-2">⚡</div>
                            <h4 className="font-bold text-gray-900 mb-1">Real-time</h4>
                            <p className="text-sm text-gray-600">Instant preview</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                            <div className="text-3xl mb-2">📄</div>
                            <h4 className="font-bold text-gray-900 mb-1">PDF Export</h4>
                            <p className="text-sm text-gray-600">High quality</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                            <div className="text-3xl mb-2">🆓</div>
                            <h4 className="font-bold text-gray-900 mb-1">100% Free</h4>
                            <p className="text-sm text-gray-600">No hidden fees</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Choose Your Template",
            icon: <FileText className="w-12 h-12" />,
            iconColor: "from-brand-500 to-indigo-600",
            description: "Browse our professional templates and select the one that fits your style.",
            content: (
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-16 h-16 bg-brand-100 rounded-lg flex items-center justify-center">
                                <div className="text-2xl">📋</div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Template Gallery</h4>
                                <p className="text-sm text-gray-600 mb-3">You'll find templates on the landing page. Each one is optimized for ATS (Applicant Tracking Systems).</p>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-brand-100 text-brand-700 text-xs font-medium rounded-full">Classic</span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Creative</span>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Modern</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-brand-50 to-indigo-50 rounded-xl p-4 border border-brand-200">
                        <p className="text-sm text-brand-900">
                            💡 <strong>Tip:</strong> You can switch templates anytime without losing your content!
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "Edit Your Content",
            icon: <Edit3 className="w-12 h-12" />,
            iconColor: "from-green-500 to-emerald-600",
            description: "Click on any text to edit. Changes appear instantly in the preview.",
            content: (
                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-green-200 shadow-sm">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">✍️</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Click to Edit</h4>
                                <p className="text-xs text-gray-600">All fields are editable - just click and type</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">👁️</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Live Preview</h4>
                                <p className="text-xs text-gray-600">See changes instantly on the right side</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">↕️</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Drag to Reorder</h4>
                                <p className="text-xs text-gray-600">Drag sections to rearrange them</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Add & Delete Sections",
            icon: <PlusCircle className="w-12 h-12" />,
            iconColor: "from-purple-500 to-pink-600",
            description: "Customize your resume by adding or removing sections as needed.",
            content: (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                                <PlusCircle className="w-5 h-5 text-green-600" />
                                <h4 className="font-bold text-gray-900 text-sm">Add Section</h4>
                            </div>
                            <p className="text-xs text-gray-600">Click "Add Section" button to include:</p>
                            <ul className="mt-2 space-y-1 text-xs text-gray-700">
                                <li>• Work Experience</li>
                                <li>• Education</li>
                                <li>• Skills</li>
                                <li>• Projects</li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Trash2 className="w-5 h-5 text-red-600" />
                                <h4 className="font-bold text-gray-900 text-sm">Delete Section</h4>
                            </div>
                            <p className="text-xs text-gray-600">Click the trash icon to remove unwanted sections</p>
                            <div className="mt-3 p-2 bg-white rounded border border-red-100">
                                <p className="text-xs text-red-700">⚠️ Deleted sections can be re-added anytime</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Customize Your Style",
            icon: <Palette className="w-12 h-12" />,
            iconColor: "from-pink-500 to-rose-600",
            description: "Choose colors and fonts that match your personal brand.",
            content: (
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-xl">🎨</span>
                            Color Themes
                        </h4>
                        <div className="flex gap-2 mb-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg border-2 border-white shadow-sm"></div>
                            <div className="w-10 h-10 bg-green-600 rounded-lg border-2 border-white shadow-sm"></div>
                            <div className="w-10 h-10 bg-purple-600 rounded-lg border-2 border-white shadow-sm"></div>
                            <div className="w-10 h-10 bg-orange-600 rounded-lg border-2 border-white shadow-sm"></div>
                            <div className="w-10 h-10 bg-red-600 rounded-lg border-2 border-white shadow-sm"></div>
                        </div>
                        <p className="text-sm text-gray-600">Pick from pre-designed color palettes or create your own!</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-700">
                            <strong>Pro Tip:</strong> Stick to 1-2 colors for a professional look. Blue and green are most popular with employers.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "Download as PDF",
            icon: <Download className="w-12 h-12" />,
            iconColor: "from-indigo-500 to-blue-600",
            description: "Export your resume as a high-quality PDF ready for applications.",
            content: (
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                                <Download className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Download PDF Button</h4>
                                <p className="text-sm text-gray-600 mb-3">Look for the download button in the toolbar. Your resume will be exported as a PDF file.</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span>ATS-friendly format</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span>Print-ready quality</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span>No watermarks</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "You're All Set! 🎊",
            icon: <Sparkles className="w-12 h-12" />,
            iconColor: "from-green-500 to-emerald-600",
            description: "You now know everything to create an amazing resume. Good luck with your job search!",
            content: (
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 text-center">
                        <div className="text-5xl mb-3">🚀</div>
                        <h4 className="font-bold text-gray-900 text-lg mb-2">Start Creating!</h4>
                        <p className="text-gray-600 mb-4">Your perfect resume is just a few clicks away.</p>
                        <div className="inline-block px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium">
                            Ready to impress employers
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="text-2xl mb-1">💼</div>
                            <p className="text-xs text-gray-600">Land your dream job</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="text-2xl mb-1">⭐</div>
                            <p className="text-xs text-gray-600">Stand out</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="text-2xl mb-1">🎯</div>
                            <p className="text-xs text-gray-600">Get interviews</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const currentStepData = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (!isLastStep) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (!isFirstStep) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinish = () => {
        localStorage.setItem('tutorialCompleted', 'true');
        onClose();
    };

    const handleSkip = () => {
        localStorage.setItem('tutorialCompleted', 'true');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden relative animate-fade-in-up">
                {/* Close Button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10"
                    aria-label="Close tutorial"
                >
                    <X size={24} />
                </button>

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    ></div>
                </div>

                {/* Content */}
                <div className="p-8 pt-12">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className={`w-20 h-20 bg-gradient-to-br ${currentStepData.iconColor} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                            {currentStepData.icon}
                        </div>
                    </div>

                    {/* Title & Description */}
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">{currentStepData.title}</h2>
                        <p className="text-gray-600 text-lg">{currentStepData.description}</p>
                    </div>

                    {/* Step Content */}
                    <div className="mb-8">
                        {currentStepData.content}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Skip Button */}
                        <button
                            onClick={handleSkip}
                            className="text-gray-500 hover:text-gray-700 text-sm font-medium transition"
                        >
                            Skip Tutorial
                        </button>

                        {/* Step Indicator */}
                        <div className="flex items-center gap-2">
                            {steps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                        ? 'w-6 bg-blue-600'
                                        : index < currentStep
                                            ? 'bg-blue-300'
                                            : 'bg-gray-200'
                                        }`}
                                ></div>
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-2">
                            {!isFirstStep && (
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                                >
                                    <ChevronLeft size={18} />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center gap-2"
                            >
                                {isLastStep ? (
                                    <>
                                        <Check size={18} />
                                        Get Started
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialModal;
