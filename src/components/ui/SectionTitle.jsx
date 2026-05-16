import React from 'react';

const SectionTitle = ({ title, theme, className = "" }) => (
    <h3 className={`uppercase tracking-widest text-sm font-bold mb-3 ${theme.text} border-b-2 ${theme.border} pb-1 ${className}`} style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
        {title}
    </h3>
);

export default SectionTitle;
