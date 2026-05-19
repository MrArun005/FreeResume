import React, { useState, useEffect, useCallback } from 'react';
import { useModalState } from './hooks/useModalState';
import {
    Layout,
    Plus,
    Trash2,
    Upload,
    FileText,
    ArrowLeft,
    Loader,
    CheckCircle,
    Printer,
    Download,
    LayoutGrid,
    User,
    X,
    SplitSquareHorizontal,
    Undo,
    Redo,
    Sparkles,
    Briefcase,
    ChevronDown,
    Bot,
    Flame,
    Eye,
    Minimize2,
} from 'lucide-react';
import useHistory from './hooks/useHistory';

import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { TEMPLATES } from './constants/layouts';
import { initialData } from './data/mockData';

// UI Components
import LandingPage from './components/pages/LandingPage';
import OnboardingModal from './components/ui/OnboardingModal';
import KeyboardShortcutsModal from './components/ui/KeyboardShortcutsModal';
import ParsingLoader from './components/ui/ParsingLoader';
import JobTrackerModal from './components/ui/JobTrackerModal';
import FeatureTourModal from './components/ui/FeatureTourModal';
import TutorialModal from './components/ui/TutorialModal';
import ShareModal from './components/ui/ShareModal';
import Logo from './components/ui/Logo';

// Layout Components
import LayoutClassic from './components/layouts/LayoutClassic';
import LayoutSidebarLeft from './components/layouts/LayoutSidebarLeft';
import LayoutSidebarRight from './components/layouts/LayoutSidebarRight';
import LayoutMinimal from './components/layouts/LayoutMinimal';
import LayoutAts from './components/layouts/LayoutAts';
import LayoutJakes from './components/layouts/LayoutJakes';
import LayoutFreeform from './components/layouts/LayoutFreeform';
import LayoutCanvas from './components/layouts/LayoutCanvas';
import LayoutExecutive from './components/layouts/LayoutExecutive';
import LayoutGold from './components/layouts/LayoutGold';
import LayoutGoogle from './components/layouts/LayoutGoogle';
import LayoutBoldRecruit from './components/layouts/LayoutBoldRecruit';
import LayoutExecutiveSerif from './components/layouts/LayoutExecutiveSerif';
import LayoutNavyModern from './components/layouts/LayoutNavyModern';
import LayoutMinimalMono from './components/layouts/LayoutMinimalMono';

// Editor Section Components
import PersonalSection from './components/editor/PersonalSection';
import SummarySection from './components/editor/SummarySection';
import ExperienceSection from './components/editor/ExperienceSection';
import EducationSection from './components/editor/EducationSection';
import SkillsSection from './components/editor/SkillsSection';
import CustomSection from './components/editor/CustomSection';
import CoverLetterSection from './components/editor/CoverLetterSection';
import AtsScoreModal from './components/ui/AtsScoreModal';
import ThemeSettingsModal from './components/ui/ThemeSettingsModal';
import AutoScrollingGuide from './components/ui/AutoScrollingGuide';
import PageOverflowIndicator from './components/ui/PageOverflowIndicator';
import EditorSidebar from './components/editor/EditorSidebar';
import JobAssistantModal from './components/ui/JobAssistantModal';
import AutoTailorModal from './components/ui/AutoTailorModal';
import AtsPreviewModal from './components/ui/AtsPreviewModal';
import { useJobTracker } from './hooks/useJobTracker';
import RoastModal from './components/ui/RoastModal';
import CoverLetterModal from './components/ui/CoverLetterModal';
import ImproveResumeModal from './components/ui/ImproveResumeModal';

import { parseResume } from './utils/resumeParser';
import { paginateResume } from './utils/pagination';
import {
    applyPaperSizeToDocument,
    resolvePaperSize,
    applyPageMargins,
    applyAccentColor,
    applyHeaderAlignment,
} from './utils/paperSize';
import { normalizeSkills, forceCategorize } from './utils/skillTaxonomy';
import { apiFetch, logAiClick } from './utils/aiLogger';
import { applyResumeFix } from './utils/applyResumeFix';
import { exportResumePdf, exportResumeDocx } from './utils/exportPdf';
import {
    loadProfilesStore,
    patchActiveResume,
    createProfile,
    duplicateProfile,
    renameProfile,
    deleteProfile,
    switchActive,
    getActiveProfile,
} from './utils/profilesStore';

const App = () => {
    const [view, setView] = useState('gallery'); // 'gallery' | 'editor'
    const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'preview'
    const modals = useModalState();
    const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
    const [isImproving, setIsImproving] = useState(false);

    // Normalize a single resume blob — handles the description→bullets
    // migration and the legacy skills mega-bucket case. Used both for loading
    // a stored resume and for seeding new profiles created via Duplicate.
    const normalizeResumeShape = (parsed) => {
        // Defensive against null/undefined and against explicit-undefined
        // values inside the parsed blob. Spread `{...obj}` copies undefined
        // properties too, so `{...initialData, ...{personal: undefined}}`
        // would clobber initialData.personal — every required key gets an
        // explicit fallback below.
        const safe = parsed && typeof parsed === 'object' ? parsed : {};
        const migrateItemToBullets = (item) => {
            if (item.description && !item.bullets) {
                const bullets = item.description
                    .split(/[.!?]\s+/)
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0 && s.length < 150)
                    .slice(0, 5);
                return { ...item, bullets, description: undefined };
            }
            return item;
        };
        return {
            ...initialData,
            ...safe,
            // Deep-merge personal so a saved `{personal: {fullName: 'X'}}`
            // doesn't drop the rest (email/socials) — and a missing/undefined
            // personal falls back to initialData.personal in full.
            personal: { ...initialData.personal, ...(safe.personal || {}) },
            experience: (safe.experience || []).map(migrateItemToBullets),
            education: safe.education || initialData.education || [],
            customSections: (safe.customSections || []).map((section) => ({
                ...section,
                items: (section.items || []).map(migrateItemToBullets),
            })),
            skills: normalizeSkills(safe.skills || []),
            sectionOrder: safe.sectionOrder || ['summary', 'experience', 'education', 'skills'],
            pageBreaks: safe.pageBreaks || {},
            // Path B per-section size scales. Keyed by sectionId (built-in
            // 'summary'|'experience'|'education'|'skills'|'projects' or a
            // custom UUID). Value is the scale preset key — see
            // src/utils/sectionStyles.js for the multiplier table. Missing
            // sections fall back to scale=1 (no change), so older resumes
            // without this field render identically.
            sectionStyles: safe.sectionStyles || {},
            // Paper size — A4 (default) or 'letter'. Drives both preview
            // dimensions and the exported PDF/DOCX page size.
            paperSize: safe.paperSize || 'A4',
            // Optional accent override (hex string like '#1a73e8'). When set,
            // layouts that opt-in read it via var(--resume-accent, <fallback>);
            // null means "use the layout's built-in accent".
            accentColor: safe.accentColor || null,
            // Outer page-padding preset: 'standard' (no extra) | 'spacious'
            // (adds margin inside the page). Lives on .resume-paper via
            // --page-margin-extra so it stacks on top of layout-internal padding.
            pageMargins: safe.pageMargins || 'standard',
            // Header alignment for layouts that support it. Layouts read
            // var(--resume-header-align, left).
            headerAlignment: safe.headerAlignment || 'left',
            // Canvas Pro: free-form blocks the user has added (heading, quote,
            // photo, divider, shape, etc). Default to an empty array so older
            // resumes don't crash the Canvas layout.
            canvasBlocks: Array.isArray(safe.canvasBlocks) ? safe.canvasBlocks : [],
        };
    };

    // Load the profile store. On first run there are no profiles yet — seed
    // one from initialData so the user lands in a working editor immediately.
    const getInitialProfilesStore = () => {
        let store = loadProfilesStore();
        if (!store.profiles.length) {
            const seed = normalizeResumeShape(initialData);
            const { store: nextStore } = createProfile(store, 'My Resume', seed);
            store = nextStore;
        } else {
            // Re-normalize every profile's resume on load. Cheap and means any
            // legacy shapes (old skills mega-bucket, description fields) get
            // upgraded the first time the user reopens the app after release.
            store = {
                ...store,
                profiles: store.profiles.map((p) => ({ ...p, resume: normalizeResumeShape(p.resume) })),
            };
        }
        return store;
    };

    useEffect(() => {
        // Check if user has seen the feature tour
        const hasSeenTour = localStorage.getItem('hasSeenFeatureTour');
        if (!hasSeenTour && view === 'editor') {
            // Delay slightly to let things load
            setTimeout(() => modals.open('featureTour'), 1000);
        }
        // modals reference is stable per render thanks to useMemo in the hook;
        // the effect should only fire on view changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view]);

    // Multi-profile state. The active profile's resume drives the editor;
    // every other profile sits in the store waiting to be switched in.
    const [profilesStore, setProfilesStore] = useState(getInitialProfilesStore);
    const activeProfile = getActiveProfile(profilesStore);

    // Defensive seed: normalizeResumeShape merges initialData defaults into
    // whatever the active profile actually holds, so even a half-corrupt
    // {} or a partial blob like { experience: [...] } gets every required
    // top-level key (personal, experience, education, skills, sectionOrder,
    // …). Without this, downstream `resume.personal.fullName` and friends
    // would crash on any stored profile shape that pre-dates the current
    // schema. The autosave loop persists the normalized shape back, so a
    // single edit upgrades the saved blob permanently.
    const [resume, rawSetResume, undo, redo, canUndo, canRedo] = useHistory(
        normalizeResumeShape(activeProfile?.resume || {})
    );

    // Wrap setResume so EVERY path — onCreateNew, AI improve, file upload,
    // applyResumeFix, profile switch — routes through normalizeResumeShape.
    // Without this, an AI response missing `personal` would crash descendants
    // until the user manually re-typed it. Functional updates run inside so
    // both `setResume(obj)` and `setResume(prev => …)` shapes are normalized.
    const setResume = useCallback(
        (action) => {
            rawSetResume((prev) => {
                const next = typeof action === 'function' ? action(prev) : action;
                return normalizeResumeShape(next);
            });
        },
        [rawSetResume]
    );

    // Whenever the user switches to a different profile, push that profile's
    // resume into the history stack so the editor reflects the new content.
    // The id-tracking ref prevents this from firing on the autosave loop
    // (where activeId stays the same but the store object changes).
    const lastActiveIdRef = React.useRef(activeProfile.id);
    useEffect(() => {
        if (activeProfile && activeProfile.id !== lastActiveIdRef.current) {
            // Same normalization as the initial seed — guarantees every
            // top-level field exists on the new active profile's resume
            // before any descendant component reads it.
            setResume(normalizeResumeShape(activeProfile.resume || {}));
            lastActiveIdRef.current = activeProfile.id;
        }
        // Dep is the ID only — not the full activeProfile object — so this
        // effect doesn't re-run on every autosave (which rebuilds the store
        // and produces a new activeProfile reference with the same id).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeProfile?.id]);

    // Paper size — write `--page-width` / `--page-height` to :root so every
    // layout, the print CSS, and the standalone HTML built for PDF export
    // all pick up the user's choice from a single CSS variable.
    useEffect(() => {
        applyPaperSizeToDocument(resume?.paperSize);
    }, [resume?.paperSize]);

    // Resume-level design knobs (accent color override, page-margin preset,
    // header alignment). All three set CSS custom properties on :root so
    // every layout that opts in via var(--resume-…, fallback) picks them up.
    useEffect(() => {
        applyAccentColor(resume?.accentColor);
    }, [resume?.accentColor]);

    useEffect(() => {
        applyPageMargins(resume?.pageMargins);
    }, [resume?.pageMargins]);

    useEffect(() => {
        applyHeaderAlignment(resume?.headerAlignment);
    }, [resume?.headerAlignment]);

    // Profile management handlers — each one runs the corresponding store
    // helper and triggers a re-render via setProfilesStore.
    const handleSwitchProfile = (id) => setProfilesStore((prev) => switchActive(prev, id));
    const handleCreateProfile = (name) =>
        setProfilesStore((prev) => {
            // Seed the new profile with a deep-clone of the user's current
            // resume so a freshly created profile starts as a snapshot of
            // their existing work — they can then diverge it independently
            // (tailored for a different role, different layout, etc.) without
            // re-entering everything from scratch. The autosave loop keeps
            // each profile's edits scoped to itself, so switching back to the
            // source profile preserves its original state.
            const seed = JSON.parse(JSON.stringify(resume));
            return createProfile(prev, name || 'Untitled Resume', seed).store;
        });
    const handleDuplicateProfile = (id) => setProfilesStore((prev) => duplicateProfile(prev, id).store);
    const handleRenameProfile = (id, name) => setProfilesStore((prev) => renameProfile(prev, id, name));
    const handleDeleteProfile = (id) => setProfilesStore((prev) => deleteProfile(prev, id));

    // Modal-driven flow for the full-resume AI rewrite. States: closed → confirm
    // → loading → success | error. `isImproving` stays in sync for the header
    // button's disabled/loading visual.
    const [improveModalStage, setImproveModalStage] = useState(null); // null | 'confirm' | 'loading' | 'success' | 'error'
    const [improveError, setImproveError] = useState('');

    const handleImproveResume = () => setImproveModalStage('confirm');

    const runImproveResume = async () => {
        logAiClick('improve-resume');
        setImproveModalStage('loading');
        setIsImproving(true);
        setImproveError('');
        try {
            const response = await apiFetch(
                '/api/improve-resume',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeData: resume }),
                },
                'improve-resume'
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data?.details || data?.error || `HTTP ${response.status}`);

            if (data.improvedResume) {
                // Force re-bucket skills via the taxonomy regardless of what the AI
                // returned — this guarantees the mega-bucket case can never survive
                // an "Improve Writing" even if the model ignores the prompt.
                setResume({
                    ...data.improvedResume,
                    skills: forceCategorize(data.improvedResume.skills || []),
                });
                setImproveModalStage('success');
            } else {
                throw new Error('No improved resume returned');
            }
        } catch (error) {
            console.error('Failed to improve resume:', error);
            setImproveError(error?.message || String(error));
            setImproveModalStage('error');
        } finally {
            setIsImproving(false);
        }
    };
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
    const [activeSection, setActiveSection] = useState('personal');
    const [isParsing, setIsParsing] = useState(false);
    const [isOverflowing] = useState(false);
    // Seed pagedData from the same resume useHistory was initialized with so
    // the FIRST render shows the user's actual content, not the default
    // initialData blob. Otherwise there's a 500ms window where the preview
    // shows initialData (then pagination runs and switches to real data) —
    // visible to users as a "flash of wrong content".
    const [pagedData, setPagedData] = useState(() => [resume]);
    const [isCalculatingLayout, setIsCalculatingLayout] = useState(false);
    const [scale, setScale] = useState(1);

    // Handle Responsive Scaling
    //
    // Sizes the preview to fill the available canvas width. Subtracts the
    // editor sidebar at md+ and the template selector sidebar at xl+ when
    // open — previously these were unaccounted for, so on wide screens the
    // A4 paper sat at 794px with empty space around it, and on narrow xl
    // screens the open template sidebar would force the preview into the
    // 340px gutter. Caps upscaling at 1.3 normally, 1.6 in fullscreen
    // preview mode (no sidebars, the user explicitly wants a bigger view).
    // Extracted boolean so it can drive the resize effect dependency. The
    // Design & Theme panel is a right-anchored side drawer (not an overlay
    // modal) — when open, it occupies ~420px on the right edge and the
    // preview has to shrink to stay visible alongside it.
    const isThemePanelOpen = modals.is('theme');

    // Lift the job-tracker hook to App-level so both the tracker modal AND
    // the Smart Tailor modal (which can "Save to tracker" with a JD + match
    // score) write through the same in-memory state. Without this, the two
    // would each own a separate copy of the jobs array and overwrite each
    // other's localStorage writes.
    const jobTracker = useJobTracker();

    useEffect(() => {
        const handleResize = () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            let availableWidth = windowWidth;

            // Match the responsive drawer width in ThemeSettingsModal:
            // 340px below xl (1280), 400px at xl+.
            const themeDrawerWidth = windowWidth >= 1280 ? 400 : 340;

            if (!isPreviewFullscreen) {
                if (windowWidth >= 768) {
                    availableWidth -= 450; // Editor sidebar
                }
                if (isThemePanelOpen && windowWidth >= 640) {
                    availableWidth -= themeDrawerWidth;
                }
            }
            // Left pad (lg:pl-12 = 48px) + right pad. When the drawer is
            // open the right side reserves drawer width + 48px gap so the
            // resume page doesn't kiss the drawer edge (matches the left
            // breathing room). When closed, normal 48px right pad.
            availableWidth -= isThemePanelOpen ? 96 : 96;

            const targetWidth = 794; // A4 width at 96 DPI

            // Fit-to-screen: also bound by viewport height so the first page
            // is fully visible without scrolling. App header is h-16 (64px).
            // Container padding is lg:py-12 (96px total) in editor mode,
            // p-8 (64px total) in fullscreen. 40px bottom buffer.
            const headerHeight = 64;
            const verticalPadding = isPreviewFullscreen ? 48 : 64;
            const availableHeight = windowHeight - headerHeight - verticalPadding - 16;
            const targetHeight = 1123; // A4 height at 96 DPI

            const widthScale = availableWidth / targetWidth;
            const heightScale = availableHeight / targetHeight;
            // Overshoot the fit so text reads at a comfortable size, but
            // NEVER exceed the available width — if we did, the resume would
            // be wider than the content box, flex auto-margins would collapse,
            // and the page would left-align (visible gap only on the right,
            // looking lopsided against the Design drawer).
            const overshot = Math.min(widthScale, heightScale) * 1.35;
            const fitScale = Math.min(overshot, widthScale);

            // Preview mode = compact: smaller cap so the paper reads as a
            // contained document, not a magnified billboard. Regular editor
            // mode = 1.3 to fill wide screens. Floor is intentionally low
            // (0.18) so on narrow viewports with both drawers open, the
            // preview still scales down enough to stay fully visible
            // instead of bleeding to the right under the drawer.
            const maxScale = isPreviewFullscreen ? 1.3 : 1.5;
            setScale(Math.max(0.18, Math.min(fitScale, maxScale)));
        };

        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isPreviewFullscreen, isThemePanelOpen]);

    // Autosave: pipe every resume edit into the active profile inside the
    // profiles store. The store helper handles localStorage persistence with
    // its own try/catch so we surface storage failures once per session via
    // the warning ref below.
    const autosaveFailedRef = React.useRef(false);
    useEffect(() => {
        try {
            setProfilesStore((prev) => patchActiveResume(prev, resume));
            autosaveFailedRef.current = false;
        } catch (err) {
            if (!autosaveFailedRef.current) {
                autosaveFailedRef.current = true;
                console.warn(
                    '[Autosave] profiles store write failed — your changes will NOT persist across refreshes.',
                    {
                        reason: err?.name === 'QuotaExceededError' ? 'Storage quota exceeded' : err?.message,
                        tip: 'If you are in private/incognito mode, your data is held in memory only.',
                    }
                );
            }
        }
    }, [resume]);

    // Dynamic Pagination Logic
    useEffect(() => {
        let timeoutId;
        let cancelled = false;

        const calculatePages = async () => {
            if (cancelled) return;
            setIsCalculatingLayout(true);

            // Wait for web fonts to finish loading before measuring. Custom
            // fonts (Playfair Display etc.) load asynchronously; if we
            // measure before they swap in, items measure at fallback-font
            // height, pagination decides the wrong split, then the real font
            // swaps in and the layout visibly "jumps". This blocks ~tens of
            // ms on first paint, then resolves instantly.
            if (document.fonts && document.fonts.ready) {
                try {
                    await document.fonts.ready;
                } catch {
                    // ignore — fall through to measurement
                }
            }
            if (cancelled) return;

            const hiddenContainer = document.getElementById('measurement-container');
            if (!hiddenContainer) {
                setIsCalculatingLayout(false);
                return;
            }

            // --- CANVAS LAYOUT PAGINATION ---
            if (selectedTemplate.layout === 'canvas') {
                const elements = hiddenContainer.querySelectorAll('.draggable-container');
                let maxBottom = 0;
                elements.forEach((el) => {
                    const bottom = el.offsetTop + el.offsetHeight;
                    if (bottom > maxBottom) maxBottom = bottom;
                });

                const pageHeight = 1123; // A4 height in px (approx)
                const totalPages = Math.max(1, Math.ceil(maxBottom / pageHeight));

                setPagedData(new Array(totalPages).fill(resume));
                setIsCalculatingLayout(false);
                return;
            }

            // --- STANDARD LAYOUT PAGINATION ---
            // Measure all potential elements
            const heights = {};

            // Total rendered content height of the layout in the hidden mirror.
            // The mirror renders with `h-auto overflow-visible` (isMeasurement
            // mode), so its offsetHeight reflects the natural height of the
            // entire resume. If that's ≤ page budget, the engine can fast-path
            // to a single page without any item-by-item math — eliminating the
            // "everything fits on page 1 for a moment, then jumps to page 2"
            // flash caused by conservative per-item splitting decisions.
            const measuredRoot = hiddenContainer.firstElementChild;
            if (measuredRoot) {
                heights['__total_content'] = measuredRoot.offsetHeight;
            }

            // Measure Header
            const header = hiddenContainer.querySelector('#section-personal');
            if (header) heights['section-personal'] = header.offsetHeight;

            // Measure Contact (for Sidebar Right)
            const contact = hiddenContainer.querySelector('#section-contact');
            if (contact) heights['section-contact'] = contact.offsetHeight;

            // Measure Sections and Items
            resume.sectionOrder.forEach((sectionId) => {
                const section = hiddenContainer.querySelector(`#section-${sectionId}`);
                if (section) heights[`section-${sectionId}`] = section.offsetHeight;

                const title = hiddenContainer.querySelector(`#section-title-${sectionId}`);
                if (title) heights[`section-title-${sectionId}`] = title.offsetHeight;

                // Measure items
                const isListSection =
                    ['experience', 'education'].includes(sectionId) ||
                    resume.customSections.some((cs) => cs.id === sectionId);

                if (isListSection) {
                    let items = [];
                    if (sectionId === 'experience') items = resume.experience;
                    else if (sectionId === 'education') items = resume.education;
                    else {
                        const cs = resume.customSections.find((s) => s.id === sectionId);
                        if (cs) items = cs.items;
                    }

                    items.forEach((item) => {
                        const itemEl = hiddenContainer.querySelector(`#item-${item.id}`);
                        if (itemEl) heights[`item-${item.id}`] = itemEl.offsetHeight;
                    });
                }
            });

            // Per-layout fill ceiling. The pagination engine reserves PADDING
            // off the top, so effective content budget = ceiling - PADDING.
            // Pushed close to the literal page boundary; any minor spillover
            // is clipped by `overflow: hidden` on .resume-paper, which is fine
            // — better than leaving 200-500px of empty space at the bottom.
            // Numbers below are for A4 (~1123px @96dpi). Letter is ~64px
            // shorter, so we subtract that delta at the end.
            // Per-layout fill ceiling. Bumped close to the literal A4 height
            // (1123px @96dpi) so the engine uses every available pixel —
            // overflow:hidden on the page wrapper trims any final-pixel
            // overhang, and the OVERFLOW_SLACK constant in pagination.js
            // grants additional measurement-variance slack. Net effect: short
            // tail sections (education, skills) stay with experience on
            // page 1 instead of getting pushed to a half-empty page 2.
            const ceilingByLayout = {
                gold: 1145,
                executive: 1140,
                'sidebar-left': 1140,
                'sidebar-right': 1140,
                creative: 1140,
                google: 1140,
                'bold-recruit': 1140,
                'executive-serif': 1135,
                'navy-modern': 1140,
                'minimal-mono': 1140,
            };
            const baseCeiling = ceilingByLayout[selectedTemplate.layout] || 1140;
            const paper = resolvePaperSize(resume);
            // Adjust the budget by the height delta vs. A4 so the same layout
            // tunings work for Letter without per-template re-tuning.
            const A4_HEIGHT_PX = 1123;
            const paperHeightPx = (paper.heightMm / 25.4) * 96;
            // Page-margin preset scales the layout content visually (see
            // index.css `.resume-paper > *:first-child { transform: scale(...) }`).
            // With transform-origin: center, scaling by `s` shifts the
            // visible window: at s<1 the visual content stops short of the
            // page bottom AND the top, so pagination should pack MORE to
            // make the bottom whitespace symmetric with the top; at s>1
            // the content overflows top + bottom (clipped), so pagination
            // should pack LESS to avoid losing the last bullet.
            // Correct multiplier is 1/s in both directions.
            const PAGE_CONTENT_SCALES = { compact: 1.04, standard: 1.0, spacious: 0.94 };
            const contentScale = PAGE_CONTENT_SCALES[resume.pageMargins] ?? 1.0;
            const paperBudget = baseCeiling - (A4_HEIGHT_PX - paperHeightPx);
            const maxPageHeight = Math.round(paperBudget / contentScale);
            const pages = paginateResume(resume, heights, maxPageHeight, selectedTemplate.layout);
            if (cancelled) return;
            setPagedData(pages);
            setIsCalculatingLayout(false);
        };

        // Debounce the heavy DOM calculations by 500ms to prevent lag while typing.
        // Wrap in two rAF frames so fonts + layout have committed before we read
        // offsetHeight — otherwise measurements skew tall (web-font fallback) and
        // pagination forces premature page breaks, leaving big bottom whitespace.
        timeoutId = setTimeout(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => calculatePages());
            });
        }, 500);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [resume, selectedTemplate]);

    // Drag & Drop Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event, section) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setResume((prev) => {
                const list = prev[section];
                // Check if list contains objects with ids or just strings (skills)
                const isStringArray = typeof list[0] === 'string';

                const oldIndex = isStringArray
                    ? list.indexOf(active.id)
                    : list.findIndex((item) => item.id === active.id);

                const newIndex = isStringArray
                    ? list.indexOf(over.id)
                    : list.findIndex((item) => item.id === over.id);

                return {
                    ...prev,
                    [section]: arrayMove(prev[section], oldIndex, newIndex),
                };
            });
        }
    };

    // --- Actions ---

    const handlePersonalChange = (e) => {
        const { name, value } = e.target;
        setResume((prev) => ({
            ...prev,
            personal: { ...prev.personal, [name]: value },
        }));
    };

    const handleAddSocial = () => {
        setResume((prev) => ({
            ...prev,
            personal: {
                ...prev.personal,
                socials: [...(prev.personal.socials || []), { id: Date.now(), network: 'New Link', url: '' }],
            },
        }));
    };

    const handleSocialChange = (id, field, value) => {
        setResume((prev) => ({
            ...prev,
            personal: {
                ...prev.personal,
                socials: prev.personal.socials.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
            },
        }));
    };

    const handleRemoveSocial = (id) => {
        setResume((prev) => ({
            ...prev,
            personal: {
                ...prev.personal,
                socials: prev.personal.socials.filter((s) => s.id !== id),
            },
        }));
    };

    const handleArrayChange = (section, id, field, value) => {
        setResume((prev) => ({
            ...prev,
            [section]: prev[section].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
        }));
    };

    const handleCoverLetterChange = (section, field, value) => {
        setResume((prev) => ({
            ...prev,
            coverLetter: { ...prev.coverLetter, [field]: value },
        }));
    };

    const addItem = (section) => {
        const newItem =
            section === 'experience'
                ? {
                      id: Date.now(),
                      role: 'Role',
                      company: 'Company',
                      date: 'Date',
                      description: 'Description',
                  }
                : { id: Date.now(), degree: 'Degree', school: 'School', date: 'Date' };
        setResume((prev) => ({ ...prev, [section]: [...prev[section], newItem] }));
    };

    const removeItem = (section, id) => {
        setResume((prev) => ({ ...prev, [section]: prev[section].filter((item) => item.id !== id) }));
    };

    // --- Custom Section Actions ---

    const addCustomSection = () => {
        const id = crypto.randomUUID();
        const title = 'New Section';
        setResume((prev) => ({
            ...prev,
            customSections: [
                ...prev.customSections,
                { id, title, items: [] }, // Items will follow the same structure as Experience/Education
            ],
            sectionOrder: [...prev.sectionOrder, id],
        }));
        setActiveSection(id);
    };

    const removeCustomSection = (sectionId) => {
        setResume((prev) => ({
            ...prev,
            customSections: prev.customSections.filter((s) => s.id !== sectionId),
            sectionOrder: prev.sectionOrder.filter((id) => id !== sectionId),
        }));
        setActiveSection('personal');
    };

    const updateCustomSectionTitle = (sectionId, newTitle) => {
        setResume((prev) => ({
            ...prev,
            customSections: prev.customSections.map((s) =>
                s.id === sectionId ? { ...s, title: newTitle } : s
            ),
        }));
    };

    const addCustomItem = (sectionId) => {
        setResume((prev) => ({
            ...prev,
            customSections: prev.customSections.map((s) =>
                s.id === sectionId
                    ? {
                          ...s,
                          items: [
                              ...s.items,
                              {
                                  id: crypto.randomUUID(),
                                  title: '',
                                  subtitle: '',
                                  date: '',
                                  description: '',
                              },
                          ],
                      }
                    : s
            ),
        }));
    };

    const removeCustomItem = (sectionId, itemId) => {
        setResume((prev) => ({
            ...prev,
            customSections: prev.customSections.map((s) =>
                s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s
            ),
        }));
    };

    const updateCustomItem = (sectionId, itemId, field, value) => {
        setResume((prev) => ({
            ...prev,
            customSections: prev.customSections.map((s) =>
                s.id === sectionId
                    ? {
                          ...s,
                          items: s.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)),
                      }
                    : s
            ),
        }));
    };

    // Toggle Page Break for a section
    const togglePageBreak = (sectionId) => {
        setResume((prev) => ({
            ...prev,
            pageBreaks: {
                ...prev.pageBreaks,
                [sectionId]: !prev.pageBreaks?.[sectionId],
            },
        }));
    };

    // Real Resume Parsing
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsParsing(true);

        try {
            console.log('file', file);
            const parsedData = await parseResume(file);
            console.log('parsedData', parsedData);
            if (parsedData) {
                // Merge parsed data with initial structure to ensure all fields exist
                setResume((prev) => ({
                    ...prev,
                    personal: { ...prev.personal, ...parsedData.personal },
                    skills:
                        parsedData.skills && parsedData.skills.length
                            ? normalizeSkills(parsedData.skills)
                            : prev.skills,
                    experience:
                        parsedData.experience && parsedData.experience.length
                            ? parsedData.experience
                            : prev.experience,
                    education:
                        parsedData.education && parsedData.education.length
                            ? parsedData.education
                            : prev.education,
                }));

                // If we want to fully replace:
                // setResume({ ...initialData, ...parsedData });
                // But we need to ensure IDs are there for arrays.
                // The parser returns empty arrays for exp/edu currently.
            }
        } catch (error) {
            console.error('Parsing failed', error);
            alert(`Failed to parse resume: ${error.message}`);
        } finally {
            setIsParsing(false);
            setView('editor');
        }
    };

    const contentRef = React.useRef(null);
    const aiMenuRef = React.useRef(null);
    const exportMenuRef = React.useRef(null);

    // Close the header dropdowns on any click outside their wrapping
    // container. Each ref wraps both the trigger button and the menu, so
    // clicks on the button itself are still "inside" and won't double-toggle.
    useEffect(() => {
        const aiOpen = modals.is('aiMenu');
        const exportOpen = modals.is('exportMenu');
        if (!aiOpen && !exportOpen) return;
        const handleDown = (e) => {
            if (aiOpen && aiMenuRef.current && !aiMenuRef.current.contains(e.target)) {
                modals.close('aiMenu');
            }
            if (exportOpen && exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
                modals.close('exportMenu');
            }
        };
        document.addEventListener('mousedown', handleDown);
        return () => document.removeEventListener('mousedown', handleDown);
        // modals is referentially stable per the useModalState memo; we only
        // rebind when either menu opens or closes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modals.is('aiMenu'), modals.is('exportMenu')]);

    // True-WYSIWYG PDF export. Sends the rendered preview HTML to the
    // server's Puppeteer endpoint so the downloaded PDF is pixel-identical
    // to what the user sees. If the server is offline (no /api/generate-pdf),
    // the helper falls back to window.print() — the @media print rules in
    // index.css already force only the resume pages to render at A4, so the
    // visual output still matches the preview.
    const baseFileName = () => (resume?.personal?.fullName || 'Resume').replace(/\s+/g, '_');

    // useCallback because handleDownloadPDF is in the keyboard shortcut
    // useEffect's deps list. Without memoization the effect re-binds on
    // every render — wasted work and a noisy lint warning.
    const handleDownloadPDF = React.useCallback(async () => {
        const result = await exportResumePdf({
            filename: `${baseFileName()}_Resume.pdf`,
            paperSize: resume?.paperSize || 'A4',
        });

        if (result.ok && result.method === 'server') {
            modals.open('share');
        } else if (result.ok && result.method === 'print') {
            console.info('[Export] Used browser print fallback because:', result.reason);
        } else {
            alert(`Failed to generate PDF: ${result.reason || 'unknown error'}`);
        }
        // baseFileName() reads `resume`; modals is a stable ref from the hook.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resume, modals]);

    // DOCX export — separate pipeline (structural Word document built from
    // resume data, not from preview HTML). Recruiters and ATSes that prefer
    // .docx benefit from real Word styles and bullet lists.
    const handleDownloadDOCX = async () => {
        const result = await exportResumeDocx({
            resume,
            templateId: selectedTemplate.layout,
            filename: `${baseFileName()}_Resume.docx`,
        });
        if (result.ok) {
            modals.open('share');
        } else {
            alert(
                `Failed to generate DOCX: ${result.reason || 'unknown error'}\n\nMake sure the server is running.`
            );
        }
    };

    // Global keyboard shortcuts. Centralized in one listener so we can keep
    // editable-field detection consistent — we don't want Cmd+Z to fight a
    // contenteditable inside the editor, and `?` shouldn't fire while the
    // user is typing a question mark into an input.
    useEffect(() => {
        const isEditableTarget = (target) => {
            if (!target) return false;
            const tag = target.tagName;
            return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
        };

        const handler = (e) => {
            const mod = e.metaKey || e.ctrlKey;

            // Cmd/Ctrl + P → export PDF (overrides browser print)
            if (mod && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                handleDownloadPDF();
                return;
            }

            // Cmd/Ctrl + Shift + Z → redo (check first because Shift modifies Z)
            if (mod && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                if (canRedo) redo();
                return;
            }
            // Cmd/Ctrl + Z → undo
            if (mod && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                if (canUndo) undo();
                return;
            }

            // ? → open shortcuts cheatsheet (only when not typing in a field)
            if (e.key === '?' && !isEditableTarget(e.target)) {
                e.preventDefault();
                modals.toggle('shortcuts');
                return;
            }

            // Cmd/Ctrl + K → Smart Tailor. Standard "command palette" key in
            // most modern apps — repurposed here for our flagship AI feature
            // so power users can fire it without reaching for the mouse.
            if (mod && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                modals.toggle('autoTailor');
                return;
            }
            // Cmd/Ctrl + J → Job Tracker.
            if (mod && (e.key === 'j' || e.key === 'J')) {
                e.preventDefault();
                modals.toggle('jobTracker');
                return;
            }
            // Cmd/Ctrl + D → Design panel (toggle the side drawer).
            // Browser default for Cmd+D is "bookmark this page" — overriding
            // here is mildly aggressive, but the editor is a tool, not a
            // bookmarkable destination.
            if (mod && (e.key === 'd' || e.key === 'D')) {
                e.preventDefault();
                modals.toggle('theme');
                return;
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleDownloadPDF, undo, redo, canUndo, canRedo, modals]);

    // Esc closes the fullscreen preview — matches iOS Quick Look gesture.
    useEffect(() => {
        if (!isPreviewFullscreen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setIsPreviewFullscreen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isPreviewFullscreen]);

    const handleStyleUpdate = (id, patch) => {
        // patch can carry {x, y, w, h} from a drag/resize OR {style: {...}}
        // from the inspector — merge into the existing entry instead of
        // overwriting so position survives style edits and vice versa.
        setResume((prev) => ({
            ...prev,
            customStyles: {
                ...prev.customStyles,
                [id]: { ...(prev.customStyles?.[id] || {}), ...patch },
            },
        }));
    };

    // Canvas (Pro) — custom blocks added via the library palette.
    const handleAddCanvasBlock = (block) => {
        setResume((prev) => ({
            ...prev,
            canvasBlocks: [...(prev.canvasBlocks || []), block],
        }));
    };

    const handleUpdateCanvasBlock = (id, patch) => {
        setResume((prev) => ({
            ...prev,
            canvasBlocks: (prev.canvasBlocks || []).map((b) => (b.id === id ? { ...b, ...patch } : b)),
        }));
    };

    const handleUpdateCanvasBlockStyle = (id, style) => {
        setResume((prev) => ({
            ...prev,
            canvasBlocks: (prev.canvasBlocks || []).map((b) =>
                b.id === id ? { ...b, style: { ...(b.style || {}), ...style } } : b
            ),
        }));
    };

    const handleDeleteCanvasBlock = (id) => {
        setResume((prev) => ({
            ...prev,
            canvasBlocks: (prev.canvasBlocks || []).filter((b) => b.id !== id),
        }));
    };

    // --- RENDERERS ---

    const renderLayout = (templateId, data = resume, pageIndex = 0, isMeasurement = false) => {
        const template = TEMPLATES.find((t) => t.id === templateId) || selectedTemplate;
        const props = {
            data,
            theme: template.theme, // Use template.theme
            pageIndex,
            isMeasurement,
            onUpdateStyle: handleStyleUpdate,
            onAddCanvasBlock: handleAddCanvasBlock,
            onUpdateCanvasBlock: handleUpdateCanvasBlock,
            onUpdateCanvasBlockStyle: handleUpdateCanvasBlockStyle,
            onDeleteCanvasBlock: handleDeleteCanvasBlock,
        };
        switch (template.layout) {
            case 'classic':
                return <LayoutClassic {...props} />;
            case 'sidebar-left':
                return <LayoutSidebarLeft {...props} />;
            case 'sidebar-right':
                return <LayoutSidebarRight {...props} />;
            case 'minimal':
                return <LayoutMinimal {...props} />;
            case 'ats':
                return <LayoutAts {...props} />;
            case 'jakes':
                return <LayoutJakes {...props} />;
            case 'freeform':
                return <LayoutFreeform {...props} />;
            case 'canvas':
                return <LayoutCanvas {...props} />;
            case 'executive':
                return <LayoutExecutive {...props} />;
            case 'gold':
                return <LayoutGold {...props} />;
            case 'google':
                return <LayoutGoogle {...props} />;
            case 'bold-recruit':
                return <LayoutBoldRecruit {...props} />;
            case 'executive-serif':
                return <LayoutExecutiveSerif {...props} />;
            case 'navy-modern':
                return <LayoutNavyModern {...props} />;
            case 'minimal-mono':
                return <LayoutMinimalMono {...props} />;
            default:
                return <LayoutClassic {...props} />;
        }
    };

    // Show tutorial when entering editor (only once per user)
    const isOnboarding = modals.is('onboarding');
    const isTutorial = modals.is('tutorial');
    useEffect(() => {
        if (view === 'editor' && !isOnboarding && !isTutorial) {
            const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
            if (!hasSeenTutorial) {
                const timer = setTimeout(() => {
                    modals.open('tutorial');
                    localStorage.setItem('hasSeenTutorial', 'true');
                }, 800);
                return () => clearTimeout(timer);
            }
        }
        // modals reference is stable per render thanks to useMemo in the hook;
        // we only re-fire when the boolean state changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, isOnboarding, isTutorial]);

    // --- VIEW: ONBOARDING ---
    if (modals.is('onboarding')) {
        return (
            <>
                <OnboardingModal
                    isOpen={modals.is('onboarding')}
                    onClose={() => modals.close('onboarding')}
                    onCreateNew={() => {
                        setResume(initialData);
                        modals.close('onboarding');
                        setView('editor');
                    }}
                    onUpload={() => {
                        document.getElementById('hidden-file-input').click();
                    }}
                />
                <input
                    type="file"
                    id="hidden-file-input"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => {
                        handleFileUpload(e);
                        modals.close('onboarding');
                        setView('editor');
                    }}
                />
            </>
        );
    }

    // --- VIEW: GALLERY ---
    if (view === 'gallery') {
        return (
            <LandingPage
                onSelectTemplate={(template) => {
                    setSelectedTemplate(template);
                    modals.open('onboarding');
                }}
            />
        );
    }

    // --- VIEW: EDITOR ---

    return (
        <div className="min-h-screen bg-stone-100 dark:bg-slate-950 text-slate-900 dark:text-stone-100 font-sans flex flex-col h-screen overflow-x-hidden relative">
            {/* Subtle background tint for the editor workspace */}
            <div className="fixed inset-0 z-[-1] bg-stone-100 dark:bg-slate-950"></div>
            {/* Print Styles */}

            {/* Overflow Warning Banner */}
            {isOverflowing && (
                <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between no-print z-30">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <span className="font-medium">
                            ⚠️ Resume exceeds 1 page! Check the gray page separators.
                        </span>
                    </div>
                </div>
            )}

            {/* Hidden File Input for Onboarding */}
            <input
                type="file"
                id="hidden-file-input"
                className="hidden"
                accept=".pdf,.docx,.doc"
                onChange={(e) => {
                    handleFileUpload(e);
                    modals.close('onboarding');
                    setView('editor');
                }}
            />

            {/* Editor Header (dark chrome over light workspace). In preview
                mode we keep it but slim it down — AI Assistant + Download stay
                accessible, secondary chrome (templates link, help, undo/redo,
                "Editing" label) hides for an iOS Quick Look feel. */}
            <header
                className="h-16 flex items-center justify-between px-6 flex-shrink-0 z-50 no-print
        bg-slate-950 border-b border-white/10"
            >
                <div className="flex items-center gap-4">
                    <div
                        onClick={() => setView('gallery')}
                        className="cursor-pointer group flex items-center justify-center p-2 rounded-xl hover:bg-white/5 transition-colors mr-2"
                    >
                        <Logo className="w-8 h-8" textClassName="text-xl hidden md:block" tone="light" />
                    </div>
                    {!isPreviewFullscreen && (
                        <>
                            <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />
                            <button
                                onClick={() => setView('gallery')}
                                className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-all hover:translate-x-[-2px]"
                            >
                                <ArrowLeft size={16} /> Templates
                            </button>
                            <div className="h-6 w-px bg-white/10 mx-2" />
                            <button
                                onClick={() => modals.open('tutorial')}
                                className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors"
                                title="Show tutorial"
                            >
                                <Sparkles size={16} className="text-amber-400/80" />
                                <span className="hidden lg:inline">Help</span>
                            </button>
                            <button
                                onClick={() => modals.open('jobTracker')}
                                className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors"
                                title="Job application tracker"
                            >
                                <Briefcase size={16} className="text-sky-400/80" />
                                <span className="hidden lg:inline">Jobs</span>
                            </button>
                            <div className="h-6 w-px bg-white/10 mx-2" />
                            <h1 className="font-semibold text-sm tracking-wide hidden lg:block text-gray-300">
                                Editing{' '}
                                <span className="text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md ml-1 border border-brand-500/20">
                                    {selectedTemplate.name}
                                </span>
                            </h1>
                        </>
                    )}
                    {isPreviewFullscreen && (
                        <span className="hidden md:inline text-xs uppercase tracking-[0.2em] text-gray-400 ml-2">
                            Preview
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    {/* Fullscreen Preview Toggle — hides both sidebars and
                        scales the resume up so it fills the canvas. */}
                    <button
                        onClick={() => setIsPreviewFullscreen((v) => !v)}
                        className="hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5"
                        title={isPreviewFullscreen ? 'Exit fullscreen preview' : 'Fullscreen preview'}
                    >
                        {isPreviewFullscreen ? <Minimize2 size={16} /> : <Eye size={16} />}
                        <span className="text-sm tracking-wide">
                            {isPreviewFullscreen ? 'Exit Preview' : 'Preview'}
                        </span>
                    </button>

                    {/* Undo/Redo Controls (Minimal) — hidden in preview mode */}
                    <div
                        className={`${isPreviewFullscreen ? 'hidden' : 'hidden lg:flex'} items-center gap-0.5 mr-4 bg-white/5 rounded-full p-1 border border-white/5`}
                    >
                        <button
                            onClick={undo}
                            disabled={!canUndo}
                            className={`p-1.5 rounded-full transition-all duration-200 ${!canUndo ? 'opacity-30 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:text-white hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]'}`}
                            title="Undo"
                        >
                            <Undo size={16} />
                        </button>
                        <button
                            onClick={redo}
                            disabled={!canRedo}
                            className={`p-1.5 rounded-full transition-all duration-200 ${!canRedo ? 'opacity-30 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:text-white hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]'}`}
                            title="Redo"
                        >
                            <Redo size={16} />
                        </button>
                    </div>

                    {/* Group 1: AI Assistant Dropdown */}
                    <div className="relative" ref={aiMenuRef}>
                        <button
                            onClick={() => {
                                modals.toggle('aiMenu');
                                modals.close('exportMenu');
                            }}
                            disabled={isImproving}
                            className="hidden lg:flex items-center gap-2.5 bg-white/5 backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isImproving ? (
                                <Loader size={18} className="animate-spin text-brand-400" />
                            ) : (
                                <Bot
                                    size={18}
                                    className="text-brand-400 group-hover:scale-110 transition-transform"
                                />
                            )}
                            <span className="text-sm tracking-wide">
                                {isImproving ? 'Improving...' : 'AI Assistant'}
                            </span>
                            {!isImproving && (
                                <ChevronDown
                                    size={14}
                                    className={`text-gray-400 transition-transform duration-300 ${modals.is('aiMenu') ? 'rotate-180' : ''}`}
                                />
                            )}
                        </button>

                        {/* Dropdown Content */}
                        {modals.is('aiMenu') && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 space-y-1">
                                    {/* Smart Tailor — our differentiator. Non-destructive
                                        bullet reranking. Pinned at the top of the AI menu so
                                        users see the voice-preserving option BEFORE the
                                        destructive "Tailor to Job" rewrite below. */}
                                    <button
                                        onClick={() => {
                                            modals.open('autoTailor');
                                            modals.close('aiMenu');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-lg transition-colors text-left border border-transparent hover:border-emerald-200"
                                    >
                                        <div className="p-2 bg-gradient-to-br from-emerald-100 to-brand-100 text-emerald-700 rounded-lg">
                                            <Sparkles size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold text-sm flex items-center gap-1.5">
                                                Smart Tailor
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 leading-none">
                                                    NEW
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 leading-tight">
                                                Rank your bullets for a JD &mdash; keeps your voice.
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            modals.open('jobAssistant');
                                            modals.close('aiMenu');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-brand-50 text-gray-700 hover:text-brand-700 rounded-lg transition-colors text-left"
                                    >
                                        <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                                            <Briefcase size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Tailor to Job</div>
                                            <div className="text-xs text-gray-500">
                                                Full rewrite for a specific role
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleImproveResume();
                                            modals.close('aiMenu');
                                        }}
                                        disabled={isImproving}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-lg transition-colors text-left disabled:opacity-50"
                                    >
                                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                            {isImproving ? (
                                                <Loader size={18} className="animate-spin" />
                                            ) : (
                                                <Sparkles size={18} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Improve Writing</div>
                                            <div className="text-xs text-gray-500">
                                                Fix grammar & polish tone
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            modals.open('ats');
                                            modals.close('aiMenu');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-brand-50 text-gray-700 hover:text-brand-700 rounded-lg transition-colors text-left"
                                    >
                                        <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                                            <CheckCircle size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Check ATS Score</div>
                                            <div className="text-xs text-gray-500">Optimize for bots</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            modals.open('roast');
                                            modals.close('aiMenu');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-lg transition-colors text-left"
                                    >
                                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                            <Flame size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Roast My Resume</div>
                                            <div className="text-xs text-gray-500">Get brutal feedback</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            modals.open('coverLetter');
                                            modals.close('aiMenu');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-lg transition-colors text-left"
                                    >
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Cover Letter</div>
                                            <div className="text-xs text-gray-500">
                                                AI-generated from resume + JD
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Group 1.5: Design (Templates + Theme) — promoted to the top
                        header so new users can discover template switching
                        and design customization without hunting through the
                        editor sidebar. Toggles the right-side Design drawer
                        which contains: Template picker, Paper size, Accent,
                        Margins, Header alignment, ATS view, Themes, Fonts,
                        Text sizes. */}
                    <button
                        onClick={() => modals.toggle('theme')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border ${
                            isThemePanelOpen
                                ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-800'
                                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-stone-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        title="Design — templates, colors, fonts (⌘D)"
                        aria-pressed={isThemePanelOpen}
                    >
                        <LayoutGrid size={16} />
                        <span className="hidden sm:inline tracking-wide text-sm">Design</span>
                    </button>

                    {/* Group 2: Export Dropdown */}
                    <div className="relative" ref={exportMenuRef}>
                        <button
                            onClick={() => {
                                modals.toggle('exportMenu');
                                modals.close('aiMenu');
                            }}
                            className="flex items-center gap-2.5 bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5 border border-brand-500/60"
                        >
                            <Download size={18} className="animate-bounce-subtle" />
                            <span className="hidden sm:inline tracking-wide text-sm">Export</span>
                            <ChevronDown
                                size={14}
                                className={`transition-transform duration-300 ${modals.is('exportMenu') ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {modals.is('exportMenu') && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl dark:shadow-black/40 border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => {
                                            handleDownloadPDF();
                                            modals.close('exportMenu');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-gray-700 dark:text-stone-200 hover:text-brand-700 dark:hover:text-brand-300 rounded-lg transition-colors text-left"
                                    >
                                        <div className="p-2 bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-lg">
                                            <Download size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Download PDF</div>
                                            <div className="text-xs text-gray-500 dark:text-stone-400">
                                                Pixel-match to preview
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleDownloadDOCX();
                                            modals.close('exportMenu');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-700 dark:text-stone-200 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-colors text-left"
                                    >
                                        <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Download DOCX</div>
                                            <div className="text-xs text-gray-500 dark:text-stone-400">
                                                Editable Word document
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Bar (Bottom) — hidden in fullscreen preview */}
            <div
                className={`lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 z-50 ${isPreviewFullscreen ? 'hidden' : 'flex'} justify-around items-center h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.4)]`}
            >
                <button
                    onClick={() => setMobileView('editor')}
                    className={`flex flex-col items-center gap-1 p-2 ${mobileView === 'editor' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-stone-400'}`}
                >
                    <FileText size={20} />
                    <span className="text-xs font-bold">Edit</span>
                </button>
                <button
                    onClick={() => setMobileView('preview')}
                    className={`flex flex-col items-center gap-1 p-2 ${mobileView === 'preview' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-stone-400'}`}
                >
                    <Layout size={20} />
                    <span className="text-xs font-bold">Preview</span>
                </button>
            </div>

            <div className="w-full flex-1 flex flex-row overflow-hidden relative pb-16 lg:pb-0">
                {/* Left: Editor Sidebar — hidden in fullscreen preview mode */}
                {!isPreviewFullscreen && (
                    <EditorSidebar
                        mobileView={mobileView}
                        setView={setView}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        resume={resume}
                        setResume={setResume}
                        sensors={sensors}
                        handleDragEnd={handleDragEnd}
                        removeCustomSection={removeCustomSection}
                        togglePageBreak={togglePageBreak}
                        addCustomSection={addCustomSection}
                        handlePersonalChange={handlePersonalChange}
                        handleSocialChange={handleSocialChange}
                        handleAddSocial={handleAddSocial}
                        handleRemoveSocial={handleRemoveSocial}
                        handleArrayChange={handleArrayChange}
                        removeItem={removeItem}
                        addItem={addItem}
                        handleCoverLetterChange={handleCoverLetterChange}
                        updateCustomSectionTitle={updateCustomSectionTitle}
                        updateCustomItem={updateCustomItem}
                        removeCustomItem={removeCustomItem}
                        addCustomItem={addCustomItem}
                        profiles={profilesStore.profiles}
                        activeProfileId={activeProfile.id}
                        onSwitchProfile={handleSwitchProfile}
                        onCreateProfile={handleCreateProfile}
                        onDuplicateProfile={handleDuplicateProfile}
                        onRenameProfile={handleRenameProfile}
                        onDeleteProfile={handleDeleteProfile}
                    />
                )}

                <div
                    className={
                        isPreviewFullscreen
                            ? // Compact iOS Quick Look-style overlay: slim dark backdrop below
                              // the editor header (which remains visible so AI Assistant and
                              // Export stay accessible). Resume centered, scaled down for a
                              // contained "preview of a document" feel.
                              'fixed inset-x-0 top-16 bottom-0 z-[40] bg-slate-950/95 backdrop-blur-md overflow-auto flex flex-col items-center p-8 gap-8 print-area'
                            : // Split p-12 into px/py — the shorthand at lg would otherwise
                              // override the conditional right-pad below (Tailwind emits
                              // lg:* after sm:*, and `padding` shorthand resets all sides).
                              `${mobileView === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 bg-stone-100 dark:bg-slate-950 overflow-auto h-full relative print-area flex-col items-center p-4 lg:py-12 lg:pl-12 gap-8 pb-24 lg:pb-12 transition-all duration-300 ${isThemePanelOpen ? 'lg:pr-[388px] xl:pr-[448px]' : 'lg:pr-12'}`
                    }
                >
                    {/* Hidden Measurement Container */}
                    <div
                        id="measurement-container"
                        style={{
                            position: 'absolute',
                            visibility: 'hidden',
                            pointerEvents: 'none',
                            width: 'var(--page-width)',
                            zIndex: -1000,
                        }}
                    >
                        {renderLayout(selectedTemplate.id, resume, 0, true)}
                    </div>

                    <div className="w-full flex-col items-center print:block print:w-auto" ref={contentRef}>
                        {pagedData.map((pageData, index) => {
                            const paper = resolvePaperSize(resume);
                            return (
                                <div
                                    key={index}
                                    style={{
                                        width: `${paper.widthMm * scale}mm`,
                                        height: `${paper.heightMm * scale}mm`,
                                        marginBottom: '2rem',
                                    }}
                                    className="relative transition-all duration-300 mx-auto print:mx-0 print:mb-0"
                                >
                                    <div
                                        id={`resume-page-${index + 1}`}
                                        className="resume-paper bg-white shadow-2xl relative overflow-hidden origin-top-left print:shadow-none print:m-0 print:p-0 page-break-after-always"
                                        style={{
                                            width: 'var(--page-width)',
                                            height: 'var(--page-height)',
                                            transform: `scale(${scale})`,
                                        }}
                                    >
                                        {/* Page Number Indicator (only visible in editor, not print) */}
                                        <div className="absolute -right-12 top-0 text-gray-400 font-bold text-xs no-print">
                                            Page {index + 1}
                                        </div>

                                        {/* Page Overflow Indicator */}
                                        <PageOverflowIndicator pageId={`resume-page-${index + 1}`} />

                                        {renderLayout(selectedTemplate.id, pageData, index)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {isCalculatingLayout && (
                        <div className="fixed bottom-8 right-8 bg-brand-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse z-50">
                            <Loader className="animate-spin" size={16} /> Calculating Layout...
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}

            <RoastModal
                isOpen={modals.is('roast')}
                onClose={() => modals.close('roast')}
                resumeData={resume}
                onApplyFix={(fix) => setResume((prev) => applyResumeFix(prev, fix))}
            />

            {improveModalStage && (
                <ImproveResumeModal
                    stage={improveModalStage}
                    errorMessage={improveError}
                    onConfirm={runImproveResume}
                    onRetry={runImproveResume}
                    onClose={() => {
                        // Don't allow closing during the network call — only after.
                        if (improveModalStage !== 'loading') setImproveModalStage(null);
                    }}
                />
            )}

            <JobAssistantModal
                isOpen={modals.is('jobAssistant')}
                onClose={() => modals.close('jobAssistant')}
                onResumeUpdate={(updated) =>
                    setResume({
                        ...updated,
                        skills: normalizeSkills(updated.skills || []),
                    })
                }
            />

            <AutoTailorModal
                isOpen={modals.is('autoTailor')}
                onClose={() => modals.close('autoTailor')}
                resume={resume}
                onResumeChange={setResume}
                onSaveToTracker={jobTracker.addJob}
                activeProfileId={activeProfile?.id}
                activeProfileName={activeProfile?.name}
            />

            {modals.is('atsPreview') && (
                <AtsPreviewModal onClose={() => modals.close('atsPreview')} resume={resume} />
            )}

            <CoverLetterModal
                isOpen={modals.is('coverLetter')}
                onClose={() => modals.close('coverLetter')}
                resume={resume}
            />

            <FeatureTourModal
                isOpen={modals.is('featureTour')}
                onClose={() => {
                    modals.close('featureTour');
                    localStorage.setItem('hasSeenFeatureTour', 'true');
                }}
            />
            {modals.is('ats') && (
                <AtsScoreModal
                    resume={resume}
                    onClose={() => modals.close('ats')}
                    onApplyFix={(fix) => setResume((prev) => applyResumeFix(prev, fix))}
                />
            )}
            {modals.is('tutorial') && <TutorialModal onClose={() => modals.close('tutorial')} />}
            {modals.is('shortcuts') && <KeyboardShortcutsModal onClose={() => modals.close('shortcuts')} />}
            {modals.is('jobTracker') && (
                <JobTrackerModal
                    onClose={() => modals.close('jobTracker')}
                    profiles={profilesStore.profiles}
                    tracker={jobTracker}
                />
            )}
            <ShareModal isOpen={modals.is('share')} onClose={() => modals.close('share')} />
            <ThemeSettingsModal
                isOpen={modals.is('theme')}
                onClose={() => modals.close('theme')}
                resume={resume}
                onResumeChange={setResume}
                onOpenAtsPreview={() => {
                    modals.close('theme');
                    modals.open('atsPreview');
                }}
                templates={TEMPLATES}
                selectedTemplateId={selectedTemplate?.id}
                onSelectTemplate={(t) => setSelectedTemplate(t)}
            />

            {/* Parsing Loader — rotates honest progress messages over the
                ~15-30s upload window so users don't bail thinking it hung. */}
            <ParsingLoader active={isParsing} />
        </div>
    );
};

export default App;
