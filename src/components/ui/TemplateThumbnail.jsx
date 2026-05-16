import React, { useState, useEffect, useRef } from 'react';
import { initialData } from '../../data/mockData';
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
import LayoutExecutive from '../layouts/LayoutExecutive';
import LayoutLeaf from '../layouts/LayoutLeaf';
import LayoutGold from '../layouts/LayoutGold';
import LayoutGlitch from '../layouts/LayoutGlitch';

const TemplateThumbnail = ({ layout, theme, selected }) => {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(0.25);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                // A4 width in pixels (approx 794px at 96 DPI)
                // We add some padding/margin consideration if needed
                setScale(width / 794);
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const renderLayout = () => {
        const props = {
            data: initialData,
            theme: theme,
            pageIndex: 0,
            isMeasurement: false,
            isThumbnail: true, // Hint for layouts to disable interactivity
            isEditable: false   // For Canvas
        };

        switch (layout) {
            case 'classic': return <LayoutClassic {...props} />;
            case 'sidebar-left': return <LayoutSidebarLeft {...props} />;
            case 'sidebar-right': return <LayoutSidebarRight {...props} />;
            case 'minimal': return <LayoutMinimal {...props} />;
            case 'modern-grid': return <LayoutModernGrid {...props} />;
            case 'ats': return <LayoutAts {...props} />;
            case 'jakes': return <LayoutJakes {...props} />;
            case 'deedy': return <LayoutDeedy {...props} />;
            case 'freeform': return <LayoutFreeform {...props} />;
            case 'creative': return <LayoutCreative {...props} />;
            case 'canvas': return <LayoutCanvas {...props} />;
            case 'executive': return <LayoutExecutive {...props} />;
            case 'leaf': return <LayoutLeaf {...props} />;
            case 'gold': return <LayoutGold {...props} />;
            case 'glitch': return <LayoutGlitch {...props} />;
            default: return <LayoutClassic {...props} />;
        }
    };

    return (
        <div ref={containerRef} className="relative w-full aspect-[210/297] bg-white shadow-sm overflow-hidden group">
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: '794px', // A4 width at 96 DPI
                height: '1123px', // A4 height at 96 DPI
            }}>
                {renderLayout()}
            </div>
            {/* Overlay on hover */}
            <div className={`absolute inset-0 bg-blue-900/10 transition-opacity ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'}`} />
        </div>
    );
}

export default TemplateThumbnail;
