import React from 'react';
import BulletPointEditor from '../ui/BulletPointEditor';

// Props: coverLetter object {title, body, bullets}, onChange(section, field, value)
const CoverLetterSection = ({ coverLetter, onChange }) => {
    const handleFieldChange = (field, value) => {
        onChange('coverLetter', field, value);
    };

    return (
        <div className="space-y-4">
            <input
                type="text"
                placeholder="Cover Letter Title (e.g. Application for Senior Engineer)"
                value={coverLetter.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:border-blue-300 dark:focus:border-blue-500"
            />
            <textarea
                placeholder="Write your cover letter body here..."
                value={coverLetter.body}
                onChange={(e) => handleFieldChange('body', e.target.value)}
                rows={8}
                className="w-full p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:border-blue-300 dark:focus:border-blue-500"
            />
            <BulletPointEditor
                bullets={coverLetter.bullets || []}
                onChange={(newBullets) => handleFieldChange('bullets', newBullets)}
            />
        </div>
    );
};

export default CoverLetterSection;
