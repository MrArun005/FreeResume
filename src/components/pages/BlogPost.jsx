import React from 'react';
import { ArrowLeft, Calendar, Clock, Tag, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import { BLOG_POSTS } from '../../constants/blogPosts';

const BlogPost = ({ postId, onBack }) => {
    const post = BLOG_POSTS.find((p) => p.id === postId);

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
                    <button onClick={onBack} className="text-indigo-600 hover:text-indigo-700">
                        ← Back to blog
                    </button>
                </div>
            </div>
        );
    }

    const shareUrl = window.location.href;
    const shareTitle = post.title;

    const shareOnTwitter = () => {
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
            '_blank'
        );
    };

    const shareOnLinkedIn = () => {
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            '_blank'
        );
    };

    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Home</span>
                    </button>

                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                            {post.category}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>
                                {new Date(post.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>{post.readTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">By {post.author}</span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <Tag size={16} className="text-gray-400" />
                        {post.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Share buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Share:</span>
                        <button
                            onClick={shareOnTwitter}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Share on Twitter"
                        >
                            <Twitter size={18} />
                        </button>
                        <button
                            onClick={shareOnLinkedIn}
                            className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Share on LinkedIn"
                        >
                            <Linkedin size={18} />
                        </button>
                        <button
                            onClick={shareOnFacebook}
                            className="p-2 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Share on Facebook"
                        >
                            <Facebook size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            {post.image && (
                <div className="max-w-4xl mx-auto px-6 -mb-12 relative z-10">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-96 object-cover rounded-xl shadow-2xl"
                    />
                </div>
            )}

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-16 bg-white mt-16 rounded-t-3xl">
                <div className="prose prose-lg max-w-none">
                    {post.content.split('\n').map((paragraph, idx) => {
                        // Handle headings
                        if (paragraph.startsWith('## ')) {
                            return (
                                <h2 key={idx} className="text-3xl font-bold text-gray-900 mt-12 mb-6">
                                    {paragraph.replace('## ', '')}
                                </h2>
                            );
                        }

                        // Handle bold text
                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                            return (
                                <p key={idx} className="text-xl font-bold text-gray-900 mt-6 mb-4">
                                    {paragraph.replace(/\*\*/g, '')}
                                </p>
                            );
                        }

                        // Handle bullet points
                        if (paragraph.startsWith('- ')) {
                            return (
                                <li key={idx} className="text-gray-700 leading-relaxed ml-6 mb-2">
                                    {paragraph.replace('- ', '').replace(/\*\*/g, '').replace(/\*/g, '')}
                                </li>
                            );
                        }

                        // Handle emoji checkmarks and crosses
                        if (paragraph.includes('✅') || paragraph.includes('❌')) {
                            return (
                                <p key={idx} className="text-gray-700 leading-relaxed mb-3">
                                    {paragraph}
                                </p>
                            );
                        }

                        // Regular paragraphs
                        if (paragraph.trim()) {
                            return (
                                <p key={idx} className="text-gray-700 text-lg leading-relaxed mb-6">
                                    {paragraph.replace(/\*\*/g, '').replace(/\*/g, '')}
                                </p>
                            );
                        }

                        return null;
                    })}
                </div>

                {/* CTA Section */}
                <div className="mt-16 p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white">
                    <h3 className="text-2xl font-bold mb-4">Ready to Create Your Perfect Resume?</h3>
                    <p className="text-white/90 mb-6 text-lg">
                        Use our free, ATS-friendly resume builder to create a professional resume in minutes.
                        No credit card required.
                    </p>
                    <button
                        onClick={onBack}
                        className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Get Started Free →
                    </button>
                </div>

                {/* Share again at bottom */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-gray-700 font-medium mb-4">
                        Found this helpful? Share it with others:
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={shareOnTwitter}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <Twitter size={18} />
                            <span>Twitter</span>
                        </button>
                        <button
                            onClick={shareOnLinkedIn}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <Linkedin size={18} />
                            <span>LinkedIn</span>
                        </button>
                        <button
                            onClick={shareOnFacebook}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <Facebook size={18} />
                            <span>Facebook</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
