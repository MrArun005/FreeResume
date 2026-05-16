import React from 'react';
import DraggableElement from '../ui/DraggableElement';
import { Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';

const LayoutCanvas = ({ data, theme, onUpdateStyle, pageIndex = 0 }) => {
    const { personal, customStyles = {} } = data;
    const pageHeight = 1123;
    const yOffset = pageIndex * pageHeight;

    // Helper to get style or default
    const getStyle = (id, defaultX, defaultY, defaultW, defaultH) => {
        const style = customStyles[id] || {};
        return {
            x: style.x ?? defaultX,
            y: (style.y ?? defaultY) - yOffset, // Adjust for page
            w: style.w ?? defaultW,
            h: style.h ?? defaultH
        };
    };

    const handleUpdate = (id, newStyle) => {
        if (onUpdateStyle) {
            onUpdateStyle(id, {
                ...newStyle,
                y: newStyle.y + yOffset // Convert back to global
            });
        }
    };

    return (
        <div className="relative w-full h-[1123px] bg-white text-gray-800 font-sans overflow-hidden shadow-inner bg-grid-slate-100">
            {/* Grid Background for guidance */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Name */}
            <DraggableElement
                id="name"
                initialPos={{ x: getStyle('name', 50, 50).x, y: getStyle('name', 50, 50).y }}
                initialSize={{ w: getStyle('name', 50, 50, 'auto', 'auto').w, h: getStyle('name', 50, 50, 'auto', 'auto').h }}
                onUpdate={handleUpdate}
            >
                <h1 className={`text-5xl font-bold uppercase tracking-tight ${theme.text} whitespace-nowrap`}>
                    {personal.fullName || "Your Name"}
                </h1>
            </DraggableElement>

            {/* Title */}
            <DraggableElement
                id="title"
                initialPos={{ x: getStyle('title', 50, 110).x, y: getStyle('title', 50, 110).y }}
                initialSize={{ w: getStyle('title', 50, 110, 'auto', 'auto').w, h: getStyle('title', 50, 110, 'auto', 'auto').h }}
                onUpdate={handleUpdate}
            >
                <p className={`text-2xl font-medium ${theme.primary} whitespace-nowrap`}>
                    {personal.title || "Professional Title"}
                </p>
            </DraggableElement>

            {/* Contact Info Block */}
            <DraggableElement
                id="contact"
                initialPos={{ x: getStyle('contact', 50, 160).x, y: getStyle('contact', 50, 160).y }}
                initialSize={{ w: getStyle('contact', 50, 160, 'auto', 'auto').w, h: getStyle('contact', 50, 160, 'auto', 'auto').h }}
                onUpdate={handleUpdate}
            >
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                    {personal.email && <div className="flex items-center gap-2"><Mail size={14} /> {personal.email}</div>}
                    {personal.phone && <div className="flex items-center gap-2"><Phone size={14} /> {personal.phone}</div>}
                    {personal.location && <div className="flex items-center gap-2"><MapPin size={14} /> {personal.location}</div>}
                </div>
            </DraggableElement>

            {/* Summary */}
            <DraggableElement
                id="summary"
                initialPos={{ x: getStyle('summary', 50, 250).x, y: getStyle('summary', 50, 250).y }}
                initialSize={{ w: getStyle('summary', 50, 250, 500, 'auto').w, h: getStyle('summary', 50, 250, 500, 'auto').h }}
                onUpdate={handleUpdate}
            >
                <div className="w-full h-full">
                    <h3 className={`text-lg font-bold uppercase border-b-2 ${theme.border} mb-2`}>Profile</h3>
                    <p className="text-gray-700 leading-relaxed">{personal.summary || "Your professional summary goes here..."}</p>
                </div>
            </DraggableElement>

            {/* Experience */}
            <DraggableElement
                id="experience"
                initialPos={{ x: getStyle('experience', 50, 400).x, y: getStyle('experience', 50, 400).y }}
                initialSize={{ w: getStyle('experience', 50, 400, 500, 'auto').w, h: getStyle('experience', 50, 400, 500, 'auto').h }}
                onUpdate={handleUpdate}
            >
                <div className="w-full h-full">
                    <h3 className={`text-lg font-bold uppercase border-b-2 ${theme.border} mb-4`}>Experience</h3>
                    <div className="flex flex-col gap-6">
                        {data.experience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-lg">{exp.role}</h4>
                                    <span className="text-sm text-gray-500">{exp.date}</span>
                                </div>
                                <div className="text-blue-600 font-medium mb-1">{exp.company}</div>
                                {exp.bullets && exp.bullets.length > 0 && (
                                    <ul className="list-disc list-outside ml-5 space-y-1">
                                        {exp.bullets.map((bullet, i) => (
                                            <li key={i} className="text-sm text-gray-700 leading-relaxed">{bullet}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </DraggableElement>

            {/* Education */}
            <DraggableElement
                id="education"
                initialPos={{ x: getStyle('education', 600, 50).x, y: getStyle('education', 600, 50).y }}
                initialSize={{ w: getStyle('education', 600, 50, 250, 'auto').w, h: getStyle('education', 600, 50, 250, 'auto').h }}
                onUpdate={handleUpdate}
            >
                <div className="w-full h-full">
                    <h3 className={`text-lg font-bold uppercase border-b-2 ${theme.border} mb-4`}>Education</h3>
                    <div className="flex flex-col gap-4">
                        {data.education.map(edu => (
                            <div key={edu.id}>
                                <div className="font-bold">{edu.school}</div>
                                <div className="text-sm text-gray-500">{edu.date}</div>
                                <div className="text-sm">{edu.degree}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </DraggableElement>

            {/* Skills */}
            <DraggableElement
                id="skills"
                initialPos={{ x: getStyle('skills', 600, 300).x, y: getStyle('skills', 600, 300).y }}
                initialSize={{ w: getStyle('skills', 600, 300, 250, 'auto').w, h: getStyle('skills', 600, 300, 250, 'auto').h }}
                onUpdate={handleUpdate}
            >
                <div className="w-full h-full">
                    <h3 className={`text-lg font-bold uppercase border-b-2 ${theme.border} mb-4`}>Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm font-medium border border-gray-200">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </DraggableElement>
        </div>
    );
};

export default LayoutCanvas;
