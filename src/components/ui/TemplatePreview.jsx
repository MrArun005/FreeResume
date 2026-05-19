// TemplatePreview — landing-page thumbnail that renders the *actual* layout
// component (LayoutGoogle, LayoutBoldRecruit, …) at full A4 size, then
// CSS-scales it to fit the surrounding container. This gives a true WYSIWYG
// preview instead of the simplified placeholder bars TemplateThumbnail uses
// for in-editor pickers.
//
// We render with `initialData` (Arun's curated resume in src/data/mockData)
// so every template shows the same realistic content side by side — the
// gallery is comparing layouts, not faking different content per card.

import { useEffect, useRef, useState } from 'react';

import LayoutClassic from '../layouts/LayoutClassic';
import LayoutSidebarLeft from '../layouts/LayoutSidebarLeft';
import LayoutSidebarRight from '../layouts/LayoutSidebarRight';
import LayoutMinimal from '../layouts/LayoutMinimal';
import LayoutAts from '../layouts/LayoutAts';
import LayoutJakes from '../layouts/LayoutJakes';
import LayoutFreeform from '../layouts/LayoutFreeform';
import LayoutCanvas from '../layouts/LayoutCanvas';
import LayoutExecutive from '../layouts/LayoutExecutive';
import LayoutGold from '../layouts/LayoutGold';
import LayoutGoogle from '../layouts/LayoutGoogle';
import LayoutBoldRecruit from '../layouts/LayoutBoldRecruit';
import LayoutExecutiveSerif from '../layouts/LayoutExecutiveSerif';
import LayoutNavyModern from '../layouts/LayoutNavyModern';
import LayoutMinimalMono from '../layouts/LayoutMinimalMono';

import { initialData } from '../../data/mockData';

const LAYOUT_MAP = {
    classic: LayoutClassic,
    'sidebar-left': LayoutSidebarLeft,
    'sidebar-right': LayoutSidebarRight,
    minimal: LayoutMinimal,
    ats: LayoutAts,
    jakes: LayoutJakes,
    freeform: LayoutFreeform,
    canvas: LayoutCanvas,
    executive: LayoutExecutive,
    gold: LayoutGold,
    google: LayoutGoogle,
    'bold-recruit': LayoutBoldRecruit,
    'executive-serif': LayoutExecutiveSerif,
    'navy-modern': LayoutNavyModern,
    'minimal-mono': LayoutMinimalMono,
};

// A4 page dimensions at 96 dpi — matches what the editor PreviewPanel uses
// for the live preview, and what Puppeteer prints from.
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

const TemplatePreview = ({ layout, theme, selected = false, data = initialData }) => {
    const ref = useRef(null);
    const [scale, setScale] = useState(0.3);

    useEffect(() => {
        if (!ref.current) return;
        const ro = new ResizeObserver((entries) => {
            for (const e of entries) {
                const w = e.contentRect.width;
                setScale(w / PAGE_WIDTH);
            }
        });
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, []);

    const LayoutComponent = LAYOUT_MAP[layout] || LayoutClassic;

    return (
        <div
            ref={ref}
            className="relative w-full aspect-[210/297] bg-white overflow-hidden"
            // content-visibility:auto lets the browser skip layout + paint work
            // for thumbnails that aren't currently in the viewport. The
            // contain-intrinsic-size keeps the page from jumping when the browser
            // virtualizes them out — it reserves the thumbnail-aspect box.
            style={{ contentVisibility: 'auto', containIntrinsicSize: '210px 297px' }}
        >
            {/* The inner box is fixed at A4 size; transform scales the whole
                rendered layout into the thumbnail box. transform-origin
                pins to the top-left so the scale collapses cleanly. */}
            <div
                style={{
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                }}
            >
                <LayoutComponent data={data} theme={theme} pageIndex={0} totalPages={1} />
            </div>
            {selected && (
                <div className="absolute inset-0 ring-2 ring-slate-900 rounded pointer-events-none" />
            )}
        </div>
    );
};

export default TemplatePreview;
