import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableTag } from '../ui/SortableTag';

const SkillsSection = ({ skills, sensors, onDragEnd, onRemoveSkill, onAddSkill }) => {
    return (
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 shadow-inner">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-3">Skills List (Drag to Reorder)</label>

            <div className="mb-5 flex gap-2">
                <input
                    type="text"
                    placeholder="Add a skill (e.g. React)"
                    className="flex-1 p-3.5 bg-slate-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all font-medium text-sm text-white placeholder-gray-500 shadow-inner"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const val = e.target.value.trim();
                            if (val && !skills.includes(val)) {
                                onAddSkill(val);
                                e.target.value = '';
                            }
                        }
                    }}
                />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => onDragEnd(event, 'skills')}
            >
                <SortableContext
                    items={skills}
                    strategy={rectSortingStrategy}
                >
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <SortableTag
                                key={skill}
                                id={skill}
                                onRemove={() => onRemoveSkill(skill)}
                            >
                                {skill}
                            </SortableTag>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default SkillsSection;
