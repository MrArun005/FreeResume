import { Plus, Sparkles } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../ui/SortableItem';
import { CardChrome, FillInput, FieldLabel, BulletList } from '../ui/EditorPrimitives';

const ExperienceSection = ({
    experience,
    sensors,
    onDragEnd,
    onArrayChange,
    onRemoveItem,
    onAddItem,
    pageBreaks,
    onTogglePageBreak,
}) => {
    return (
        <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => onDragEnd(event, 'experience')}>
                <SortableContext items={experience} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2.5">
                        {experience.map((exp) => {
                            const subtitle = [exp.company, exp.date].filter(Boolean).join(' · ');
                            return (
                                <SortableItem key={exp.id} id={exp.id}>
                                    <CardChrome
                                        title={exp.role}
                                        subtitle={subtitle}
                                        onDelete={() => onRemoveItem('experience', exp.id)}
                                        onTogglePageBreak={() => onTogglePageBreak(exp.id)}
                                        isPageBreak={!!pageBreaks?.[exp.id]}
                                    >
                                        <div className="grid grid-cols-[1.4fr_1fr] gap-2 mb-2">
                                            <div>
                                                <FieldLabel>Role</FieldLabel>
                                                <FillInput
                                                    value={exp.role || ''}
                                                    onChange={(e) => onArrayChange('experience', exp.id, 'role', e.target.value)}
                                                    placeholder="Senior Engineer"
                                                />
                                            </div>
                                            <div>
                                                <FieldLabel>Dates</FieldLabel>
                                                <FillInput
                                                    value={exp.date || ''}
                                                    onChange={(e) => onArrayChange('experience', exp.id, 'date', e.target.value)}
                                                    placeholder="2022 — present"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[1.4fr_1fr] gap-2 mb-3">
                                            <div>
                                                <FieldLabel>Company</FieldLabel>
                                                <FillInput
                                                    value={exp.company || ''}
                                                    onChange={(e) => onArrayChange('experience', exp.id, 'company', e.target.value)}
                                                    placeholder="Company name"
                                                />
                                            </div>
                                            <div>
                                                <FieldLabel optional>Location</FieldLabel>
                                                <FillInput
                                                    value={exp.location || ''}
                                                    onChange={(e) => onArrayChange('experience', exp.id, 'location', e.target.value)}
                                                    placeholder="Bengaluru"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <FieldLabel>Highlights</FieldLabel>
                                            <BulletList
                                                bullets={exp.bullets || []}
                                                onChange={(newBullets) => onArrayChange('experience', exp.id, 'bullets', newBullets)}
                                            />
                                            <button
                                                type="button"
                                                className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50/60 text-teal-700 border border-teal-200 hover:bg-teal-50 transition-colors"
                                                title="Improve writing with AI"
                                            >
                                                <Sparkles size={11} /> Improve with AI
                                            </button>
                                        </div>
                                    </CardChrome>
                                </SortableItem>
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>
            <button
                onClick={() => onAddItem('experience')}
                className="mt-3 w-full py-2.5 border border-dashed border-slate-300 rounded-lg text-slate-600 font-medium text-[13px] hover:border-slate-400 hover:bg-stone-50 transition-colors inline-flex items-center justify-center gap-1.5"
            >
                <Plus size={14} /> Add experience
            </button>
        </>
    );
};

export default ExperienceSection;
