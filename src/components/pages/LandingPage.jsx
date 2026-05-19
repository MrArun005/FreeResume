import { useState, useEffect } from 'react';
import {
    ArrowRight,
    Check,
    Sparkles,
    FileText,
    Target,
    Zap,
    Shield,
    Clock,
    ArrowUpRight,
    Menu,
    X,
    Github,
    Star,
} from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import TemplatePreview from '../ui/TemplatePreview';
import TiltCard from '../ui/TiltCard';
import Testimonials from '../ui/Testimonials';
import ScrollToTop from '../ui/ScrollToTop';
import Logo from '../ui/Logo';
import AppThemeSwitcher from '../ui/AppThemeSwitcher';
import Counter from '../ui/Counter';
import LiveTypingDemo from '../ui/LiveTypingDemo';
import { TEMPLATES } from '../../constants/layouts';
import { BLOG_POSTS } from '../../constants/blogPosts';

// ---- helpers ------------------------------------------------------------

const fadeUp = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
};

const TRUST_POINTS = ['Free, forever', 'No signup', 'Your data stays local'];

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
    ...[...new Set(TEMPLATES.map((t) => t.category))].map((c) => ({ id: c, label: c })),
];

// ---- component ----------------------------------------------------------

const LandingPage = ({ onSelectTemplate, onViewBlog }) => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [formSubmitState, setFormSubmitState] = useState({ loading: false, success: false, error: null });

    // Defer the heavy templates grid to the first browser-idle slot after the
    // hero paints. Idle callbacks fire within ~50–200ms on any modern device
    // once the main thread is free, and we cap the wait at 600ms so slower
    // hardware still mounts well before the user can scroll to the section.
    // Previous IntersectionObserver approach left skeletons visible for fast
    // scrollers because mounting didn't start until viewport intersection.
    const [templatesMounted, setTemplatesMounted] = useState(false);

    useEffect(() => {
        if (templatesMounted) return;
        let cancelled = false;
        const mount = () => {
            if (!cancelled) setTemplatesMounted(true);
        };
        if (typeof window.requestIdleCallback === 'function') {
            const handle = window.requestIdleCallback(mount, { timeout: 600 });
            return () => {
                cancelled = true;
                window.cancelIdleCallback(handle);
            };
        }
        const handle = setTimeout(mount, 150);
        return () => {
            cancelled = true;
            clearTimeout(handle);
        };
    }, [templatesMounted]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const filteredTemplates =
        activeCategory === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.category === activeCategory);

    const featuredPost = BLOG_POSTS[0];

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-900 dark:text-stone-100 font-clean antialiased selection:bg-brand-600/15 selection:text-brand-900">
            {/* ─────────── NAV ─────────── */}
            {/* Solid-ish bg instead of backdrop-blur-xl — blur-on-scroll forces */}
            {/* a full-viewport re-rasterize every frame and was the single biggest */}
            {/* scroll-jank source on the landing page. */}
            <nav className="sticky top-0 z-50 bg-stone-50/95 dark:bg-slate-950/95 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                    <a href="#top" className="group">
                        <Logo className="w-7 h-7" textClassName="text-base" />
                    </a>

                    {/* desktop links */}
                    <div className="hidden md:flex items-center gap-8 text-sm text-slate-600 dark:text-stone-400">
                        <a
                            href="#templates"
                            className="hover:text-slate-900 dark:hover:text-stone-100 transition-colors"
                        >
                            Templates
                        </a>
                        <a
                            href="#features"
                            className="hover:text-slate-900 dark:hover:text-stone-100 transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#how"
                            className="hover:text-slate-900 dark:hover:text-stone-100 transition-colors"
                        >
                            How it works
                        </a>
                        <a
                            href="#blog"
                            className="hover:text-slate-900 dark:hover:text-stone-100 transition-colors"
                        >
                            Blog
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
                        <AppThemeSwitcher />
                        <button
                            onClick={() => onSelectTemplate(TEMPLATES[0])}
                            className="hidden md:inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-slate-900 text-sm font-medium px-4 py-2 rounded-full transition-all hover:gap-2"
                        >
                            Start building
                            <ArrowRight size={14} />
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 text-slate-700 dark:text-stone-200"
                            aria-label="Open menu"
                        >
                            <Menu size={22} />
                        </button>
                    </div>
                </div>

                {/* mobile menu */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 bg-stone-50 dark:bg-slate-950 z-50 md:hidden flex flex-col">
                        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/60 dark:border-slate-800/60">
                            <Logo className="w-7 h-7" textClassName="text-base" />
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-slate-700 dark:text-stone-200"
                                aria-label="Close menu"
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <div className="flex-1 px-6 py-10 flex flex-col gap-6 text-2xl font-serif-display text-slate-900 dark:text-stone-100">
                            <a href="#templates" onClick={() => setMobileMenuOpen(false)}>
                                Templates
                            </a>
                            <a href="#features" onClick={() => setMobileMenuOpen(false)}>
                                Features
                            </a>
                            <a href="#how" onClick={() => setMobileMenuOpen(false)}>
                                How it works
                            </a>
                            <a href="#blog" onClick={() => setMobileMenuOpen(false)}>
                                Blog
                            </a>
                        </div>
                        <div className="p-6 border-t border-slate-200/60 dark:border-slate-800/60">
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    onSelectTemplate(TEMPLATES[0]);
                                }}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 dark:bg-stone-100 text-stone-50 dark:text-slate-900 text-base font-medium px-5 py-3 rounded-full"
                            >
                                Start building <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* ─────────── HERO ─────────── */}
            <section id="top" className="relative pt-20 lg:pt-28 pb-16 lg:pb-24 overflow-hidden">
                {/* Pure-CSS radial gradient wash. No filter:blur, no animation, no extra */}
                {/* layers — paints once and the GPU never has to retouch it. Sky at top-left */}
                {/* + warm peach top-right reads as calm + welcoming without feeling busy. */}
                <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none dark:opacity-40"
                    style={{
                        background:
                            'radial-gradient(900px circle at 15% 0%, rgba(125,211,252,0.32), transparent 55%), radial-gradient(800px circle at 85% 25%, rgba(254,215,170,0.40), transparent 55%)',
                    }}
                />
                <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-stone-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8 shadow-sm"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        New: AI roast & ATS score
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="font-serif-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-tight text-slate-900 dark:text-stone-100 max-w-4xl"
                    >
                        The résumé you&rsquo;d actually{' '}
                        <em className="italic text-brand-700 dark:text-brand-400">hire</em> someone for.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-stone-400 max-w-2xl leading-relaxed"
                    >
                        Build a polished, ATS-friendly resume in minutes. AI helps tailor it to the job.
                        It&rsquo;s free, no signup, and your data never leaves your browser.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center"
                    >
                        <motion.button
                            onClick={() => onSelectTemplate(TEMPLATES[0])}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                            className="group inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-slate-900 text-base font-medium px-7 py-3.5 rounded-full shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 transition-colors"
                        >
                            Start building
                            <ArrowRight
                                size={16}
                                className="group-hover:translate-x-0.5 transition-transform"
                            />
                        </motion.button>
                        <motion.a
                            href="#templates"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-stone-100 text-base font-medium px-7 py-3.5 rounded-full border border-slate-200 dark:border-slate-700"
                        >
                            See templates
                        </motion.a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-stone-500"
                    >
                        {TRUST_POINTS.map((p) => (
                            <span key={p} className="inline-flex items-center gap-1.5">
                                <Check size={14} className="text-brand-600 dark:text-brand-400" />
                                {p}
                            </span>
                        ))}
                    </motion.div>

                    {/* Live-typing demo — shows the editor "improving" a bullet in real */}
                    {/* time, so the value prop ("AI rewrites your bullets") is visible */}
                    {/* before the user has to scroll. Constrained width keeps the hero */}
                    {/* legible. */}
                    <LiveTypingDemo className="mt-12 max-w-xl" />
                </div>

                {/* template preview strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                    className="mt-20 lg:mt-28 relative"
                >
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-stone-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                            <div className="px-6 sm:px-10 pt-10 pb-12 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                                {TEMPLATES.slice(0, 5).map((t, i) => (
                                    <motion.div
                                        key={t.id}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.5 + i * 0.07 }}
                                    >
                                        <TiltCard
                                            onClick={() => onSelectTemplate(t)}
                                            ariaLabel={`Preview ${t.name} template`}
                                            lift={8}
                                            className="group relative aspect-[210/297] w-full rounded-lg overflow-hidden bg-white border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-[0_22px_44px_-16px_rgba(15,23,42,0.25)] dark:hover:shadow-[0_22px_44px_-16px_rgba(56,189,248,0.30)] transition-shadow duration-300"
                                        >
                                            <div className="absolute inset-0">
                                                <TemplatePreview
                                                    layout={t.layout}
                                                    theme={t.theme}
                                                    selected={false}
                                                />
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent text-stone-50 text-[10px] sm:text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                {t.name}
                                            </div>
                                        </TiltCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ─────────── FEATURES ─────────── */}
            <section
                id="features"
                className="py-24 lg:py-32 bg-white dark:bg-slate-900 border-y border-slate-200/60 dark:border-slate-800/60"
            >
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <motion.div {...fadeUp} className="max-w-2xl mb-16">
                        <div className="text-xs font-semibold text-brand-700 dark:text-brand-400 tracking-wide uppercase mb-3">
                            Features
                        </div>
                        <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-slate-900 dark:text-stone-100">
                            Quiet on the outside.
                            <br />
                            <em className="italic text-slate-400 dark:text-stone-500">
                                Smart on the inside.
                            </em>
                        </h2>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.08 } },
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                    >
                        {FEATURES.map((f) => (
                            <motion.div
                                key={f.title}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: 0.5, ease: 'easeOut' },
                                    },
                                }}
                                whileHover={{ y: -3 }}
                                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                                className="bg-white dark:bg-slate-900 p-8 lg:p-10 hover:bg-stone-50 dark:hover:bg-slate-800 transition-colors group"
                            >
                                <motion.div
                                    whileHover={{ rotate: 6, scale: 1.08 }}
                                    transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                                    className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-stone-100 text-stone-50 dark:text-slate-900 flex items-center justify-center mb-6 group-hover:bg-brand-600 dark:group-hover:bg-brand-500 group-hover:text-stone-50 transition-colors"
                                >
                                    <f.icon size={18} strokeWidth={1.8} />
                                </motion.div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-stone-100 mb-2 tracking-tight">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-stone-400 leading-relaxed">
                                    {f.body}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─────────── TEMPLATES ─────────── */}
            <section id="templates" className="relative py-24 lg:py-32 overflow-hidden">
                {/* Cool sky→mint radial wash. Makes the gallery feel set apart from */}
                {/* the rest of the page without committing to a heavy colored bg. */}
                <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none dark:opacity-30"
                    style={{
                        background:
                            'radial-gradient(1100px circle at 50% 0%, rgba(186,230,253,0.45), transparent 55%), radial-gradient(900px circle at 50% 100%, rgba(167,243,208,0.35), transparent 55%)',
                    }}
                />
                <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
                    <motion.div
                        {...fadeUp}
                        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12"
                    >
                        <div className="max-w-2xl">
                            <div className="text-xs font-semibold text-brand-700 dark:text-brand-400 tracking-wide uppercase mb-3">
                                Templates
                            </div>
                            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-slate-900 dark:text-stone-100">
                                Pick a starting point.
                                <br />
                                <em className="italic text-slate-400 dark:text-stone-500">
                                    Change anything later.
                                </em>
                            </h2>
                        </div>
                        {/* Active pill slides between categories via shared layoutId */}
                        {/* instead of snapping bg colors. One spring drives the whole */}
                        {/* selection state — feels like the iOS segmented control. */}
                        <LayoutGroup id="categoryPills">
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((c) => {
                                    const isActive = activeCategory === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => setActiveCategory(c.id)}
                                            className="relative isolate text-sm px-4 py-2 rounded-full transition-colors"
                                        >
                                            {isActive && (
                                                <motion.span
                                                    layoutId="categoryPill"
                                                    className="absolute inset-0 -z-10 rounded-full bg-slate-900 dark:bg-stone-100 shadow-sm"
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 380,
                                                        damping: 32,
                                                    }}
                                                />
                                            )}
                                            {!isActive && (
                                                <span className="absolute inset-0 -z-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" />
                                            )}
                                            <span
                                                className={`relative font-medium ${
                                                    isActive
                                                        ? 'text-stone-50 dark:text-slate-900'
                                                        : 'text-slate-700 dark:text-stone-300'
                                                }`}
                                            >
                                                {c.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </LayoutGroup>
                    </motion.div>

                    <div
                        onMouseMove={(e) => {
                            // Cursor spotlight — write the pointer position straight into
                            // CSS variables so the radial-gradient below repaints on the
                            // compositor without going through React state. Cheap enough to
                            // run at full mousemove cadence.
                            const rect = e.currentTarget.getBoundingClientRect();
                            e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                            e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
                        }}
                        className="group/grid relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7"
                        style={{ '--mx': '50%', '--my': '50%' }}
                    >
                        {/* Cursor spotlight — soft pastel halo following the cursor. */}
                        {/* Dropped mixBlendMode (overlay) — it was forcing the whole grid */}
                        {/* region to recomposite each cursor frame. A plain low-alpha */}
                        {/* radial sits over the cards and looks nearly identical. */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 opacity-0 group-hover/grid:opacity-100 transition-opacity duration-300"
                            style={{
                                background:
                                    'radial-gradient(360px circle at var(--mx) var(--my), rgba(125,211,252,0.18), transparent 70%)',
                            }}
                        />
                        <AnimatePresence mode="popLayout" initial={false}>
                            {templatesMounted
                                ? filteredTemplates.map((t) => (
                                      <motion.button
                                          key={t.id}
                                          layout
                                          onClick={() => onSelectTemplate(t)}
                                          initial={{ opacity: 0, scale: 0.92 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.92 }}
                                          transition={{
                                              layout: { type: 'spring', stiffness: 320, damping: 32 },
                                              opacity: { duration: 0.25 },
                                              scale: { duration: 0.25 },
                                          }}
                                          whileHover={{ y: -4 }}
                                          className="group text-left"
                                      >
                                          {/* Card hover glow via box-shadow (compositor-only). */}
                                          <div className="aspect-[210/297] rounded-xl overflow-hidden bg-white border border-slate-200 dark:border-slate-700 shadow-sm group-hover:shadow-[0_18px_36px_-12px_rgba(15,23,42,0.18)] dark:group-hover:shadow-[0_18px_36px_-12px_rgba(56,189,248,0.25)] group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-shadow duration-300 relative">
                                              <div className="absolute inset-0">
                                                  <TemplatePreview
                                                      layout={t.layout}
                                                      theme={t.theme}
                                                      selected={false}
                                                  />
                                              </div>
                                              <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all">
                                                  <ArrowUpRight size={14} className="text-slate-900" />
                                              </div>
                                          </div>
                                          <div className="mt-4 flex items-baseline justify-between gap-2">
                                              <div className="text-sm font-medium text-slate-900 dark:text-stone-100 tracking-tight truncate">
                                                  {t.name}
                                              </div>
                                              <div className="text-xs text-slate-500 dark:text-stone-500 shrink-0">
                                                  {t.category}
                                              </div>
                                          </div>
                                      </motion.button>
                                  ))
                                : Array.from({ length: 8 }).map((_, i) => (
                                      <motion.div
                                          key={`skeleton-${i}`}
                                          exit={{ opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="text-left"
                                      >
                                          <div className="aspect-[210/297] rounded-xl bg-stone-100 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70" />
                                          <div className="mt-4 h-3 w-24 rounded bg-stone-200 dark:bg-slate-800" />
                                      </motion.div>
                                  ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* ─────────── HOW IT WORKS ─────────── */}
            {/* Intentionally dark in both modes — designed as a contrast section. */}
            <section id="how" className="py-24 lg:py-32 bg-slate-900 text-stone-50 relative overflow-hidden">
                {/* subtle teal glow */}
                <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">
                    <motion.div {...fadeUp} className="max-w-2xl mb-16">
                        <div className="text-xs font-semibold text-brand-400 tracking-wide uppercase mb-3">
                            How it works
                        </div>
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
                        {/* Stacked-layer hover: warm peach gradient sits underneath, */}
                        {/* the stone-50 cover fades out on hover so the gradient bleeds */}
                        {/* through smoothly. transition-opacity is GPU-cheap. */}
                        <button
                            onClick={() => onSelectTemplate(TEMPLATES[0])}
                            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-orange-300 via-amber-300 to-rose-300 text-slate-900 text-base font-medium px-7 py-3.5 rounded-full transition-all hover:gap-3 overflow-hidden"
                        >
                            <span
                                aria-hidden
                                className="absolute inset-0 bg-stone-50 group-hover:opacity-0 transition-opacity duration-400"
                            />
                            <span className="relative inline-flex items-center gap-2">
                                Try it now
                                <ArrowRight size={16} />
                            </span>
                        </button>
                        <div className="mt-4 text-sm text-stone-400">
                            No signup. No credit card. Done in 20 minutes.
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─────────── STATS / SOCIAL PROOF ─────────── */}
            <section className="py-20 border-y border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center">
                    {[
                        {
                            node: (
                                <>
                                    <Counter to={15} />+
                                </>
                            ),
                            label: 'Templates',
                        },
                        { node: 'Free', label: 'Forever' },
                        { node: '0', label: 'Signups required' },
                        {
                            node: (
                                <>
                                    &lt;
                                    <Counter to={20} />m
                                </>
                            ),
                            label: 'To finish',
                        },
                    ].map((s) => (
                        <motion.div key={s.label} {...fadeUp}>
                            <div className="font-serif-display text-5xl lg:text-6xl text-slate-900 dark:text-stone-100 tracking-tight">
                                {s.node}
                            </div>
                            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-stone-500 mt-2">
                                {s.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─────────── TESTIMONIALS ─────────── */}
            <section className="py-24 lg:py-32 bg-stone-50 dark:bg-slate-950">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <motion.div {...fadeUp} className="max-w-2xl mb-12">
                        <div className="text-xs font-semibold text-brand-700 dark:text-brand-400 tracking-wide uppercase mb-3">
                            Real people
                        </div>
                        <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-slate-900 dark:text-stone-100">
                            Loved by job seekers{' '}
                            <em className="italic text-slate-400 dark:text-stone-500">who got the job.</em>
                        </h2>
                    </motion.div>
                    <Testimonials />
                </div>
            </section>

            {/* ─────────── BIG CTA ─────────── */}
            <section className="py-24 lg:py-32 bg-white dark:bg-slate-900">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <motion.h2
                        {...fadeUp}
                        className="font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-slate-900 dark:text-stone-100"
                    >
                        Ready to land your{' '}
                        <em className="italic text-brand-700 dark:text-brand-400">next interview?</em>
                    </motion.h2>
                    <motion.p
                        {...fadeUp}
                        className="mt-5 text-lg text-slate-600 dark:text-stone-400 max-w-xl mx-auto"
                    >
                        Build a resume that gets read, not filtered. No sign-up, no email, no payment.
                    </motion.p>
                    <motion.div
                        {...fadeUp}
                        className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
                    >
                        <button
                            onClick={() => onSelectTemplate(TEMPLATES[0])}
                            className="group inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-slate-900 text-base font-medium px-7 py-3.5 rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/10"
                        >
                            Start building free
                            <ArrowRight
                                size={16}
                                className="group-hover:translate-x-0.5 transition-transform"
                            />
                        </button>
                        <a
                            href="#templates"
                            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-stone-100 text-base font-medium px-7 py-3.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                            Browse templates
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* ─────────── BLOG ─────────── */}
            {featuredPost && (
                <section
                    id="blog"
                    className="py-24 lg:py-32 bg-stone-50 dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/60"
                >
                    <div className="max-w-6xl mx-auto px-6 lg:px-8">
                        <motion.div {...fadeUp} className="flex items-end justify-between gap-6 mb-12">
                            <div>
                                <div className="text-xs font-semibold text-brand-700 dark:text-brand-400 tracking-wide uppercase mb-3">
                                    From the blog
                                </div>
                                <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight text-slate-900 dark:text-stone-100">
                                    Job-search advice{' '}
                                    <em className="italic text-slate-400 dark:text-stone-500">
                                        worth your time.
                                    </em>
                                </h2>
                            </div>
                        </motion.div>

                        <motion.article
                            {...fadeUp}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
                        >
                            <div className="aspect-[16/10] lg:aspect-auto bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <img
                                    src={featuredPost.image}
                                    alt={featuredPost.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div className="p-8 lg:p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-stone-500 mb-4">
                                    <span>{featuredPost.category}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                    <span className="inline-flex items-center gap-1">
                                        <Clock size={12} />
                                        {featuredPost.readTime}
                                    </span>
                                </div>
                                <h3 className="font-serif-display text-2xl lg:text-3xl leading-tight tracking-tight text-slate-900 dark:text-stone-100 mb-4">
                                    {featuredPost.title}
                                </h3>
                                <p className="text-slate-600 dark:text-stone-400 leading-relaxed mb-6">
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
                                    className="group inline-flex items-center gap-1.5 text-slate-900 dark:text-stone-100 font-medium text-sm self-start hover:gap-2.5 transition-all"
                                >
                                    Read the article
                                    <ArrowUpRight
                                        size={16}
                                        className="group-hover:rotate-12 transition-transform"
                                    />
                                </button>
                            </div>
                        </motion.article>
                    </div>
                </section>
            )}

            {/* ─────────── FEEDBACK FORM (compact) ─────────── */}
            <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <motion.div {...fadeUp} className="text-center mb-8">
                        <h3 className="font-serif-display text-3xl lg:text-4xl leading-tight tracking-tight text-slate-900 dark:text-stone-100">
                            Got feedback?
                        </h3>
                        <p className="mt-2 text-slate-600 dark:text-stone-400">
                            Tell us what to build next. We actually read every message.
                        </p>
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
                                    headers: { Accept: 'application/json' },
                                });
                                if (response.ok) {
                                    setFormSubmitState({ loading: false, success: true, error: null });
                                    e.target.reset();
                                } else {
                                    const data = await response.json();
                                    setFormSubmitState({
                                        loading: false,
                                        success: false,
                                        error:
                                            data.errors?.map((er) => er.message).join(', ') ||
                                            'Something went wrong',
                                    });
                                }
                            } catch {
                                setFormSubmitState({
                                    loading: false,
                                    success: false,
                                    error: 'Network connection lost.',
                                });
                            }
                        }}
                        className="flex flex-col sm:flex-row gap-3"
                    >
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="your@email.com"
                            className="flex-1 px-5 py-3 rounded-full bg-stone-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-slate-900 dark:focus:border-stone-300 transition-colors"
                        />
                        <input
                            name="message"
                            type="text"
                            required
                            placeholder="Your thoughts…"
                            className="flex-1 px-5 py-3 rounded-full bg-stone-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-slate-900 dark:focus:border-stone-300 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={formSubmitState.loading}
                            className="px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-stone-100 dark:hover:bg-white disabled:opacity-60 text-stone-50 dark:text-slate-900 font-medium transition-colors"
                        >
                            {formSubmitState.loading ? 'Sending…' : 'Send'}
                        </button>
                    </motion.form>
                    {formSubmitState.success && (
                        <p className="mt-4 text-center text-sm text-emerald-700 dark:text-emerald-400">
                            Thanks — we got it.
                        </p>
                    )}
                    {formSubmitState.error && (
                        <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
                            {formSubmitState.error}
                        </p>
                    )}
                </div>
            </section>

            {/* ─────────── FOOTER ─────────── */}
            {/* Always dark — the footer is designed as a dark surface in both modes. */}
            <footer className="bg-slate-900 text-stone-300 py-16">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2">
                            <div className="mb-4">
                                <Logo className="w-7 h-7" textClassName="text-base" tone="light" />
                            </div>
                            <p className="text-sm leading-relaxed text-stone-400 max-w-sm">
                                AI-powered resume builder. No signups, no watermarks. Your data stays in your
                                browser.
                            </p>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wider text-stone-500 mb-3">
                                Product
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="#templates" className="hover:text-stone-50 transition-colors">
                                        Templates
                                    </a>
                                </li>
                                <li>
                                    <a href="#features" className="hover:text-stone-50 transition-colors">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#how" className="hover:text-stone-50 transition-colors">
                                        How it works
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wider text-stone-500 mb-3">
                                Resources
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="#blog" className="hover:text-stone-50 transition-colors">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="mailto:hello@example.com"
                                        className="hover:text-stone-50 transition-colors"
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
                        <div>© {new Date().getFullYear()} LandedJob. Made with care.</div>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-stone-50 transition-colors"
                            >
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
