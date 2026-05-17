import { User, Plus, Trash2 } from 'lucide-react';
import { FillInput, FieldLabel } from '../ui/EditorPrimitives';

const PersonalSection = ({ resume, onPersonalChange, onSocialChange, onAddSocial, onRemoveSocial }) => {
    return (
        <div className="space-y-5">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 tracking-tight">
                <User size={18} className="text-teal-700" /> Personal details
            </h2>

            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                    <div>
                        <FieldLabel>Full name</FieldLabel>
                        <FillInput value={resume.personal.fullName || ''} onChange={onPersonalChange} name="fullName" placeholder="John Doe" />
                    </div>
                    <div>
                        <FieldLabel>Headline</FieldLabel>
                        <FillInput value={resume.personal.title || ''} onChange={onPersonalChange} name="title" placeholder="Software Engineer" />
                    </div>
                    <div>
                        <FieldLabel>Email</FieldLabel>
                        <FillInput value={resume.personal.email || ''} onChange={onPersonalChange} name="email" placeholder="john@example.com" />
                    </div>
                    <div>
                        <FieldLabel>Phone</FieldLabel>
                        <FillInput value={resume.personal.phone || ''} onChange={onPersonalChange} name="phone" placeholder="+1 (555) 010-0100" />
                    </div>
                    <div className="col-span-2">
                        <FieldLabel optional>Location</FieldLabel>
                        <FillInput value={resume.personal.location || ''} onChange={onPersonalChange} name="location" placeholder="New York, USA" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <FieldLabel>Social links & portfolio</FieldLabel>
                    <button
                        onClick={onAddSocial}
                        className="text-teal-700 hover:text-teal-800 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                        <Plus size={12} /> Add link
                    </button>
                </div>
                <div className="space-y-2.5">
                    {(resume.personal.socials || []).length === 0 && (
                        <p className="text-[12px] text-slate-400 italic">No social links yet. Add LinkedIn, GitHub, your portfolio…</p>
                    )}
                    {(resume.personal.socials || []).map((social) => (
                        <div key={social.id} className="grid grid-cols-[1fr_1.6fr_auto] gap-2 items-center group">
                            <FillInput
                                value={social.network}
                                onChange={(e) => onSocialChange(social.id, 'network', e.target.value)}
                                placeholder="LinkedIn"
                            />
                            <FillInput
                                value={social.url}
                                onChange={(e) => onSocialChange(social.id, 'url', e.target.value)}
                                placeholder="https://linkedin.com/in/you"
                            />
                            <button
                                onClick={() => onRemoveSocial(social.id)}
                                className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PersonalSection;
