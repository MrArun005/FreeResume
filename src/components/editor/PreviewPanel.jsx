import React, { useRef, useEffect } from 'react';
import {
    ChevronRight,
    ChevronLeft,
    ZoomIn,
    ZoomOut,
    Monitor,
    Smartphone,
    CheckCircle,
    Palette,
    Layout as LayoutIcon,
} from 'lucide-react';

import TemplateThumbnail from '../ui/TemplateThumbnail';
import PageOverflowIndicator from '../ui/PageOverflowIndicator';
import AutoScrollingGuide from '../ui/AutoScrollingGuide';

import { TEMPLATES } from '../../constants/layouts';

// Layout Components
import LayoutClassic from '../layouts/LayoutClassic';
import LayoutSidebarLeft from '../layouts/LayoutSidebarLeft';
import LayoutSidebarRight from '../layouts/LayoutSidebarRight';
import LayoutMinimal from '../layouts/LayoutMinimal';
import LayoutModernGrid from '../layouts/LayoutModernGrid';
import LayoutAts from '../layouts/LayoutAts';
import LayoutJakes from '../layouts/LayoutJakes';
import LayoutDeedy from '../layouts/LayoutDeedy';
import LayoutFreeform from '../layouts/LayoutFreeform';
import LayoutCreative from '../layouts/LayoutCreative';
import LayoutCanvas from '../layouts/LayoutCanvas';
import LayoutGlitch from '../layouts/LayoutGlitch';
import LayoutExecutive from '../layouts/LayoutExecutive';
import LayoutLeaf from '../layouts/LayoutLeaf';
import LayoutGold from '../layouts/LayoutGold';
import LayoutGoogle from '../layouts/LayoutGoogle';

import { paginateResume } from '../../utils/pagination';

const PreviewPanel = ({
    mobileView,
    isSidebarOpen,
    setIsSidebarOpen,
    resume,
    selectedTemplate,
    setSelectedTemplate,
    scale,
    setScale,
    pagedData,
    setPagedData,
    isCalculatingLayout,
    setIsCalculatingLayout,
    setDebugHeights,
    isOverflowing,
    setIsOverflowing,
}) => {
    const containerRef = useRef(null);

    // Re-paginate when resume, template, or theme changes
    useEffect(() => {
        setIsCalculatingLayout(true);

        const timer = setTimeout(async () => {
            try {
                const { pages, debugInfo, isOverflow } = await paginateResume(resume, selectedTemplate.id);
                setPagedData(pages);
                setDebugHeights(debugInfo || {});
                setIsOverflowing(isOverflow);
            } catch (error) {
                console.error('Pagination error:', error);
            } finally {
                setIsCalculatingLayout(false);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [resume, selectedTemplate, setPagedData, setDebugHeights, setIsOverflowing, setIsCalculatingLayout]);

    const renderLayout = (data, pageIndex) => {
        const LayoutComponent =
            {
                classic: LayoutClassic,
                sidebarLeft: LayoutSidebarLeft,
                sidebarRight: LayoutSidebarRight,
                minimal: LayoutMinimal,
                modernGrid: LayoutModernGrid,
                ats: LayoutAts,
                jakes: LayoutJakes,
                deedy: LayoutDeedy,
                freeform: LayoutFreeform,
                creative: LayoutCreative,
                canvas: LayoutCanvas,
                glitch: LayoutGlitch,
                executive: LayoutExecutive,
                leaf: LayoutLeaf,
                gold: LayoutGold,
                google: LayoutGoogle,
            }[selectedTemplate.id] || LayoutClassic;

        return (
            <LayoutComponent
                data={data}
                theme={selectedTemplate.theme}
                pageIndex={pageIndex}
                totalPages={pagedData.length}
            />
        );
    };

    return (
        <div
            className={`${mobileView === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 bg-gray-200 overflow-auto h-full relative print-area flex-col items-center p-4 lg:p-12 gap-8 pb-24 lg:pb-12 transition-all duration-300 ${isSidebarOpen ? 'xl:pr-[340px]' : 'xl:pr-12'}`}
        >
            {/* Toolbar (Glassmorphic) */}
            <div className="fixed top-24 right-6 flex flex-col gap-3 z-30 no-print">
                <div className="bg-slate-900/60 backdrop-blur-xl p-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 flex flex-col gap-2">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2.5 hover:bg-white/10 rounded-xl text-gray-300 transition-all duration-300"
                        title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
                    >
                        {isSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                    <div className="h-px bg-white/10 w-full" />
                    <button
                        onClick={() => setScale((s) => Math.min(s + 0.1, 2))}
                        className="p-2.5 hover:bg-white/10 rounded-xl text-gray-300 transition-all duration-300"
                        title="Zoom In"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button
                        onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
                        className="p-2.5 hover:bg-white/10 rounded-xl text-gray-300 transition-all duration-300"
                        title="Zoom Out"
                    >
                        <ZoomOut size={20} />
                    </button>
                </div>
            </div>

            {/* Main Resume Preview Area */}
            <div
                ref={containerRef}
                className="relative transition-transform duration-200 ease-out origin-top"
                style={{ transform: `scale(${scale})` }}
            >
                {pagedData.map((pageData, index) => (
                    <div
                        key={index}
                        id={`resume-page-${index + 1}`}
                        className="bg-white shadow-2xl mb-8 relative print:shadow-none print:mb-0 print:mx-0 overflow-hidden"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            height: '297mm', // Fixed height for A4
                            transformOrigin: 'top center',
                        }}
                    >
                        {renderLayout(pageData, index)}
                    </div>
                ))}

                {/* Page Overflow Indicator */}
                <PageOverflowIndicator isOverflowing={isOverflowing} pageCount={pagedData.length} />
            </div>

            {/* Right Sidebar: Customization (Premium Glassmorphism) */}
            <div
                className={`fixed right-0 top-[64px] bottom-0 w-[340px] bg-slate-950/80 backdrop-blur-2xl border-l border-white/5 shadow-[-10px_0_30px_rgba(0,0,0,0.2)] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-20 overflow-y-auto no-print ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="p-8 space-y-8">
                    {/* Template Selection */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <LayoutIcon size={14} className="text-brand-500" /> Templates
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {TEMPLATES.map((template) => (
                                <TemplateThumbnail
                                    key={template.id}
                                    template={template}
                                    selected={selectedTemplate.id === template.id}
                                    onClick={() => setSelectedTemplate(template)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Auto-Scroll Guide */}
                {/* <div className="pt-6 border-t border-white/5 mt-8">
                    <AutoScrollingGuide />
                </div> */}
            </div>

            {/* Loading Overlay */}
            {isCalculatingLayout && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center">
                    <div className="bg-slate-900 p-5 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-4 h-4 bg-brand-500 rounded-full animate-ping" />
                        <span className="font-semibold tracking-wide text-gray-200">Reflowing Layout...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreviewPanel;
