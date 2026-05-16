import React from 'react';
import {
    FileText, Download, LayoutGrid, User, Plus, SplitSquareHorizontal
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableTag } from '../ui/SortableTag';
import PersonalSection from '../editor/PersonalSection';
import SummarySection from '../editor/SummarySection';
import ExperienceSection from '../editor/ExperienceSection';
import EducationSection from '../editor/EducationSection';
import SkillsSection from '../editor/SkillsSection';
import CustomSection from '../editor/CustomSection';
import CoverLetterSection from '../editor/CoverLetterSection';

const EditorSidebar = ({
    mobileView,
    handleDownloadPDF,
    setView,
    activeSection,
    setActiveSection,
    resume,
    setResume,
    sensors,
    handleDragEnd,
    removeCustomSection,
    togglePageBreak,
    addCustomSection,
    handlePersonalChange,
    handleSocialChange,
    handleAddSocial,
    handleRemoveSocial,
    handleArrayChange,
    removeItem,
    addItem,
    handleCoverLetterChange,
    updateCustomSectionTitle,
    updateCustomItem,
    removeCustomItem,
    addCustomItem
}) => {
    return (
        <div className={`${mobileView === 'editor' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[450px] bg-slate-950 border-r border-white/5 flex-col h-full z-10 overflow-hidden no-print absolute lg:relative inset-0`}>
            {/* Header */}
            <div className="p-6 border-b border-white/10 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                            <FileText className="text-white" size={20} />
                        </div>
                        <h1 className="text-xl font-semibold text-white tracking-tight">Resume Editor</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-md transition-all duration-300"
                            title="Download PDF"
                        >
                            <Download size={16} /> <span className="hidden sm:inline">Export</span>
                        </button>
                        <button onClick={() => setView('gallery')} className="p-2 text-gray-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all duration-300" title="Back to Gallery">
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation & Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-8">

                    {/* Section Navigation (Draggable) */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveSection('personal')}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-colors flex items-center gap-1.5 ${activeSection === 'personal' ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-white/20 hover:text-gray-200'}`}
                        >
                            <User size={14} /> Personal
                        </button>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) => handleDragEnd(event, 'sectionOrder')}
                        >
                            <SortableContext
                                items={resume.sectionOrder}
                                strategy={rectSortingStrategy}
                            >
                                {resume.sectionOrder.map((sectionId) => {
                                    const isCustom = !['summary', 'experience', 'education', 'skills', 'coverLetter'].includes(sectionId);
                                    const section = isCustom ? resume.customSections.find(s => s.id === sectionId) : null;

                                    let label;
                                    if (sectionId === 'coverLetter') {
                                        label = 'Cover Letter';
                                    } else if (isCustom) {
                                        label = section?.title || 'Untitled';
                                    } else {
                                        label = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
                                    }

                                    const hasPageBreak = resume.pageBreaks?.[sectionId] === true;

                                    return (
                                        <SortableTag
                                            key={sectionId}
                                            id={sectionId}
                                            onRemove={isCustom ? () => removeCustomSection(sectionId) : undefined}
                                        >
                                            <button
                                                onClick={() => setActiveSection(sectionId)}
                                                className={`text-xs font-semibold tracking-wide transition-colors ${activeSection === sectionId ? 'text-teal-300' : 'text-gray-400 group-hover:text-gray-200'}`}
                                            >
                                                {label}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    togglePageBreak(sectionId);
                                                }}
                                                className={`ml-2 p-1 rounded-md transition-all duration-300 ${hasPageBreak ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'text-gray-500 hover:text-orange-400 hover:bg-orange-500/10'}`}
                                                title={hasPageBreak ? 'Remove page break' : 'Force new page'}
                                            >
                                                <SplitSquareHorizontal size={14} />
                                            </button>
                                        </SortableTag>
                                    );
                                })}
                            </SortableContext>
                        </DndContext>

                        <button
                            onClick={addCustomSection}
                            className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-full text-xs font-semibold tracking-wide border border-white/5 hover:bg-white/10 hover:border-white/20 hover:text-gray-200 transition-all duration-300 flex items-center gap-1.5"
                        >
                            <Plus size={14} /> Add Section
                        </button>
                    </div>

                    {/* Page Break Help Text */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-300 backdrop-blur-sm shadow-inner">
                        <div className="text-xs text-gray-400 bg-slate-900/50 p-3 rounded-lg border border-white/5 mb-4 shadow-sm">
                            <p className="font-bold mb-1 text-gray-300">💡 Pro Tip: Layout Control (Try playing around)</p>
                            <p className="leading-relaxed">
                                If content pushes to the next page unexpectedly, try <strong className="text-gray-300">reordering above sections</strong> (drag & drop) or using the <strong className="text-blue-400">Manual Page Break</strong> button (<SplitSquareHorizontal size={12} className="inline text-blue-400" />) to force a clean break.
                            </p>
                        </div>
                        <div className="flex items-start gap-2 pt-1 border-t border-blue-500/10">
                            <SplitSquareHorizontal size={16} className="flex-shrink-0 mt-0.5 text-blue-400" />
                            <div className="leading-relaxed">
                                <strong className="text-gray-300">Manual Page Breaks:</strong> Click the <SplitSquareHorizontal size={12} className="inline mx-1" /> icon on any section <strong className="text-gray-300">or item</strong> to force it to start on a new page.
                                Useful when content looks misaligned or cut off. <span className="text-orange-400 font-semibold border-b border-orange-400/30">Orange</span> = page break active.
                            </div>
                        </div>
                    </div>

                    {/* Active Section Editor */}
                    <div className="animate-fadeIn">
                        {activeSection === 'personal' && (
                            <PersonalSection
                                resume={resume}
                                onPersonalChange={handlePersonalChange}
                                onSocialChange={handleSocialChange}
                                onAddSocial={handleAddSocial}
                                onRemoveSocial={handleRemoveSocial}
                            />
                        )}

                        {activeSection === 'summary' && (
                            <SummarySection
                                summary={resume.personal.summary}
                                onChange={handlePersonalChange}
                            />
                        )}
                        {activeSection === 'experience' && (
                            <ExperienceSection
                                experience={resume.experience}
                                sensors={sensors}
                                onDragEnd={handleDragEnd}
                                onArrayChange={handleArrayChange}
                                onRemoveItem={removeItem}
                                onAddItem={addItem}
                                pageBreaks={resume.pageBreaks}
                                onTogglePageBreak={togglePageBreak}
                            />
                        )}

                        {activeSection === 'education' && (
                            <EducationSection
                                education={resume.education}
                                sensors={sensors}
                                onDragEnd={handleDragEnd}
                                onArrayChange={handleArrayChange}
                                onRemoveItem={removeItem}
                                onAddItem={addItem}
                                pageBreaks={resume.pageBreaks}
                                onTogglePageBreak={togglePageBreak}
                            />
                        )}

                        {activeSection === 'skills' && (
                            <SkillsSection
                                skills={resume.skills}
                                sensors={sensors}
                                onDragEnd={handleDragEnd}
                                onRemoveSkill={(skill) => {
                                    setResume(prev => ({
                                        ...prev,
                                        skills: prev.skills.filter(s => s !== skill)
                                    }));
                                }}
                                onAddSkill={(skill) => {
                                    setResume(prev => ({ ...prev, skills: [...prev.skills, skill] }));
                                }}
                            />
                        )}

                        {/* Cover Letter Section */}
                        {activeSection === 'coverLetter' && (
                            <CoverLetterSection
                                coverLetter={resume.coverLetter}
                                onChange={handleCoverLetterChange}
                            />
                        )}

                        {/* Custom Section Editor */}
                        {resume.customSections.find(s => s.id === activeSection) && (
                            <CustomSection
                                section={resume.customSections.find(s => s.id === activeSection)}
                                sensors={sensors}
                                onDragEnd={handleDragEnd}
                                onUpdateTitle={updateCustomSectionTitle}
                                onUpdateItem={updateCustomItem}
                                onRemoveItem={removeCustomItem}
                                onAddItem={addCustomItem}
                                pageBreaks={resume.pageBreaks}
                                onTogglePageBreak={togglePageBreak}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorSidebar;
