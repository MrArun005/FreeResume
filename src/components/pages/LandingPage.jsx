import { useState, useEffect } from 'react';
import {
    ArrowRight, Check, Sparkles, FileText, Target, Zap, Shield,
    Clock, ArrowUpRight, Menu, X, Github, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import TemplateThumbnail from '../ui/TemplateThumbnail';
import Testimonials from '../ui/Testimonials';
import ScrollToTop from '../ui/ScrollToTop';
import Logo from '../ui/Logo';
import { TEMPLATES } from '../../constants/layouts';
import { BLOG_POSTS } from '../../constants/blogPosts';

// ---- helpers ------------------------------------------------------------

const fadeUp = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
};

const TRUST_POINTS = [
    'Free, forever',
    'No signup',
    'Your data stays local',
];

const FEATURES = [
    {
        icon: Target,
        title: 'Tailor to any job',
        body: 'Paste a job description — AI rewrites your bullets to match what the recruiter is searching for. Without sounding like a robot.',
    },
    {
        icon: Shield,
        title: 'ATS-friendly by default',
        body: 'Every template is structured the way Applicant Tracking Systems actually parse them. So your resume reaches a human, not a junk folder.',
    },
    {
        icon: Sparkles,
        title: 'AI that’s actually helpful',
        body: 'Get an honest ATS score, a real-talk roast, and a one-click rewrite that fixes vague bullets and weak verbs.',
    },
    {
        icon: Zap,
        title: 'Real-time, no lag',
        body: 'Edit on the left, see the polished page on the right. Drag to reorder. Undo anything. Tab through and ship in 20 minutes.',
    },
    {
        icon: FileText,
        title: 'Pixel-perfect PDFs',
        body: 'Selectable text, sharp typography, clean page breaks. The PDF that downloads looks like the preview — because it is the preview.',
    },
    {
        icon: Shield,
        title: 'Privacy-first, by design',
        body: 'Everything saves to your browser. No accounts, no tracking, no scraping. Close the tab, the resume’s still there next time.',
    },
];

const STEPS = [
    {
        n: '01',
        title: 'Pick a template',
        body: 'Browse 15+ ATS-tested layouts. Classic, modern, creative — every one engineered to parse cleanly.',
    },
    {
        n: '02',
        title: 'Fill it in',
        body: 'Live preview as you type. AI helps tighten your bullets, flag weak verbs, and surface keywords from the job post.',
    },
    {
        n: '03',
        title: 'Download & send',
        body: 'High-quality PDF in a click. No watermark, no signup wall, no “unlock pro features” nonsense.',
    },
];

// Category filter list is derived from the registered TEMPLATES so adding/renaming
// categories in src/constants/layouts.js is automatically reflected here.
const CATEGORIES = [
    { id: 'all', label: 'All' },
    ...[...new Set(TEMPLATES.map(t => t.category))].map(c => ({ id: c, label: c })),
];

// ---- component ----------------------------------------------------------

const LandingPage = ({ onSelectTemplate, onViewBlog }) => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [formSubmitState, setFormSubmitState] = useState({ loading: false, success: false, error: null });

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const filteredTemplates = activeCategory === 'all'
        ? TEMPLATES
        : TEMPLATES.filter(t => t.category === activeCategory);

    const featuredPost = BLOG_POSTS[0];

    return (
        <div className="min-h-screen bg-stone-50 text-slate-900 font-clean antialiased selection:bg-brand-600/15 selection:text-brand-900">
            {/* ─────────── NAV ─────────── */}
            <nav className="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-xl border-b border-slate-200/60">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                    <a href="#top" className="group">
                        <Logo className="w-7 h-7" textClassName="text-base" />
                    </a>

                    {/* desktop links */}
                    <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
                        <a href="#templates" className="hover:text-slate-900 transition-colors">Templates</a>
                        <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
                        <a href="#how" className="hover:text-slate-900 transition-colors">How it works</a>
                        <a href="#blog" className="hover:text-slate-900 transition-colors">Blog</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onSelectTemplate(TEMPLATES[0])}
                            className="hidden md:inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-stone-50 text-sm font-medium px-4 py-2 rounded-full transition-all hover:gap-2"
                        >
                            Start building
                            <ArrowRight size={14} />
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 text-slate-700"
                            aria-label="Open menu"
                        >
                            <Menu size={22} />
                        </button>
                    </div>
                </div>

                {/* mobile menu */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 bg-stone-50 z-50 md:hidden flex flex-col">
                        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/60">
                            <Logo className="w-7 h-7" textClassName="text-base" />
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2" aria-label="Close menu">
                                <X size={22} />
                            </button>
                        </div>
                        <div className="flex-1 px-6 py-10 flex flex-col gap-6 text-2xl font-serif-display text-slate-900">
                            <a href="#templates" onClick={() => setMobileMenuOpen(false)}>Templates</a>
                            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
                            <a href="#how" onClick={() => setMobileMenuOpen(false)}>How it works</a>
                            <a href="#blog" onClick={() => setMobileMenuOpen(false)}>Blog</a>
                        </div>
                        <div className="p-6 border-t border-slate-200/60">
                            <button
                                onClick={() => { setMobileMenuOpen(false); onSelectTemplate(TEMPLATES[0]); }}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 text-stone-50 text-base font-medium px-5 py-3 rounded-full"
                            >
                                Start building <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* ─────────── HERO ─────────── */}
            <section id="top" className="pt-20 lg:pt-28 pb-16 lg:pb-24">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8 shadow-sm"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        New: AI roast & ATS score
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="font-serif-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-tight text-slate-900 max-w-4xl"
                    >
                        The résumé you&rsquo;d actually <em className="italic text-brand-700">hire</em> someone for.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed"
                    >
                        Build a polished, ATS-friendly resume in minutes. AI helps tailor it to the job. It&rsquo;s free, no signup, and your data never leaves your browser.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center"
                    >
                        <button
                            onClick={() => onSelectTemplate(TEMPLATES[0])}
                            className="group inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-stone-50 text-base font-medium px-7 py-3.5 rounded-full transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5"
                        >
                            Start building
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <a
                            href="#templates"
                            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 text-base font-medium px-7 py-3.5 rounded-full border border-slate-200 transition-colors"
                        >
                            See templates
                        </a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500"
                    >
                        {TRUST_POINTS.map(p => (
                            <span key={p} className="inline-flex items-center gap-1.5">
                                <Check size={14} className="text-brand-600" />
                                {p}
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* template preview strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                    className="mt-20 lg:mt-28 relative"
                >
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-stone-100 border border-slate-200/60 shadow-sm">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                            <div className="px-6 sm:px-10 pt-10 pb-12 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                                {TEMPLATES.slice(0, 5).map((t, i) => (
                                    <motion.button
                                        key={t.id}
                                        onClick={() => onSelectTemplate(t)}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.5 + i * 0.07 }}
                                        whileHover={{ y: -6 }}
                                        className="group relative aspect-[210/297] rounded-lg overflow-hidden bg-white border border-slate-200 shadow-md hover:shadow-2xl hover:shadow-slate-900/10 transition-shadow"
                                    >
                                        <div className="absolute inset-0">
                                            <TemplateThumbnail layout={t.layout} theme={t.theme} selected={false} />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent text-stone-50 text-[10px] sm:text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            {t.name}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ─────────── FEATURES ─────────── */}
            <section id="features" className="py-24 lg:py-32 bg-white border-y border-slate-200/60">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <motion.div {...fadeUp} className="max-w-2xl mb-16">
                        <div className="text-xs font-semibold text-brand-700 tracking-wide uppercase mb-3">Features</div>
                        <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-slate-900">
                            Quiet on the outside.<br />
                            <em className="italic text-slate-400">Smart on the inside.</em>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200">
                        {FEATURES.map((f) => (
                            <motion.div
                                key={f.title}
                                {...fadeUp}
                                className="bg-white p-8 lg:p-10 hover:bg-stone-50 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-slate-900 text-stone-50 flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors">
                                    <f.icon size={18} strokeWidth={1.8} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">{f.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{f.body}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────── TEMPLATES ─────────── */}
            <section id="templates" className="py-24 lg:py-32">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <motion.div {...fadeUp} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
                        <div className="max-w-2xl">
                            <div className="text-xs font-semibold text-brand-700 tracking-wide uppercase mb-3">Templates</div>
                            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-slate-900">
                                Pick a starting point.<br />
                                <em className="italic text-slate-400">Change anything later.</em>
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setActiveCategory(c.id)}
                                    className={`text-sm px-4 py-2 rounded-full border transition-all ${activeCategory === c.id
                                        ? 'bg-slate-900 text-stone-50 border-slate-900'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7">
                        {filteredTemplates.map((t, i) => (
                            <motion.button
                                key={t.id}
                                onClick={() => onSelectTemplate(t)}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
                                whileHover={{ y: -4 }}
                                className="group text-left"
                            >
                                <div className="aspect-[210/297] rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:shadow-slate-900/10 group-hover:border-slate-300 transition-all relative">
                                    <div className="absolute inset-0">
                                        <TemplateThumbnail layout={t.layout} theme={t.theme} selected={false} />
                                    </div>
                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
                                    <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all">
                                        <ArrowUpRight size={14} className="text-slate-900" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline justify-between gap-2">
                                    <div className="text-sm font-medium text-slate-900 tracking-tight truncate">{t.name}</div>
                                    <div className="text-xs text-slate-500 shrink-0">{t.category}</div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────── HOW IT WORKS ─────────── */}
            <section id="how" className="py-24 lg:py-32 bg-slate-900 text-stone-50 relative overflow-hidden">
                {/* subtle teal glow */}
                <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">
                    <motion.div {...fadeUp} className="max-w-2xl mb-16">
                        <div className="text-xs font-semibold text-brand-400 tracking-wide uppercase mb-3">How it works</div>
                        <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
                            Three steps. <em className="italic text-stone-400">That&rsquo;s all.</em>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
                        {STEPS.map((s) => (
                            <motion.div key={s.n} {...fadeUp} className="bg-slate-900 p-8 lg:p-10">
                                <div className="font-serif-display text-5xl text-brand-400 mb-6">{s.n}</div>
                                <h3 className="text-xl font-semibold mb-3 tracking-tight">{s.title}</h3>
                                <p className="text-sm text-stone-400 leading-relaxed">{s.body}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div {...fadeUp} className="mt-16 text-center">
                        <button
                            onClick={() => onSelectTemplate(TEMPLATES[0])}
                            className="group inline-flex items-center gap-2 bg-stone-50 hover:bg-white text-slate-900 text-base font-medium px-7 py-3.5 rounded-full transition-all hover:gap-3"
                        >
                            Try it now
                            <ArrowRight size={16} />
                        </button>
                        <div className="mt-4 text-sm text-stone-400">No signup. No credit card. Done in 20 minutes.</div>
                    </motion.div>
                </div>
            </section>

            {/* ─────────── STATS / SOCIAL PROOF ─────────── */}
            <section className="py-20 border-y border-slate-200/60 bg-white">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center">
                    {[
                        { stat: '15+', label: 'Templates' },
                        { stat: 'Free', label: 'Forever' },
                        { stat: '0', label: 'Signups required' },
                        { stat: '<20m', label: 'To finish' },
                    ].map((s) => (
                        <motion.div key={s.label} {...fadeUp}>
                            <div className="font-serif-display text-5xl lg:text-6xl text-slate-900 tracking-tight">{s.stat}</div>
                            <div className="text-xs uppercase tracking-wider text-slate-500 mt-2">{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─────────── TESTIMONIALS ─────────── */}
            <section className="py-24 lg:py-32 bg-stone-50">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <motion.div {...fadeUp} className="max-w-2xl mb-12">
                        <div className="text-xs font-semibold text-brand-700 tracking-wide uppercase mb-3">Real people</div>
                        <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-slate-900">
                            Loved by job seekers <em className="italic text-slate-400">who got the job.</em>
                        </h2>
                    </motion.div>
                    <Testimonials />
                </div>
            </section>

            {/* ─────────── BIG CTA ─────────── */}
            <section className="py-24 lg:py-32 bg-white">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <motion.h2 {...fadeUp} className="font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-slate-900">
                        Ready to land your <em className="italic text-brand-700">next interview?</em>
                    </motion.h2>
                    <motion.p {...fadeUp} className="mt-5 text-lg text-slate-600 max-w-xl mx-auto">
                        Build a resume that gets read, not filtered. No sign-up, no email, no payment.
                    </motion.p>
                    <motion.div {...fadeUp} className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <button
                            onClick={() => onSelectTemplate(TEMPLATES[0])}
                            className="group inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-stone-50 text-base font-medium px-7 py-3.5 rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/10"
                        >
                            Start building free
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <a
                            href="#templates"
                            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 text-base font-medium px-7 py-3.5 rounded-full border border-slate-200 transition-colors"
                        >
                            Browse templates
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* ─────────── BLOG ─────────── */}
            {featuredPost && (
                <section id="blog" className="py-24 lg:py-32 bg-stone-50 border-t border-slate-200/60">
                    <div className="max-w-6xl mx-auto px-6 lg:px-8">
                        <motion.div {...fadeUp} className="flex items-end justify-between gap-6 mb-12">
                            <div>
                                <div className="text-xs font-semibold text-brand-700 tracking-wide uppercase mb-3">From the blog</div>
                                <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight text-slate-900">
                                    Job-search advice <em className="italic text-slate-400">worth your time.</em>
                                </h2>
                            </div>
                        </motion.div>

                        <motion.article {...fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                            <div className="aspect-[16/10] lg:aspect-auto bg-slate-100 overflow-hidden">
                                <img
                                    src={featuredPost.image}
                                    alt={featuredPost.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div className="p-8 lg:p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                    <span>{featuredPost.category}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="inline-flex items-center gap-1"><Clock size={12} />{featuredPost.readTime}</span>
                                </div>
                                <h3 className="font-serif-display text-2xl lg:text-3xl leading-tight tracking-tight text-slate-900 mb-4">
                                    {featuredPost.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {featuredPost.excerpt}
                                </p>
                                <button
                                    onClick={() => {
                                        if (featuredPost.externalUrl) {
                                            window.open(featuredPost.externalUrl, '_blank', 'noopener');
                                        } else if (onViewBlog) {
                                            onViewBlog(featuredPost.id);
                                        }
                                    }}
                                    className="group inline-flex items-center gap-1.5 text-slate-900 font-medium text-sm self-start hover:gap-2.5 transition-all"
                                >
                                    Read the article
                                    <ArrowUpRight size={16} className="group-hover:rotate-12 transition-transform" />
                                </button>
                            </div>
                        </motion.article>
                    </div>
                </section>
            )}

            {/* ─────────── FEEDBACK FORM (compact) ─────────── */}
            <section className="py-20 bg-white border-t border-slate-200/60">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <motion.div {...fadeUp} className="text-center mb-8">
                        <h3 className="font-serif-display text-3xl lg:text-4xl leading-tight tracking-tight text-slate-900">
                            Got feedback?
                        </h3>
                        <p className="mt-2 text-slate-600">Tell us what to build next. We actually read every message.</p>
                    </motion.div>

                    <motion.form
                        {...fadeUp}
                        action="https://formspree.io/f/movkrgyj"
                        method="POST"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setFormSubmitState({ loading: true, success: false, error: null });
                            try {
                                const formData = new FormData(e.target);
                                const response = await fetch(e.target.action, {
                                    method: 'POST',
                                    body: formData,
                                    headers: { 'Accept': 'application/json' },
                                });
                                if (response.ok) {
                                    setFormSubmitState({ loading: false, success: true, error: null });
                                    e.target.reset();
                                } else {
                                    const data = await response.json();
                                    setFormSubmitState({
                                        loading: false,
                                        success: false,
                                        error: data.errors?.map(er => er.message).join(', ') || 'Something went wrong',
                                    });
                                }
                            } catch {
                                setFormSubmitState({ loading: false, success: false, error: 'Network connection lost.' });
                            }
                        }}
                        className="flex flex-col sm:flex-row gap-3"
                    >
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="your@email.com"
                            className="flex-1 px-5 py-3 rounded-full bg-stone-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
                        />
                        <input
                            name="message"
                            type="text"
                            required
                            placeholder="Your thoughts…"
                            className="flex-1 px-5 py-3 rounded-full bg-stone-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={formSubmitState.loading}
                            className="px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-stone-50 font-medium transition-colors"
                        >
                            {formSubmitState.loading ? 'Sending…' : 'Send'}
                        </button>
                    </motion.form>
                    {formSubmitState.success && (
                        <p className="mt-4 text-center text-sm text-emerald-700">Thanks — we got it.</p>
                    )}
                    {formSubmitState.error && (
                        <p className="mt-4 text-center text-sm text-red-600">{formSubmitState.error}</p>
                    )}
                </div>
            </section>

            {/* ─────────── FOOTER ─────────── */}
            <footer className="bg-slate-900 text-stone-300 py-16">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2">
                            <div className="mb-4">
                                <Logo className="w-7 h-7" textClassName="text-base" tone="light" />
                            </div>
                            <p className="text-sm leading-relaxed text-stone-400 max-w-sm">
                                AI-powered resume builder. No signups, no watermarks. Your data stays in your browser.
                            </p>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wider text-stone-500 mb-3">Product</div>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#templates" className="hover:text-stone-50 transition-colors">Templates</a></li>
                                <li><a href="#features" className="hover:text-stone-50 transition-colors">Features</a></li>
                                <li><a href="#how" className="hover:text-stone-50 transition-colors">How it works</a></li>
                            </ul>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wider text-stone-500 mb-3">Resources</div>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#blog" className="hover:text-stone-50 transition-colors">Blog</a></li>
                                <li><a href="mailto:hello@example.com" className="hover:text-stone-50 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
                        <div>© {new Date().getFullYear()} Paperjet. Made with care.</div>
                        <div className="flex items-center gap-4">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-stone-50 transition-colors">
                                <Github size={16} />
                            </a>
                            <span className="inline-flex items-center gap-1">
                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                <Star size={12} className="text-amber-400 fill-amber-400" />
                            </span>
                        </div>
                    </div>
                </div>
            </footer>

            <ScrollToTop />
        </div>
    );
};

export default LandingPage;
