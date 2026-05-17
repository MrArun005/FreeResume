import React from 'react';
import {
    Download,
    LayoutGrid,
    User,
    Plus,
    SplitSquareHorizontal,
    Sparkles,
    ArrowRight,
    Palette,
} from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

import { SortableTag } from '../ui/SortableTag';
import Logo from '../ui/Logo';
import AppThemeSwitcher from '../ui/AppThemeSwitcher';
import PersonalSection from '../editor/PersonalSection';
import SummarySection from '../editor/SummarySection';
import ExperienceSection from '../editor/ExperienceSection';
import EducationSection from '../editor/EducationSection';
import SkillsSection from '../editor/SkillsSection';
import CustomSection from '../editor/CustomSection';
import CoverLetterSection from '../editor/CoverLetterSection';
import ProfilesMenu from '../ui/ProfilesMenu';

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
    addCustomItem,
    onOpenAts,
    onOpenTheme,
    profiles,
    activeProfileId,
    onSwitchProfile,
    onCreateProfile,
    onDuplicateProfile,
    onRenameProfile,
    onDeleteProfile,
}) => {
    return (
        <div
            className={`${mobileView === 'editor' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[450px] bg-stone-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col h-full z-10 overflow-hidden no-print absolute lg:relative inset-0`}
        >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="min-w-0">
                        <Logo className="w-8 h-8" textClassName="text-lg" />
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-stone-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            title="Download PDF"
                        >
                            <Download size={14} /> <span className="hidden sm:inline">Export</span>
                        </button>
                        {onOpenTheme && (
                            <button
                                onClick={onOpenTheme}
                                className="p-2 text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Design & Theme"
                            >
                                <Palette size={18} />
                            </button>
                        )}
                        <AppThemeSwitcher className="!p-2" />
                        <button
                            onClick={() => setView('gallery')}
                            className="p-2 text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Back to Gallery"
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>
                {profiles?.length > 0 && (
                    <div className="mt-2">
                        <ProfilesMenu
                            profiles={profiles}
                            activeProfileId={activeProfileId}
                            onSwitchProfile={onSwitchProfile}
                            onCreateProfile={onCreateProfile}
                            onDuplicateProfile={onDuplicateProfile}
                            onRenameProfile={onRenameProfile}
                            onDeleteProfile={onDeleteProfile}
                        />
                    </div>
                )}
            </div>

            {/* Navigation & Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-8">
                    {/* Section Navigation (Draggable) */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveSection('personal')}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-colors flex items-center gap-1.5 ${activeSection === 'personal' ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-500/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-stone-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-stone-100'}`}
                        >
                            <User size={14} /> Personal
                        </button>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) => handleDragEnd(event, 'sectionOrder')}
                        >
                            <SortableContext items={resume.sectionOrder} strategy={rectSortingStrategy}>
                                {resume.sectionOrder.map((sectionId) => {
                                    const isCustom = ![
                                        'summary',
                                        'experience',
                                        'education',
                                        'skills',
                                        'coverLetter',
                                    ].includes(sectionId);
                                    const section = isCustom
                                        ? resume.customSections.find((s) => s.id === sectionId)
                                        : null;

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
                                            onRemove={
                                                isCustom ? () => removeCustomSection(sectionId) : undefined
                                            }
                                        >
                                            <button
                                                onClick={() => setActiveSection(sectionId)}
                                                className={`text-xs font-semibold tracking-wide transition-colors ${activeSection === sectionId ? 'text-brand-700 dark:text-brand-300' : 'text-slate-600 dark:text-stone-300 group-hover:text-slate-900 dark:group-hover:text-stone-100'}`}
                                            >
                                                {label}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    togglePageBreak(sectionId);
                                                }}
                                                className={`ml-2 p-1 rounded-md transition-colors ${hasPageBreak ? 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/25' : 'text-slate-400 dark:text-stone-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10'}`}
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
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-stone-300 rounded-full text-xs font-semibold tracking-wide border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-stone-100 transition-colors flex items-center gap-1.5"
                        >
                            <Plus size={14} /> Add Section
                        </button>
                    </div>

                    {/* AI Affordance — first-class entry into ATS audit */}
                    {onOpenAts && (
                        <button
                            onClick={onOpenAts}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-brand-200 dark:border-brand-500/30 text-left transition-all hover:border-brand-300 dark:hover:border-brand-400/50 hover:-translate-y-px"
                            style={{
                                background:
                                    'linear-gradient(135deg, rgba(20,184,166,0.10), rgba(20,184,166,0.02))',
                            }}
                        >
                            <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
                                <Sparkles size={16} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-slate-900 dark:text-stone-100">
                                    Run ATS audit
                                </div>
                                <div className="text-[12px] text-slate-500 dark:text-stone-400 mt-0.5">
                                    AI score + keyword check
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-brand-700 dark:text-brand-400 shrink-0" />
                        </button>
                    )}

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
                                resume={resume}
                            />
                        )}
                        {activeSection === 'experience' && (
                            <ExperienceSection
                                experience={resume.experience}
                                resume={resume}
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
                                resume={resume}
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
                                onUpdateSkills={(nextSkills) => {
                                    setResume((prev) => ({ ...prev, skills: nextSkills }));
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
                        {resume.customSections.find((s) => s.id === activeSection) && (
                            <CustomSection
                                section={resume.customSections.find((s) => s.id === activeSection)}
                                resume={resume}
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
