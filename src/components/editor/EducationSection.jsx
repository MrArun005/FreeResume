import React from 'react';
import { Plus, Trash2, SplitSquareHorizontal } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../ui/SortableItem';

const EducationSection = ({
    education,
    sensors,
    onDragEnd,
    onArrayChange,
    onRemoveItem,
    onAddItem,
    pageBreaks,
    onTogglePageBreak
}) => {
    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => onDragEnd(event, 'education')}
            >
                <SortableContext
                    items={education}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-6">
                        {education.map((edu) => (
                            <SortableItem key={edu.id} id={edu.id}>
                                <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 shadow-lg relative group hover:border-teal-500/30 transition-all duration-300">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveItem('education', edu.id);
                                        }}
                                        className="absolute top-3 right-3 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 p-1.5 hover:bg-red-500/10 rounded-lg"
                                        title="Delete item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTogglePageBreak(edu.id);
                                        }}
                                        className={`absolute top-3 right-12 p-1.5 rounded-lg transition-all duration-300 z-10 ${pageBreaks?.[edu.id] ? 'bg-orange-500/20 text-orange-400 opacity-100 border border-orange-500/30' : 'text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 opacity-0 group-hover:opacity-100 border border-transparent hover:border-orange-500/20'}`}
                                        title={pageBreaks?.[edu.id] ? 'Remove page break' : 'Force new page'}
                                    >
                                        <SplitSquareHorizontal size={16} />
                                    </button>
                                    <div className="mb-4 mt-2 space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">School / University</label>
                                        <input
                                            value={edu.school}
                                            onChange={(e) => onArrayChange('education', edu.id, 'school', e.target.value)}
                                            placeholder="School / University"
                                            className="w-full bg-slate-950/50 text-gray-100 outline-none text-sm p-3 border border-white/5 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-bold placeholder-gray-600 shadow-inner"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Degree / Program</label>
                                            <input
                                                value={edu.degree}
                                                onChange={(e) => onArrayChange('education', edu.id, 'degree', e.target.value)}
                                                placeholder="Degree"
                                                className="w-full bg-slate-950/50 text-teal-300 outline-none text-sm font-semibold p-3 border border-white/5 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder-gray-600 shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Date Range</label>
                                            <input
                                                value={edu.date}
                                                onChange={(e) => onArrayChange('education', edu.id, 'date', e.target.value)}
                                                placeholder="Date Range"
                                                className="w-full bg-slate-950/50 text-gray-400 outline-none text-sm p-3 border border-white/5 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder-gray-600 shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            <button
                onClick={() => onAddItem('education')}
                className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-400 font-bold tracking-wide text-sm hover:border-teal-500/50 hover:text-teal-400 hover:bg-teal-500/10 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
            >
                <Plus size={18} /> Add Education
            </button>
        </>
    );
};

export default EducationSection;
