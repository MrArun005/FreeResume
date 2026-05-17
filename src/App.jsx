import React, { useState, useEffect } from 'react';
import {
    Layout,
    ChevronRight,
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
} from 'lucide-react';
import useHistory from './hooks/useHistory';

import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { TEMPLATES } from './constants/layouts';
import { initialData } from './data/mockData';

// UI Components
import TemplateThumbnail from './components/ui/TemplateThumbnail';
import LandingPage from './components/pages/LandingPage';
import OnboardingModal from './components/ui/OnboardingModal';
import FeatureTourModal from './components/ui/FeatureTourModal';
import TutorialModal from './components/ui/TutorialModal';
import ShareModal from './components/ui/ShareModal';
import Logo from './components/ui/Logo';

// Layout Components
import LayoutClassic from './components/layouts/LayoutClassic';
import LayoutSidebarLeft from './components/layouts/LayoutSidebarLeft';
import LayoutSidebarRight from './components/layouts/LayoutSidebarRight';
import LayoutMinimal from './components/layouts/LayoutMinimal';
import LayoutModernGrid from './components/layouts/LayoutModernGrid';
import LayoutAts from './components/layouts/LayoutAts';
import LayoutJakes from './components/layouts/LayoutJakes';
import LayoutDeedy from './components/layouts/LayoutDeedy';
import LayoutFreeform from './components/layouts/LayoutFreeform';
import LayoutCreative from './components/layouts/LayoutCreative';
import LayoutCanvas from './components/layouts/LayoutCanvas';
import LayoutGlitch from './components/layouts/LayoutGlitch';
import LayoutExecutive from './components/layouts/LayoutExecutive';
import LayoutLeaf from './components/layouts/LayoutLeaf';
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
import BulletPointEditor from './components/ui/BulletPointEditor';
import EditorSidebar from './components/editor/EditorSidebar';
import PreviewPanel from './components/editor/PreviewPanel';
import JobAssistantModal from './components/ui/JobAssistantModal';
import RoastModal from './components/ui/RoastModal';
import ImproveResumeModal from './components/ui/ImproveResumeModal';

import { parseResume } from './utils/resumeParser';
import { paginateResume } from './utils/pagination';
import { normalizeSkills, forceCategorize } from './utils/skillTaxonomy';
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
    const [showAtsModal, setShowAtsModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [showJobAssistant, setShowJobAssistant] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showFeatureTour, setShowFeatureTour] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isImproving, setIsImproving] = useState(false);
    const [showAiMenu, setShowAiMenu] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isRoastModalOpen, setIsRoastModalOpen] = useState(false);

    // Normalize a single resume blob — handles the description→bullets
    // migration and the legacy skills mega-bucket case. Used both for loading
    // a stored resume and for seeding new profiles created via Duplicate.
    const normalizeResumeShape = (parsed) => {
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
            ...parsed,
            experience: (parsed.experience || []).map(migrateItemToBullets),
            customSections: (parsed.customSections || []).map((section) => ({
                ...section,
                items: (section.items || []).map(migrateItemToBullets),
            })),
            skills: normalizeSkills(parsed.skills || []),
            sectionOrder: parsed.sectionOrder || ['summary', 'experience', 'education', 'skills'],
            pageBreaks: parsed.pageBreaks || {},
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
            setTimeout(() => setShowFeatureTour(true), 1000);
        }
    }, [view]);

    // Multi-profile state. The active profile's resume drives the editor;
    // every other profile sits in the store waiting to be switched in.
    const [profilesStore, setProfilesStore] = useState(getInitialProfilesStore);
    const activeProfile = getActiveProfile(profilesStore);

    const [resume, setResume, undo, redo, canUndo, canRedo] = useHistory(activeProfile.resume);

    // Whenever the user switches to a different profile, push that profile's
    // resume into the history stack so the editor reflects the new content.
    // The id-tracking ref prevents this from firing on the autosave loop
    // (where activeId stays the same but the store object changes).
    const lastActiveIdRef = React.useRef(activeProfile.id);
    useEffect(() => {
        if (activeProfile.id !== lastActiveIdRef.current) {
            setResume(activeProfile.resume);
            lastActiveIdRef.current = activeProfile.id;
        }
    }, [activeProfile, setResume]);

    // Profile management handlers — each one runs the corresponding store
    // helper and triggers a re-render via setProfilesStore.
    const handleSwitchProfile = (id) => setProfilesStore((prev) => switchActive(prev, id));
    const handleCreateProfile = (name) =>
        setProfilesStore((prev) => {
            const seed = normalizeResumeShape(initialData);
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
        setImproveModalStage('loading');
        setIsImproving(true);
        setImproveError('');
        try {
            const response = await fetch('/api/improve-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: resume }),
            });

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
    const [pagedData, setPagedData] = useState([initialData]);
    const [isCalculatingLayout, setIsCalculatingLayout] = useState(false);
    const [scale, setScale] = useState(1);

    // Handle Responsive Scaling
    useEffect(() => {
        const handleResize = () => {
            const windowWidth = window.innerWidth;
            let availableWidth = windowWidth;

            // If desktop mode (md breakpoint is 768px), subtract sidebar width
            if (windowWidth >= 768) {
                availableWidth -= 450; // Sidebar width
            }

            // Subtract padding (approx 32px-48px) -> Increased to 96px for better breathing room
            availableWidth -= 96;

            const targetWidth = 794; // A4 width at 96 DPI

            if (availableWidth < targetWidth) {
                const newScale = availableWidth / targetWidth;
                setScale(Math.min(newScale, 1));
            } else {
                setScale(1);
            }
        };

        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

        const calculatePages = async () => {
            setIsCalculatingLayout(true);

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

            // Per-layout fill ceiling (A4 ≈ 1123px). The pagination engine reserves
            // PADDING off the top, so effective content budget = ceiling - PADDING.
            // Pushed close to the literal A4 boundary; any minor spillover is clipped
            // by `overflow: hidden` on .resume-paper, which is fine — better than
            // leaving 200-500px of empty space at the bottom of a page.
            const ceilingByLayout = {
                gold: 1130,
                executive: 1120,
                'sidebar-left': 1120,
                'sidebar-right': 1120,
                creative: 1120,
                google: 1115,
                'bold-recruit': 1115,
                'executive-serif': 1110,
                'navy-modern': 1115,
                'minimal-mono': 1120,
            };
            const maxPageHeight = ceilingByLayout[selectedTemplate.layout] || 1115;
            const pages = paginateResume(resume, heights, maxPageHeight, selectedTemplate.layout);
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

        return () => clearTimeout(timeoutId);
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

    // True-WYSIWYG PDF export. Sends the rendered preview HTML to the
    // server's Puppeteer endpoint so the downloaded PDF is pixel-identical
    // to what the user sees. If the server is offline (no /api/generate-pdf),
    // the helper falls back to window.print() — the @media print rules in
    // index.css already force only the resume pages to render at A4, so the
    // visual output still matches the preview.
    const baseFileName = () => (resume.personal.fullName || 'Resume').replace(/\s+/g, '_');

    const handleDownloadPDF = async () => {
        const result = await exportResumePdf({ filename: `${baseFileName()}_Resume.pdf` });

        if (result.ok && result.method === 'server') {
            setShowShareModal(true);
        } else if (result.ok && result.method === 'print') {
            console.info('[Export] Used browser print fallback because:', result.reason);
        } else {
            alert(`Failed to generate PDF: ${result.reason || 'unknown error'}`);
        }
    };

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
            setShowShareModal(true);
        } else {
            alert(
                `Failed to generate DOCX: ${result.reason || 'unknown error'}\n\nMake sure the server is running.`
            );
        }
    };

    // Handle Cmd+P Override
    useEffect(() => {
        const handlePrintShortcut = (e) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                handleDownloadPDF();
            }
        };

        window.addEventListener('keydown', handlePrintShortcut);
        return () => window.removeEventListener('keydown', handlePrintShortcut);
    });

    const handleStyleUpdate = (id, newPos) => {
        setResume((prev) => ({
            ...prev,
            customStyles: {
                ...prev.customStyles,
                [id]: newPos,
            },
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
            case 'modern-grid':
                return <LayoutModernGrid {...props} />;
            case 'ats':
                return <LayoutAts {...props} />;
            case 'jakes':
                return <LayoutJakes {...props} />;
            case 'deedy':
                return <LayoutDeedy {...props} />;
            case 'freeform':
                return <LayoutFreeform {...props} />;
            case 'creative':
                return <LayoutCreative {...props} />;
            case 'canvas':
                return <LayoutCanvas {...props} />;
            case 'glitch':
                return <LayoutGlitch {...props} />;
            case 'executive':
                return <LayoutExecutive {...props} />;
            case 'leaf':
                return <LayoutLeaf {...props} />;
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
    useEffect(() => {
        if (view === 'editor' && !showOnboarding && !showTutorial) {
            const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
            if (!hasSeenTutorial) {
                const timer = setTimeout(() => {
                    setShowTutorial(true);
                    localStorage.setItem('hasSeenTutorial', 'true');
                }, 800);
                return () => clearTimeout(timer);
            }
        }
    }, [view, showOnboarding, showTutorial]);

    // --- VIEW: ONBOARDING ---
    if (showOnboarding) {
        return (
            <>
                <OnboardingModal
                    isOpen={showOnboarding}
                    onClose={() => setShowOnboarding(false)}
                    onCreateNew={() => {
                        setResume(initialData);
                        setShowOnboarding(false);
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
                        setShowOnboarding(false);
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
                    setShowOnboarding(true);
                }}
            />
        );
    }

    // --- VIEW: EDITOR ---

    return (
        <div className="min-h-screen bg-stone-100 text-slate-900 font-sans flex flex-col h-screen overflow-x-hidden relative">
            {/* Subtle background tint for the editor workspace */}
            <div className="fixed inset-0 z-[-1] bg-stone-100"></div>
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
                    setShowOnboarding(false);
                    setView('editor');
                }}
            />

            {/* Editor Header (dark chrome over light workspace) */}
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
                    <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />
                    <button
                        onClick={() => setView('gallery')}
                        className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-all hover:translate-x-[-2px]"
                    >
                        <ArrowLeft size={16} /> Templates
                    </button>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <button
                        onClick={() => setShowTutorial(true)}
                        className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors"
                        title="Show tutorial"
                    >
                        <Sparkles size={16} className="text-amber-400/80" />
                        <span className="hidden lg:inline">Help</span>
                    </button>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <h1 className="font-semibold text-sm tracking-wide hidden lg:block text-gray-300">
                        Editing{' '}
                        <span className="text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md ml-1 border border-brand-500/20">
                            {selectedTemplate.name}
                        </span>
                    </h1>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    {/* Undo/Redo Controls (Minimal) */}
                    <div className="hidden lg:flex items-center gap-0.5 mr-4 bg-white/5 rounded-full p-1 border border-white/5">
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
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowAiMenu(!showAiMenu);
                                setShowExportMenu(false);
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
                                    className={`text-gray-400 transition-transform duration-300 ${showAiMenu ? 'rotate-180' : ''}`}
                                />
                            )}
                        </button>

                        {/* Dropdown Content */}
                        {showAiMenu && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => {
                                            setShowJobAssistant(true);
                                            setShowAiMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-brand-50 text-gray-700 hover:text-brand-700 rounded-lg transition-colors text-left"
                                    >
                                        <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                                            <Briefcase size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Tailor to Job</div>
                                            <div className="text-xs text-gray-500">
                                                Rewrite for a specific role
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleImproveResume();
                                            setShowAiMenu(false);
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
                                            setShowAtsModal(true);
                                            setShowAiMenu(false);
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
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Group 2: Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowExportMenu(!showExportMenu);
                                setShowAiMenu(false);
                            }}
                            className="flex items-center gap-2.5 bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5 border border-brand-500/60"
                        >
                            <Download size={18} className="animate-bounce-subtle" />
                            <span className="hidden sm:inline tracking-wide text-sm">Export</span>
                            <ChevronDown
                                size={14}
                                className={`transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {showExportMenu && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => {
                                            setIsRoastModalOpen(true);
                                            setShowExportMenu(false);
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
                                            setShowAtsModal(true);
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-brand-50 text-gray-700 hover:text-brand-700 rounded-lg transition-colors text-left"
                                    >
                                        <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                                            <Sparkles size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Check ATS Score</div>
                                            <div className="text-xs text-gray-500">Optimize for bots</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleDownloadPDF();
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-brand-50 text-gray-700 hover:text-brand-700 rounded-lg transition-colors text-left"
                                    >
                                        <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                                            <Download size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Download PDF</div>
                                            <div className="text-xs text-gray-500">
                                                Pixel-match to preview
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleDownloadDOCX();
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg transition-colors text-left"
                                    >
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Download DOCX</div>
                                            <div className="text-xs text-gray-500">
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

            {/* Mobile Navigation Bar (Bottom) */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <button
                    onClick={() => setMobileView('editor')}
                    className={`flex flex-col items-center gap-1 p-2 ${mobileView === 'editor' ? 'text-brand-600' : 'text-gray-500'}`}
                >
                    <FileText size={20} />
                    <span className="text-xs font-bold">Edit</span>
                </button>
                <button
                    onClick={() => setMobileView('preview')}
                    className={`flex flex-col items-center gap-1 p-2 ${mobileView === 'preview' ? 'text-brand-600' : 'text-gray-500'}`}
                >
                    <Layout size={20} />
                    <span className="text-xs font-bold">Preview</span>
                </button>
            </div>

            <div className="w-full flex-1 flex flex-row overflow-hidden relative pb-16 lg:pb-0">
                {/* Left: Editor Sidebar */}
                <EditorSidebar
                    mobileView={mobileView}
                    handleDownloadPDF={handleDownloadPDF}
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
                    onOpenAts={() => setShowAtsModal(true)}
                    onOpenTheme={() => setShowThemeModal(true)}
                    profiles={profilesStore.profiles}
                    activeProfileId={activeProfile.id}
                    onSwitchProfile={handleSwitchProfile}
                    onCreateProfile={handleCreateProfile}
                    onDuplicateProfile={handleDuplicateProfile}
                    onRenameProfile={handleRenameProfile}
                    onDeleteProfile={handleDeleteProfile}
                />

                <div
                    className={`${mobileView === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 bg-stone-100 overflow-auto h-full relative print-area flex-col items-center p-4 lg:p-12 gap-8 pb-24 lg:pb-12 transition-all duration-300 ${isSidebarOpen ? 'xl:pr-[340px]' : 'xl:pr-12'}`}
                >
                    {/* Template Sidebar Toggle (When Closed) */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className={`fixed right-0 top-1/2 -translate-y-1/2 bg-white text-gray-900 p-3 rounded-l-xl shadow-lg border-y border-l border-gray-200 z-20 hidden xl:flex items-center gap-2 group hover:w-auto hover:pr-6 transition-all duration-300 ${isSidebarOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
                        title="Open Template Selector"
                    >
                        <ChevronRight size={20} className="rotate-180 text-brand-600" />
                        <span className="font-bold text-sm uppercase tracking-wider w-0 overflow-hidden group-hover:w-auto transition-all duration-300 whitespace-nowrap">
                            Select Template
                        </span>
                    </button>

                    {/* Template Selector Sidebar (Right) - Categorized List */}
                    <div
                        className={`fixed right-0 top-16 bottom-0 w-80 bg-white/80 backdrop-blur-md border-l border-gray-200 p-6 hidden xl:flex flex-col gap-8 no-print z-30 shadow-xl overflow-y-auto transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-lg uppercase tracking-wider">
                                Templates
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 font-medium">
                                    {TEMPLATES.length} designs
                                </span>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {[...new Set(TEMPLATES.map((t) => t.category))].map((category) => (
                            <div key={category} className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 sticky top-0 bg-white/95 backdrop-blur z-10 py-2">
                                    {category}
                                </h4>
                                <div className="space-y-6">
                                    {TEMPLATES.filter((t) => t.category === category).map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTemplate(t)}
                                            className={`w-full aspect-[210/297] rounded-xl overflow-hidden border-4 transition-all duration-300 relative group shadow-sm ${selectedTemplate.id === t.id ? 'border-brand-600 ring-4 ring-brand-100 scale-105 shadow-xl z-10' : 'border-transparent hover:border-gray-300 hover:scale-105 hover:shadow-md'}`}
                                            title={t.name}
                                        >
                                            <div className="absolute inset-0 pointer-events-none">
                                                <TemplateThumbnail
                                                    layout={t.layout}
                                                    theme={t.theme}
                                                    selected={false}
                                                    personal={resume.personal}
                                                />
                                            </div>

                                            {/* Hover Overlay with Name */}
                                            <div
                                                className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex flex-col justify-end p-3 ${selectedTemplate.id === t.id ? 'bg-transparent' : ''}`}
                                            >
                                                <div
                                                    className={`bg-white/95 backdrop-blur text-gray-900 text-xs font-bold py-2 px-3 rounded-lg text-center shadow-sm transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${selectedTemplate.id === t.id ? 'translate-y-0 bg-brand-600 text-white' : ''}`}
                                                >
                                                    {t.name}
                                                </div>
                                            </div>

                                            {/* Selected Indicator */}
                                            {selectedTemplate.id === t.id && (
                                                <div className="absolute top-3 right-3 bg-brand-600 text-white p-1.5 rounded-full shadow-lg">
                                                    <CheckCircle size={14} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Hidden Measurement Container */}
                    <div
                        id="measurement-container"
                        style={{
                            position: 'absolute',
                            visibility: 'hidden',
                            pointerEvents: 'none',
                            width: '210mm',
                            zIndex: -1000,
                        }}
                    >
                        {renderLayout(selectedTemplate.id, resume, 0, true)}
                    </div>

                    <div className="w-full flex-col items-center print:block print:w-auto" ref={contentRef}>
                        {pagedData.map((pageData, index) => (
                            <div
                                key={index}
                                style={{
                                    width: `${210 * scale}mm`,
                                    height: `${297 * scale}mm`,
                                    marginBottom: '2rem',
                                }}
                                className="relative transition-all duration-300 mx-auto print:mx-0 print:mb-0"
                            >
                                <div
                                    id={`resume-page-${index + 1}`}
                                    className="resume-paper bg-white shadow-2xl relative overflow-hidden origin-top-left print:shadow-none print:m-0 print:p-0 page-break-after-always"
                                    style={{
                                        width: '210mm',
                                        height: '297mm',
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
                        ))}
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
                isOpen={isRoastModalOpen}
                onClose={() => setIsRoastModalOpen(false)}
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
                isOpen={showJobAssistant}
                onClose={() => setShowJobAssistant(false)}
                onResumeUpdate={(updated) =>
                    setResume({
                        ...updated,
                        skills: normalizeSkills(updated.skills || []),
                    })
                }
            />

            <FeatureTourModal
                isOpen={showFeatureTour}
                onClose={() => {
                    setShowFeatureTour(false);
                    localStorage.setItem('hasSeenFeatureTour', 'true');
                }}
            />
            {showAtsModal && (
                <AtsScoreModal
                    resume={resume}
                    onClose={() => setShowAtsModal(false)}
                    onApplyFix={(fix) => setResume((prev) => applyResumeFix(prev, fix))}
                />
            )}
            {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
            <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
            <ThemeSettingsModal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} />

            {/* Parsing Loader */}
            {isParsing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
                    <Loader className="w-12 h-12 animate-spin mb-4 text-brand-400" />
                    <h2 className="text-2xl font-bold">Reading your resume...</h2>
                    <p className="text-gray-300">This uses AI, so it might take a few seconds.</p>
                </div>
            )}
        </div>
    );
};

export default App;
