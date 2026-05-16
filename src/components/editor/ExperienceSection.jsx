import React from 'react';
import { Plus, Trash2, SplitSquareHorizontal } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../ui/SortableItem';
import BulletPointEditor from '../ui/BulletPointEditor';

const ExperienceSection = ({
    experience,
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
                onDragEnd={(event) => onDragEnd(event, 'experience')}
            >
                <SortableContext
                    items={experience}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-6">
                        {experience.map((exp) => (
                            <SortableItem key={exp.id} id={exp.id}>
                                <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 shadow-lg relative group hover:border-teal-500/30 transition-all duration-300">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveItem('experience', exp.id);
                                        }}
                                        className="absolute top-3 right-3 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 p-1.5 hover:bg-red-500/10 rounded-lg"
                                        title="Delete item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTogglePageBreak(exp.id);
                                        }}
                                        className={`absolute top-3 right-12 p-1.5 rounded-lg transition-all duration-300 z-10 ${pageBreaks?.[exp.id] ? 'bg-orange-500/20 text-orange-400 opacity-100 border border-orange-500/30' : 'text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 opacity-0 group-hover:opacity-100 border border-transparent hover:border-orange-500/20'}`}
                                        title={pageBreaks?.[exp.id] ? 'Remove page break' : 'Force new page'}
                                    >
                                        <SplitSquareHorizontal size={16} />
                                    </button>
                                    <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Company</label>
                                            <input
                                                value={exp.company}
                                                onChange={(e) => onArrayChange('experience', exp.id, 'company', e.target.value)}
                                                placeholder="Company Name"
                                                className="w-full bg-slate-950/50 text-gray-100 outline-none text-sm p-3 border border-white/5 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-bold placeholder-gray-600 shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Location</label>
                                            <input
                                                value={exp.location}
                                                onChange={(e) => onArrayChange('experience', exp.id, 'location', e.target.value)}
                                                placeholder="Location"
                                                className="w-full bg-slate-950/50 text-gray-300 outline-none text-sm p-3 border border-white/5 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder-gray-600 shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Role</label>
                                            <input
                                                value={exp.role}
                                                onChange={(e) => onArrayChange('experience', exp.id, 'role', e.target.value)}
                                                placeholder="Role"
                                                className="w-full bg-slate-950/50 text-teal-300 outline-none text-sm font-semibold p-3 border border-white/5 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder-gray-600 shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Date Range</label>
                                            <input
                                                value={exp.date}
                                                onChange={(e) => onArrayChange('experience', exp.id, 'date', e.target.value)}
                                                placeholder="Date Range"
                                                className="w-full bg-slate-950/50 text-gray-400 outline-none text-sm p-3 border border-white/5 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder-gray-600 shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <BulletPointEditor
                                        bullets={exp.bullets || []}
                                        onChange={(newBullets) => onArrayChange('experience', exp.id, 'bullets', newBullets)}
                                    />
                                </div>
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            <button
                onClick={() => onAddItem('experience')}
                className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-400 font-bold tracking-wide text-sm hover:border-teal-500/50 hover:text-teal-400 hover:bg-teal-500/10 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
            >
                <Plus size={18} /> Add Position
            </button>
        </>
    );
};

export default ExperienceSection;
