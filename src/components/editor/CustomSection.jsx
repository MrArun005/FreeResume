import { Plus } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../ui/SortableItem';
import { CardChrome, FillInput, FillTextarea, FieldLabel } from '../ui/EditorPrimitives';

const CustomSection = ({
    section,
    sensors,
    onDragEnd,
    onUpdateTitle,
    onUpdateItem,
    onRemoveItem,
    onAddItem,
    pageBreaks,
    onTogglePageBreak,
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <input
                    value={section.title}
                    onChange={(e) => onUpdateTitle(section.id, e.target.value)}
                    className="text-base font-semibold text-slate-900 border-b-2 border-transparent focus:border-brand-500 outline-none bg-transparent w-full pb-1 transition-colors placeholder-slate-400"
                    placeholder="Section title (e.g. Certifications)"
                />
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => onDragEnd(event, section.id)}>
                <SortableContext items={section.items} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2.5">
                        {section.items.map((item) => {
                            const subtitle = [item.subtitle, item.date].filter(Boolean).join(' · ');
                            return (
                                <SortableItem key={item.id} id={item.id}>
                                    <CardChrome
                                        title={item.title}
                                        subtitle={subtitle}
                                        onDelete={() => onRemoveItem(section.id, item.id)}
                                        onTogglePageBreak={() => onTogglePageBreak(item.id)}
                                        isPageBreak={!!pageBreaks?.[item.id]}
                                    >
                                        <div className="mb-2">
                                            <FieldLabel>Title</FieldLabel>
                                            <FillInput
                                                value={item.title || ''}
                                                onChange={(e) => onUpdateItem(section.id, item.id, 'title', e.target.value)}
                                                placeholder="AWS Certified Solutions Architect"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <FieldLabel optional>Subtitle</FieldLabel>
                                                <FillInput
                                                    value={item.subtitle || ''}
                                                    onChange={(e) => onUpdateItem(section.id, item.id, 'subtitle', e.target.value)}
                                                    placeholder="Amazon Web Services"
                                                />
                                            </div>
                                            <div>
                                                <FieldLabel optional>Date</FieldLabel>
                                                <FillInput
                                                    value={item.date || ''}
                                                    onChange={(e) => onUpdateItem(section.id, item.id, 'date', e.target.value)}
                                                    placeholder="2024"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <FieldLabel optional>Description</FieldLabel>
                                            <FillTextarea
                                                value={item.description || ''}
                                                onChange={(e) => onUpdateItem(section.id, item.id, 'description', e.target.value)}
                                                placeholder="Add a short description…"
                                                rows={3}
                                            />
                                        </div>
                                    </CardChrome>
                                </SortableItem>
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>
            <button
                onClick={() => onAddItem(section.id)}
                className="w-full py-2.5 border border-dashed border-slate-300 rounded-lg text-slate-600 font-medium text-[13px] hover:border-slate-400 hover:bg-stone-50 transition-colors inline-flex items-center justify-center gap-1.5"
            >
                <Plus size={14} /> Add item
            </button>
        </div>
    );
};

export default CustomSection;
