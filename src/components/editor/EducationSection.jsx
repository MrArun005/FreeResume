import { Plus } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../ui/SortableItem';
import { CardChrome, FillInput, FieldLabel } from '../ui/EditorPrimitives';
import DateRangeInput from '../ui/DateRangeInput';

const EducationSection = ({
    education,
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
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => onDragEnd(event, 'education')}
            >
                <SortableContext items={education} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2.5">
                        {education.map((edu) => {
                            const subtitle = [edu.school, edu.date].filter(Boolean).join(' · ');
                            return (
                                <SortableItem key={edu.id} id={edu.id}>
                                    <CardChrome
                                        title={edu.degree}
                                        subtitle={subtitle}
                                        onDelete={() => onRemoveItem('education', edu.id)}
                                        onTogglePageBreak={() => onTogglePageBreak(edu.id)}
                                        isPageBreak={!!pageBreaks?.[edu.id]}
                                    >
                                        <div className="mb-2">
                                            <FieldLabel>School</FieldLabel>
                                            <FillInput
                                                value={edu.school || ''}
                                                onChange={(e) =>
                                                    onArrayChange(
                                                        'education',
                                                        edu.id,
                                                        'school',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Visvesvaraya Technological University"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <FieldLabel>Degree</FieldLabel>
                                            <FillInput
                                                value={edu.degree || ''}
                                                onChange={(e) =>
                                                    onArrayChange(
                                                        'education',
                                                        edu.id,
                                                        'degree',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="B.E. Computer Science"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <FieldLabel>Dates</FieldLabel>
                                                <DateRangeInput
                                                    value={edu.date || ''}
                                                    onChange={(v) =>
                                                        onArrayChange('education', edu.id, 'date', v)
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <FieldLabel optional>Location</FieldLabel>
                                                <FillInput
                                                    value={edu.location || ''}
                                                    onChange={(e) =>
                                                        onArrayChange(
                                                            'education',
                                                            edu.id,
                                                            'location',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Mysuru"
                                                />
                                            </div>
                                        </div>
                                    </CardChrome>
                                </SortableItem>
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>
            <button
                onClick={() => onAddItem('education')}
                className="mt-3 w-full py-2.5 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-stone-300 font-medium text-[13px] hover:border-slate-400 dark:hover:border-slate-500 hover:bg-stone-50 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-1.5"
            >
                <Plus size={14} /> Add education
            </button>
        </>
    );
};

export default EducationSection;
