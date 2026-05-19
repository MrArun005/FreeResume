import React from 'react';
import { BulletList, FieldLabel } from '../ui/EditorPrimitives';

// Props: coverLetter object {title, body, bullets}, onChange(section, field, value).
// All field reads are optional-chained because profiles that predate the
// cover-letter feature have no `coverLetter` key on their resume blob.
const CoverLetterSection = ({ coverLetter, onChange }) => {
    const cl = coverLetter || {};
    const handleFieldChange = (field, value) => {
        onChange('coverLetter', field, value);
    };

    return (
        <div className="space-y-4">
            <div>
                <FieldLabel>Title</FieldLabel>
                <input
                    type="text"
                    placeholder="Cover Letter Title (e.g. Application for Senior Engineer)"
                    value={cl.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:border-blue-300 dark:focus:border-blue-500"
                />
            </div>
            <div>
                <FieldLabel>Body</FieldLabel>
                <textarea
                    placeholder="Write your cover letter body here..."
                    value={cl.body || ''}
                    onChange={(e) => handleFieldChange('body', e.target.value)}
                    rows={8}
                    className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:border-blue-300 dark:focus:border-blue-500"
                />
            </div>
            <div>
                <FieldLabel>Highlights</FieldLabel>
                <BulletList
                    bullets={cl.bullets || []}
                    onChange={(newBullets) => handleFieldChange('bullets', newBullets)}
                />
            </div>
        </div>
    );
};

export default CoverLetterSection;
