import React, { useState, useMemo, useCallback } from 'react';
import DraggableElement from '../ui/DraggableElement';
import CanvasGuides from '../ui/CanvasGuides';
import { Mail, Phone, MapPin } from 'lucide-react';

// Canvas (Pro) — Figma-style free-form layout with snap-to-grid, live
// alignment guides, a per-block style inspector, and a custom block library
// (heading / paragraph / quote / project card / photo / divider / shape /
// skill cluster / spacer). Built-ins (name, title, contact, summary,
// experience, education, skills) live in customStyles; user-added blocks
// live in canvasBlocks. Both are draggable and styleable.

const PAGE_HEIGHT = 1123;

// Built-in block ids — these have hardcoded content tied to the resume data.
const BUILTIN_IDS = ['name', 'title', 'contact', 'summary', 'experience', 'education', 'skills'];

// Default style for a freshly-added custom block (transparent until the user
// applies a fill via the inspector).
const DEFAULT_BLOCK_STYLE = {
    bg: '',
    borderColor: '',
    borderWidth: 0,
    radius: 0,
    padding: 0,
    textAlign: 'left',
};

// Default content per block type. Used at insertion time; persisted to
// canvasBlocks[i].content; rendered by `renderCustomBlock` below.
const DEFAULT_CONTENT = {
    heading: { text: 'Heading' },
    paragraph: { text: 'Add your text here. Edit in the sidebar or double-click to update content later.' },
    quote: { text: 'A pull-quote to stand out.', attribution: '— Author' },
    'project-card': { title: 'Project name', date: '2024', body: 'One- or two-line description.' },
    photo: { url: '' },
    divider: {},
    'shape-rect': { color: '#0F172A' },
    'shape-circle': { color: '#0F172A' },
    'skill-cluster': { skills: ['Figma', 'Prototyping', 'Research'] },
    spacer: {},
};

// Default size per block type (in px). The library inserts at a non-overlap
// position computed below; size is the starting box.
const DEFAULT_SIZE = {
    heading: { w: 300, h: 40 },
    paragraph: { w: 360, h: 80 },
    quote: { w: 360, h: 80 },
    'project-card': { w: 360, h: 100 },
    photo: { w: 200, h: 200 },
    divider: { w: 360, h: 2 },
    'shape-rect': { w: 120, h: 80 },
    'shape-circle': { w: 100, h: 100 },
    'skill-cluster': { w: 360, h: 60 },
    spacer: { w: 100, h: 40 },
};

function renderCustomBlock(block) {
    const { type, content = {} } = block;
    switch (type) {
        case 'heading':
            return <h2 className="text-2xl font-bold leading-tight">{content.text}</h2>;
        case 'paragraph':
            return <p className="text-sm leading-relaxed text-gray-700">{content.text}</p>;
        case 'quote':
            return (
                <blockquote className="text-base italic text-gray-700 leading-snug">
                    &ldquo;{content.text}&rdquo;
                    {content.attribution && (
                        <footer className="mt-1 text-xs not-italic text-gray-500">
                            {content.attribution}
                        </footer>
                    )}
                </blockquote>
            );
        case 'project-card':
            return (
                <div>
                    <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-base font-bold text-gray-900">{content.title}</h4>
                        {content.date && <span className="text-xs text-gray-500">{content.date}</span>}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mt-1">{content.body}</p>
                </div>
            );
        case 'photo':
            return content.url ? (
                <img src={content.url} alt="" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-wider">
                    Photo URL · style → bg/border
                </div>
            );
        case 'divider':
            return <div className="w-full h-px bg-gray-300" />;
        case 'shape-rect':
            return <div className="w-full h-full" style={{ backgroundColor: content.color || '#0F172A' }} />;
        case 'shape-circle':
            return (
                <div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: content.color || '#0F172A' }}
                />
            );
        case 'skill-cluster':
            return (
                <div className="flex flex-wrap gap-1.5">
                    {(content.skills || []).map((s, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 border border-slate-200 text-slate-700"
                        >
                            {s}
                        </span>
                    ))}
                </div>
            );
        case 'spacer':
        default:
            return null;
    }
}

const LayoutCanvas = ({ data, theme, onUpdateStyle, onUpdateCanvasBlock, pageIndex = 0, isMeasurement }) => {
    const { personal, customStyles = {}, canvasBlocks = [] } = data;
    const yOffset = pageIndex * PAGE_HEIGHT;
    const isEditable = !isMeasurement;

    // Selection state — only one block at a time in A; B will add marquee.
    const [selectedId, setSelectedId] = useState(null);
    const [guides, setGuides] = useState([]);

    // Built-in block content + defaults. Pos defaults differ per builtin so a
    // fresh resume opens with a sensible arrangement that the user can then
    // rearrange.
    const builtinDefaults = useMemo(
        () => ({
            name: { x: 50, y: 50, w: 'auto', h: 'auto' },
            title: { x: 50, y: 110, w: 'auto', h: 'auto' },
            contact: { x: 50, y: 160, w: 'auto', h: 'auto' },
            summary: { x: 50, y: 250, w: 500, h: 'auto' },
            experience: { x: 50, y: 400, w: 500, h: 'auto' },
            education: { x: 600, y: 50, w: 250, h: 'auto' },
            skills: { x: 600, y: 300, w: 250, h: 'auto' },
        }),
        []
    );

    const getStyle = useCallback(
        (id, fallback) => {
            const style = customStyles[id] || {};
            const fb = fallback || builtinDefaults[id] || { x: 50, y: 50, w: 'auto', h: 'auto' };
            return {
                x: style.x ?? fb.x,
                y: (style.y ?? fb.y) - yOffset,
                w: style.w ?? fb.w,
                h: style.h ?? fb.h,
            };
        },
        [customStyles, yOffset, builtinDefaults]
    );

    const handleUpdate = useCallback(
        (id, newStyle) => {
            if (BUILTIN_IDS.includes(id)) {
                onUpdateStyle?.(id, { ...newStyle, y: newStyle.y + yOffset });
            } else {
                onUpdateCanvasBlock?.(id, {
                    x: newStyle.x,
                    y: newStyle.y + yOffset,
                    w: newStyle.w,
                    h: newStyle.h,
                });
            }
        },
        [onUpdateStyle, onUpdateCanvasBlock, yOffset]
    );

    // Build sibling-rect list for alignment-guide math. Excludes the dragging
    // block (the DraggableElement filters its own id, since the same list is
    // passed to every block).
    const siblings = useMemo(() => {
        const list = [];
        BUILTIN_IDS.forEach((id) => {
            const s = getStyle(id);
            list.push({
                id,
                x: s.x,
                y: s.y,
                w: typeof s.w === 'number' ? s.w : 0,
                h: typeof s.h === 'number' ? s.h : 0,
            });
        });
        canvasBlocks.forEach((b) => {
            list.push({ id: b.id, x: b.x, y: (b.y || 0) - yOffset, w: b.w, h: b.h });
        });
        return list;
    }, [getStyle, canvasBlocks, yOffset]);

    const siblingsExcluding = useCallback((id) => siblings.filter((s) => s.id !== id), [siblings]);

    // Deselect when clicking on the canvas background (not a block).
    const handleCanvasMouseDown = (e) => {
        if (e.target === e.currentTarget) setSelectedId(null);
    };

    return (
        <div
            className={`relative w-full bg-white text-gray-800 font-sans ${
                isMeasurement ? 'h-auto overflow-visible' : 'h-[var(--page-height)] overflow-hidden'
            }`}
            onMouseDown={handleCanvasMouseDown}
        >
            {/* Subtle dot-grid only visible in editor */}
            {isEditable && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-15 no-print"
                    style={{
                        backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                />
            )}

            {/* Library palette + Inspector hidden until A polish lands —
                they shipped raw and the floating panels read as cluttered
                on top of the resume. Underlying drag / snap / guides still
                work; we'll bring the panels back as a deliberate UI pass. */}

            {/* Built-in: Name */}
            <DraggableElement
                id="name"
                initialPos={getStyle('name')}
                initialSize={getStyle('name')}
                onUpdate={handleUpdate}
                onSelect={setSelectedId}
                onAlign={setGuides}
                isEditable={isEditable}
                isSelected={selectedId === 'name'}
                blockStyle={customStyles.name?.style}
                siblings={siblingsExcluding('name')}
            >
                <h1 className={`text-5xl font-bold uppercase tracking-tight ${theme.text} break-words`}>
                    {personal.fullName || 'Your Name'}
                </h1>
            </DraggableElement>

            {/* Title */}
            <DraggableElement
                id="title"
                initialPos={getStyle('title')}
                initialSize={getStyle('title')}
                onUpdate={handleUpdate}
                onSelect={setSelectedId}
                onAlign={setGuides}
                isEditable={isEditable}
                isSelected={selectedId === 'title'}
                blockStyle={customStyles.title?.style}
                siblings={siblingsExcluding('title')}
            >
                <p className="text-2xl font-medium text-zinc-700 break-words">
                    {personal.title || 'Professional Title'}
                </p>
            </DraggableElement>

            {/* Contact */}
            <DraggableElement
                id="contact"
                initialPos={getStyle('contact')}
                initialSize={getStyle('contact')}
                onUpdate={handleUpdate}
                onSelect={setSelectedId}
                onAlign={setGuides}
                isEditable={isEditable}
                isSelected={selectedId === 'contact'}
                blockStyle={customStyles.contact?.style}
                siblings={siblingsExcluding('contact')}
            >
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                    {personal.email && (
                        <div className="flex items-center gap-2">
                            <Mail size={14} /> {personal.email}
                        </div>
                    )}
                    {personal.phone && (
                        <div className="flex items-center gap-2">
                            <Phone size={14} /> {personal.phone}
                        </div>
                    )}
                    {personal.location && (
                        <div className="flex items-center gap-2">
                            <MapPin size={14} /> {personal.location}
                        </div>
                    )}
                </div>
            </DraggableElement>

            {/* Summary */}
            <DraggableElement
                id="summary"
                initialPos={getStyle('summary')}
                initialSize={getStyle('summary')}
                onUpdate={handleUpdate}
                onSelect={setSelectedId}
                onAlign={setGuides}
                isEditable={isEditable}
                isSelected={selectedId === 'summary'}
                blockStyle={customStyles.summary?.style}
                siblings={siblingsExcluding('summary')}
            >
                <div className="w-full h-full">
                    <h3 className={`text-lg font-bold uppercase border-b-2 ${theme.border} mb-2`}>Profile</h3>
                    <p className="text-gray-700 leading-relaxed">
                        {personal.summary || 'Your professional summary goes here...'}
                    </p>
                </div>
            </DraggableElement>

            {/* Experience */}
            <DraggableElement
                id="experience"
                initialPos={getStyle('experience')}
                initialSize={getStyle('experience')}
                onUpdate={handleUpdate}
                onSelect={setSelectedId}
                onAlign={setGuides}
                isEditable={isEditable}
                isSelected={selectedId === 'experience'}
                blockStyle={customStyles.experience?.style}
                siblings={siblingsExcluding('experience')}
            >
                <div className="w-full h-full">
                    <h3 className={`text-lg font-bold uppercase border-b-2 ${theme.border} mb-4`}>
                        Experience
                    </h3>
                    <div className="flex flex-col gap-6">
                        {data.experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-lg">{exp.role}</h4>
                                    <span className="text-sm text-gray-500">{exp.date}</span>
                                </div>
                                <div className="text-blue-600 font-medium mb-1">{exp.company}</div>
                                {exp.bullets && exp.bullets.length > 0 && (
                                    <ul className="list-disc list-outside ml-5 space-y-1">
                                        {exp.bullets.map((bullet, i) => (
                                            <li key={i} className="text-sm text-gray-700 leading-relaxed">
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </DraggableElement>

            {/* Education */}
            <DraggableElement
                id="education"
                initialPos={getStyle('education')}
                initialSize={getStyle('education')}
                onUpdate={handleUpdate}
                onSelect={setSelectedId}
                onAlign={setGuides}
                isEditable={isEditable}
                isSelected={selectedId === 'education'}
                blockStyle={customStyles.education?.style}
                siblings={siblingsExcluding('education')}
            >
                <div className="w-full h-full">
                    <h3 className={`text-lg font-bold uppercase border-b-2 ${theme.border} mb-4`}>
                        Education
                    </h3>
                    <div className="flex flex-col gap-4">
                        {data.education.map((edu) => (
                            <div key={edu.id}>
                                <div className="font-bold">{edu.school}</div>
                                <div className="text-sm text-gray-500">{edu.date}</div>
                                <div className="text-sm">{edu.degree}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </DraggableElement>

            {/* Skills */}
            <DraggableElement
                id="skills"
                initialPos={getStyle('skills')}
                initialSize={getStyle('skills')}
                onUpdate={handleUpdate}
                onSelect={setSelectedId}
                onAlign={setGuides}
                isEditable={isEditable}
                isSelected={selectedId === 'skills'}
                blockStyle={customStyles.skills?.style}
                siblings={siblingsExcluding('skills')}
            >
                <div className="w-full h-full">
                    <h3 className={`text-lg font-bold uppercase border-b-2 ${theme.border} mb-4`}>Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 bg-gray-100 rounded text-sm font-medium border border-gray-200"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </DraggableElement>

            {/* Custom blocks added via the library */}
            {canvasBlocks.map((b) => (
                <DraggableElement
                    key={b.id}
                    id={b.id}
                    initialPos={{ x: b.x, y: (b.y || 0) - yOffset }}
                    initialSize={{ w: b.w, h: b.h }}
                    onUpdate={handleUpdate}
                    onSelect={setSelectedId}
                    onAlign={setGuides}
                    isEditable={isEditable}
                    isSelected={selectedId === b.id}
                    blockStyle={b.style}
                    siblings={siblingsExcluding(b.id)}
                >
                    {renderCustomBlock(b)}
                </DraggableElement>
            ))}

            {/* Alignment guide overlay — only visible while dragging */}
            {isEditable && <CanvasGuides lines={guides} />}
        </div>
    );
};

export default LayoutCanvas;
