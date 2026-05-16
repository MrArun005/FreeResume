import React from 'react';
import { User, Plus, Trash2 } from 'lucide-react';

const PersonalSection = ({ resume, onPersonalChange, onSocialChange, onAddSocial, onRemoveSocial }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2 tracking-wide">
                <User size={20} className="text-teal-400" /> Personal Details
            </h2>
            <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                    <input
                        value={resume.personal.fullName}
                        onChange={onPersonalChange}
                        name="fullName"
                        className="w-full p-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all font-medium text-base text-white placeholder-gray-500 shadow-inner"
                        placeholder="John Doe"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Job Title</label>
                    <input
                        value={resume.personal.title}
                        onChange={onPersonalChange}
                        name="title"
                        className="w-full p-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all font-medium text-base text-white placeholder-gray-500 shadow-inner"
                        placeholder="Software Engineer"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Phone</label>
                    <input
                        value={resume.personal.phone}
                        onChange={onPersonalChange}
                        name="phone"
                        className="w-full p-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all font-medium text-base text-white placeholder-gray-500 shadow-inner"
                        placeholder="+1 234 567 890"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email</label>
                    <input
                        value={resume.personal.email}
                        onChange={onPersonalChange}
                        name="email"
                        className="w-full p-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all font-medium text-base text-white placeholder-gray-500 shadow-inner"
                        placeholder="john@example.com"
                    />
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Location / Address</label>
                    <input
                        value={resume.personal.location}
                        onChange={onPersonalChange}
                        name="location"
                        className="w-full p-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all font-medium text-base text-white placeholder-gray-500 shadow-inner"
                        placeholder="New York, USA"
                    />
                </div>

                {/* Social Links Editor */}
                <div className="col-span-2 mt-6 border-t border-white/5 pt-6">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 mb-3 block">Social Links & Portfolio</label>
                    <div className="space-y-4">
                        {(resume.personal.socials || []).map(social => (
                            <div key={social.id} className="flex gap-2 items-start group">
                                <div className="flex-1 space-y-2">
                                    <input
                                        value={social.network}
                                        onChange={(e) => onSocialChange(social.id, 'network', e.target.value)}
                                        className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all font-bold text-sm text-teal-300 placeholder-teal-800 shadow-inner"
                                        placeholder="Network (e.g. LinkedIn)"
                                    />
                                    <input
                                        value={social.url}
                                        onChange={(e) => onSocialChange(social.id, 'url', e.target.value)}
                                        className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all text-sm text-gray-300 placeholder-gray-600 shadow-inner"
                                        placeholder="URL (e.g. https://linkedin.com/...)"
                                    />
                                </div>
                                <button
                                    onClick={() => onRemoveSocial(social.id)}
                                    className="p-3 text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/30 hover:bg-red-500/10 rounded-xl mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={onAddSocial}
                            className="text-xs uppercase tracking-wider text-teal-400 font-bold hover:text-teal-300 flex items-center gap-1.5 transition-colors pl-1"
                        >
                            <Plus size={14} /> Add Social Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalSection;
