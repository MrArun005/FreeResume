import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';

// Sortable Item Component
const SortableSection = ({ id, children, isEditing }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} className={`group relative ${isDragging ? 'opacity-50' : ''}`}>
            {isEditing && (
                <div {...attributes} {...listeners} className="absolute -left-8 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                    <GripVertical size={20} />
                </div>
            )}
            {children}
        </div>
    );
};

const computeItemsFromProps = (sectionOrder, pageIndex) => {
    const pageItems = [...sectionOrder];
    return pageIndex === 0 ? ['personal', ...pageItems] : pageItems;
};

const LayoutFreeform = ({ data, theme, pageIndex, isMeasurement }) => {
    // Local DnD order. Synced with props during render (React-recommended pattern
    // for "adjust state when a prop changes" — avoids cascading effect renders).
    const [items, setItems] = useState(() => computeItemsFromProps(data.sectionOrder, pageIndex));
    const [lastInput, setLastInput] = useState({ sectionOrder: data.sectionOrder, pageIndex });

    if (lastInput.sectionOrder !== data.sectionOrder || lastInput.pageIndex !== pageIndex) {
        setLastInput({ sectionOrder: data.sectionOrder, pageIndex });
        // Preserve the user's local drag order where possible: keep ids still present, drop the rest.
        const validIds = new Set(computeItemsFromProps(data.sectionOrder, pageIndex));
        setItems(prev => {
            const kept = prev.filter(id => validIds.has(id));
            const missing = [...validIds].filter(id => !kept.includes(id));
            return [...kept, ...missing];
        });
    }


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Renderers
    const renderPersonal = () => (
        <div id="section-personal" className={`mb-6 pb-6 border-b-2 ${theme.border}`}>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personal.fullName || "Your Name"}</h1>
            <p className="text-xl text-gray-600 mb-4">{data.personal.title || "Job Title"}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {data.personal.email && <div className="flex items-center gap-1"><Mail size={14} /> {data.personal.email}</div>}
                {data.personal.phone && <div className="flex items-center gap-1"><Phone size={14} /> {data.personal.phone}</div>}
                {data.personal.location && <div className="flex items-center gap-1"><MapPin size={14} /> {data.personal.location}</div>}
                {(data.personal.socials || []).map(s => (
                    <div key={s.id} className="flex items-center gap-1"><LinkIcon size={14} /> <a href={s.url} className="hover:underline text-blue-600">{s.network}</a></div>
                ))}
            </div>
        </div>
    );

    const renderSection = (sectionId) => {
        if (sectionId === 'personal') return renderPersonal();

        const isCustom = !['summary', 'experience', 'education', 'skills'].includes(sectionId);
        const sectionData = isCustom ? data.customSections.find(s => s.id === sectionId) : null;

        if (sectionId === 'summary' && data.personal.summary) {
            return (
                <div id={`section-${sectionId}`} className="mb-6">
                    <div id={`section-title-${sectionId}`}>
                        <SectionTitle title="Professional Summary" theme={theme} />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{data.personal.summary}</p>
                </div>
            );
        }

        if (sectionId === 'experience' && data.experience.length > 0) {
            const isFirstPageOfSection = !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
            return (
                <div id={`section-${sectionId}`} className="mb-6">
                    {isFirstPageOfSection && (
                        <div id={`section-title-${sectionId}`}>
                            <SectionTitle title="Experience" theme={theme} />
                        </div>
                    )}
                    {data.experience.map(exp => (
                        <div key={exp.id} id={`item-${exp.id}`} className="mb-4">
                            <div className="flex justify-between items-baseline font-bold text-gray-900">
                                <span>{exp.company}</span>
                                <span className="text-sm text-gray-500">{exp.date}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-gray-700">{exp.role}</span>
                                {exp.location && <span className="text-gray-500">{exp.location}</span>}
                            </div>
                            {exp.bullets && exp.bullets.length > 0 && (
                                <ul className="list-disc list-outside ml-5 space-y-1">
                                    {exp.bullets.map((bullet, i) => (
                                        <li key={i} className="text-sm text-gray-700 leading-relaxed">{bullet}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        if (sectionId === 'education' && data.education.length > 0) {
            const isFirstPageOfSection = !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
            return (
                <div id={`section-${sectionId}`} className="mb-6">
                    {isFirstPageOfSection && (
                        <div id={`section-title-${sectionId}`}>
                            <SectionTitle title="Education" theme={theme} />
                        </div>
                    )}
                    {data.education.map(edu => (
                        <div key={edu.id} id={`item-${edu.id}`} className="mb-3">
                            <div className="flex justify-between items-baseline font-bold text-gray-900">
                                <span>{edu.school}</span>
                                <span className="text-sm text-gray-500">{edu.date}</span>
                            </div>
                            <div className="text-sm text-gray-700">{edu.degree}</div>
                        </div>
                    ))}
                </div>
            );
        }

        if (sectionId === 'skills' && data.skills.length > 0) {
            return (
                <div id={`section-${sectionId}`} className="mb-6">
                    <div id={`section-title-${sectionId}`}>
                        <SectionTitle title="Skills" theme={theme} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm font-medium text-gray-700">{skill}</span>
                        ))}
                    </div>
                </div>
            );
        }

        if (isCustom && sectionData && sectionData.items.length > 0) {
            return (
                <div id={`section-${sectionId}`} className="mb-6">
                    {(!data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex) && (
                        <div id={`section-title-${sectionId}`}>
                            <SectionTitle title={sectionData.title} theme={theme} />
                        </div>
                    )}
                    {sectionData.items.map(item => (
                        <div key={item.id} id={`item-${item.id}`} className="mb-3">
                            <div className="flex justify-between items-baseline font-bold text-gray-900">
                                <span>{item.title}</span>
                                <span className="text-sm text-gray-500">{item.date}</span>
                            </div>
                            {item.subtitle && <div className="text-sm font-medium text-gray-700">{item.subtitle}</div>}
                            {item.description && <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{item.description}</p>}
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    // If measurement mode, just render in order without DnD wrappers
    if (isMeasurement) {
        return (
            <div className="p-10 font-sans bg-white h-auto">
                {items.map(id => (
                    <div key={id}>{renderSection(id)}</div>
                ))}
            </div>
        );
    }

    return (
        <div className={`p-10 font-sans bg-white ${isMeasurement ? 'h-auto overflow-visible' : 'h-[297mm] overflow-hidden'} relative`}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    {items.map(id => (
                        <SortableSection key={id} id={id} isEditing={true}>
                            {renderSection(id)}
                        </SortableSection>
                    ))}
                </SortableContext>
            </DndContext>

            {/* Hint - Only on first page */}
            {pageIndex === 0 && (
                <div className="mt-8 p-4 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100 text-center break-inside-avoid no-print">
                    💡 Pro Tip: In this template, you can drag <strong>any</strong> section (including your name!) to reorder it.
                </div>
            )}
        </div>
    );
};

export default LayoutFreeform;
