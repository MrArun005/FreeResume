import React from 'react';
import { Plus, Trash2, SplitSquareHorizontal } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../ui/SortableItem';
import BulletPointEditor from '../ui/BulletPointEditor';

const CustomSection = ({
    section,
    sensors,
    onDragEnd,
    onUpdateTitle,
    onUpdateItem,
    onRemoveItem,
    onAddItem,
    pageBreaks,
    onTogglePageBreak
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <input
                    value={section.title}
                    onChange={(e) => onUpdateTitle(section.id, e.target.value)}
                    className="text-lg font-bold text-gray-200 border-b-2 border-transparent focus:border-teal-500 outline-none bg-transparent w-full pb-1 transition-all placeholder-gray-600"
                    placeholder="Section Title (e.g. Certifications)"
                />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => onDragEnd(event, section.id)}
            >
                <SortableContext
                    items={section.items}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-6">
                        {section.items.map((item) => (
                            <SortableItem key={item.id} id={item.id}>
                                <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 shadow-lg relative group hover:border-teal-500/30 transition-all duration-300">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveItem(section.id, item.id);
                                        }}
                                        className="absolute top-3 right-3 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 p-1.5 hover:bg-red-500/10 rounded-lg"
                                        title="Delete item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTogglePageBreak(item.id);
                                        }}
                                        className={`absolute top-3 right-12 p-1.5 rounded-lg transition-all duration-300 z-10 ${pageBreaks?.[item.id] ? 'bg-orange-500/20 text-orange-400 opacity-100 border border-orange-500/30' : 'text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 opacity-0 group-hover:opacity-100 border border-transparent hover:border-orange-500/20'}`}
                                        title={pageBreaks?.[item.id] ? 'Remove page break' : 'Force new page'}
                                    >
                                        <SplitSquareHorizontal size={16} />
                                    </button>
                                    <div className="mb-4 mt-2 space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Title</label>
                                        <input
                                            value={item.title}
                                            onChange={(e) => onUpdateItem(section.id, item.id, 'title', e.target.value)}
                                            placeholder="Title (e.g. AWS Certified)"
                                            className="w-full bg-slate-950/50 text-gray-100 outline-none text-sm p-3 border border-white/5 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-bold placeholder-gray-600 shadow-inner"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Subtitle</label>
                                            <input
                                                value={item.subtitle}
                                                onChange={(e) => onUpdateItem(section.id, item.id, 'subtitle', e.target.value)}
                                                placeholder="Subtitle (e.g. Amazon)"
                                                className="w-full bg-slate-950/50 text-teal-300 outline-none text-sm font-semibold p-3 border border-white/5 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder-gray-600 shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Date Range</label>
                                            <input
                                                value={item.date}
                                                onChange={(e) => onUpdateItem(section.id, item.id, 'date', e.target.value)}
                                                placeholder="Date"
                                                className="w-full bg-slate-950/50 text-gray-400 outline-none text-sm p-3 border border-white/5 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder-gray-600 shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <BulletPointEditor
                                        bullets={item.bullets || []}
                                        onChange={(newBullets) => onUpdateItem(section.id, item.id, 'bullets', newBullets)}
                                    />
                                </div>
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            <button
                onClick={() => onAddItem(section.id)}
                className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-400 font-bold tracking-wide text-sm hover:border-teal-500/50 hover:text-teal-400 hover:bg-teal-500/10 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
            >
                <Plus size={18} /> Add Item
            </button>
        </div>
    );
};

export default CustomSection;
