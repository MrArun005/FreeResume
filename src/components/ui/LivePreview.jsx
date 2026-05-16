import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { GlowingEffect } from './glowing-effect';

const LivePreview = ({ onStartBuilding }) => {
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [email, setEmail] = useState('');

    return (
        <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-bold mb-4">
                        <Sparkles size={16} />
                        <span>Interactive Demo</span>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Try It Yourself
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        See your resume update in real-time as you type. No sign-up required!
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
                    {/* Input Section */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Enter Your Information
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Type to see the preview update instantly →
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 outline-none transition-all"
                                    placeholder="e.g., John Smith"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Job Title *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 outline-none transition-all"
                                    placeholder="e.g., Software Engineer"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 outline-none transition-all"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            {/* Info Box */}
                            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 mt-6">
                                <p className="text-sm text-teal-900 dark:text-teal-200">
                                    <strong>💡 This is just a preview!</strong> Your actual resume will have
                                    complete sections for experience, education, skills, and more.
                                </p>
                            </div>

                            {/* CTA Button */}
                            <div className="pt-4">
                                <button
                                    onClick={onStartBuilding}
                                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                                >
                                    Continue Building My Resume
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                                    100% Free • No Sign-Up Required
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Live Preview Section */}
                    <div className="lg:sticky lg:top-24">
                        <div className="relative bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                            <GlowingEffect
                                spread={40}
                                glow={true}
                                disabled={false}
                                proximity={64}
                                inactiveZone={0.01}
                                borderWidth={3}
                            />
                            <div className="relative z-10">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles size={16} className="text-teal-500" />
                                        Live Preview
                                    </h3>
                                    {(name || title || email) && (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            Updating...
                                        </span>
                                    )}
                                </div>

                                {/* Mini Resume Preview */}
                                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-inner transition-colors duration-300">
                                    <div className="space-y-4">
                                        {/* Name Preview with Animation */}
                                        <h1 className={`text-3xl font-bold text-gray-900 dark:text-white transition-all duration-300 ${name ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                                            {name || 'Your Name'}
                                        </h1>

                                        {/* Title Preview with Animation */}
                                        <p className={`text-lg text-teal-600 dark:text-teal-400 font-medium transition-all duration-300 ${title ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                                            {title || 'Your Job Title'}
                                        </p>

                                        {/* Email Preview */}
                                        {email && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 transition-all duration-300 animate-fade-in-up">
                                                📧 {email}
                                            </p>
                                        )}

                                        {/* Placeholder Professional Summary */}
                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                                Professional Summary
                                            </h3>
                                            <div className="space-y-2">
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-11/12"></div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-10/12"></div>
                                            </div>
                                        </div>

                                        {/* Placeholder Experience */}
                                        <div className="pt-4">
                                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                                Experience
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Placeholder Skills */}
                                        <div className="pt-4">
                                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                                Skills
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4'].map((skill, i) => (
                                                    <div key={i} className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-medium rounded-full">
                                                        {skill}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center flex items-center justify-center gap-1">
                                    <Sparkles size={12} className="text-teal-500" />
                                    Your resume updates instantly as you type
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Stats Below */}
                <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
                        <div className="text-4xl font-bold text-teal-600 mb-2">30s</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Average Build Time</div>
                    </div>
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
                        <div className="text-4xl font-bold text-emerald-600 mb-2">100%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Free Forever</div>
                    </div>
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
                        <div className="text-4xl font-bold text-teal-600 mb-2">ATS</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Optimized Templates</div>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default LivePreview;
