import React from 'react';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
    {
        id: 1,
        name: "Varun M.",
        role: "Master of Computer Architecture",
        initials: "VM",
        rating: 5,
        text: "Finally found a resume builder that's actually free! No hidden fees, no watermarks. The ATS-friendly templates helped me get past screening and land 3 interviews in one week.",
        date: "November 2025"
    },
    {
        id: 2,
        name: "Loading!",
        role: "Loading",
        initials: "",
        rating: 5,
        text: "Loading",
        date: "November 2025"
    },
    {
        id: 3,
        name: "Loading!",
        role: "Loading",
        initials: "",
        rating: 5,
        text: "Loading",
        date: "November 2025"
    }
];

const Testimonials = () => {
    return (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-transparent dark:to-transparent transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm font-bold mb-4">
                        <Star size={16} className="fill-current" />
                        <span>Trusted by Job Seekers</span>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        What Our Users Say
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Real feedback from people who built their resumes with our free tool
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-6 text-teal-50 dark:text-slate-700 group-hover:text-teal-100 dark:group-hover:text-slate-600 transition-colors">
                                <Quote size={48} fill="currentColor" />
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-4 relative z-10">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className="fill-yellow-400 text-yellow-400"
                                    />
                                ))}
                            </div>

                            {/* Testimonial Text */}
                            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed relative z-10">
                                "{testimonial.text}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                {/* Initial Avatar */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {testimonial.initials}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-3 relative z-10">
                                {testimonial.date}
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </section>
    );
};

export default Testimonials;
