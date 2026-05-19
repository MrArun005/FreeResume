import {
    Type,
    AlignLeft,
    Quote,
    FolderOpen,
    Image as ImageIcon,
    Minus,
    Square,
    Circle,
    Tag,
    Move,
} from 'lucide-react';

// Canvas (Pro) block library catalog. Each entry describes one block type
// the user can add from the palette. Kept in a non-component module so the
// constant can be safely imported by both the library palette and the canvas
// layout without tripping the Fast Refresh "only export components" rule.
export const BLOCK_TYPES = [
    { id: 'heading', label: 'Heading', icon: Type, hint: 'Section title or accent text' },
    { id: 'paragraph', label: 'Paragraph', icon: AlignLeft, hint: 'A block of body copy' },
    { id: 'quote', label: 'Quote', icon: Quote, hint: 'Pull-quote or testimonial' },
    { id: 'project-card', label: 'Project card', icon: FolderOpen, hint: 'Title + 2-line description' },
    { id: 'photo', label: 'Photo', icon: ImageIcon, hint: 'Image from URL' },
    { id: 'divider', label: 'Divider', icon: Minus, hint: 'Thin horizontal line' },
    { id: 'shape-rect', label: 'Rectangle', icon: Square, hint: 'Solid color block' },
    { id: 'shape-circle', label: 'Circle', icon: Circle, hint: 'Solid color circle' },
    { id: 'skill-cluster', label: 'Skill chips', icon: Tag, hint: 'A small chip cluster' },
    { id: 'spacer', label: 'Spacer', icon: Move, hint: 'Invisible spacing block' },
];
