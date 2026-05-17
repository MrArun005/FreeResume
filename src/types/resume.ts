// Canonical shape of a LandedJob resume.
//
// The runtime data lives in localStorage (key: resumeProfiles_v1, per
// src/utils/profilesStore.js) so any change here must stay backward-
// compatible — older serialized objects need to still parse. Optional
// fields stay optional; new fields default-safe at the consumer.

export interface SocialLink {
    id: string | number;
    network: string;
    url: string;
}

export interface PersonalInfo {
    fullName?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    socials?: SocialLink[];
}

export interface ExperienceItem {
    id: string | number;
    role: string;
    company: string;
    date?: string;
    location?: string;
    bullets?: string[];
    /** Legacy: pre-migration single-paragraph description. Use `bullets`. */
    description?: string;
}

export interface EducationItem {
    id: string | number;
    degree?: string;
    school?: string;
    date?: string;
    location?: string;
}

export interface ProjectItem {
    id: string | number;
    title: string;
    date?: string;
    bullets?: string[];
}

export interface CustomItem {
    id: string | number;
    title?: string;
    subtitle?: string;
    date?: string;
    bullets?: string[];
    description?: string;
}

export interface CustomSection {
    id: string;
    title: string;
    items: CustomItem[];
}

export interface CoverLetter {
    title: string;
    body: string;
    bullets: string[];
}

export interface Resume {
    personal: PersonalInfo;
    experience: ExperienceItem[];
    education: EducationItem[];
    /**
     * Each entry is a string. For categorized skills, entries take the
     * form "Category: item1, item2, item3" (see src/utils/skillTaxonomy.js).
     */
    skills: string[];
    projects?: ProjectItem[];
    customSections: CustomSection[];
    coverLetter: CoverLetter;
    /** Ordered list of section ids — drives the editor + preview render order. */
    sectionOrder: string[];
    /** Map of section/item id → boolean. When true, the section starts on a new page. */
    pageBreaks: Record<string, boolean>;
}

// ─── Fix descriptors ─────────────────────────────────────────────────────
//
// AI audit/roast endpoints attach a `fix` object to every issue so the
// client can apply it with one click. See src/utils/applyResumeFix.js for
// the consumer.

export type FixType =
    | 'replace-text'
    | 'append-bullet'
    | 'add-keywords'
    | 'normalize-skills'
    | 'add-section'
    | 'none';

export interface Fix {
    type: FixType;
    /** Dot path into the resume, e.g. "personal.summary" or "experience.0.bullets.2". */
    target: string;
    value: string;
}

// ─── Profile store ───────────────────────────────────────────────────────

export interface Profile {
    id: string;
    name: string;
    resume: Resume;
    updatedAt: number;
}

export interface ProfilesStore {
    profiles: Profile[];
    activeId: string | null;
}
