export const initialData = {
    personal: {
        fullName: 'Sofia Andersson',
        title: 'Senior Product Designer',
        email: 'sofia@andersson.studio',
        phone: '+46 70 555 0142',
        location: 'Stockholm, Sweden',
        summary:
            'Senior Product Designer with 7+ years shipping consumer and B2B SaaS at growth-stage startups across Europe. I lead end-to-end product design — research, systems, prototyping — and partner closely with engineering to move fast without losing craft. Known for shipping high-clarity interfaces, scaling design systems, and mentoring designers into senior roles.',
        socials: [
            { id: 1, network: 'LinkedIn', url: 'https://linkedin.com/in/sofiaandersson' },
            { id: 2, network: 'Portfolio', url: 'https://sofia.andersson.studio' },
        ],
    },
    experience: [
        {
            id: 1,
            role: 'Senior Product Designer',
            company: 'Helix',
            date: '03/2022 - Present',
            location: 'Stockholm',
            bullets: [
                'Led the redesign of the onboarding flow, lifting day-7 activation from 38% to 61% (+23pp) across 180k monthly signups.',
                'Built and shipped Helix Design System v2 (78 components, 12 tokens) — adopted by 4 product teams in under a quarter.',
                'Partnered with research to run 27 moderated studies in 8 months, turning findings into a quarterly opportunity backlog the PM org now plans against.',
                'Mentored two mid-level designers into senior roles; both now leading their own product surfaces.',
                'Reduced design-to-engineering handoff time ~40% by introducing component-spec docs and a Figma-to-Storybook pipeline.',
            ],
        },
        {
            id: 2,
            role: 'Product Designer',
            company: 'Field & Co',
            date: '06/2019 - 02/2022',
            location: 'Berlin',
            bullets: [
                'Owned design for the merchant dashboard (€400M annual GMV) — redesigned analytics, payouts, and inventory in three releases.',
                'Cut support tickets ~28% by simplifying the refund flow and rewriting in-product microcopy with the writing lead.',
                "Established the company's first usability testing cadence — 4 sessions per sprint — embedded into the standing design ritual.",
                'Collaborated with brand on a full visual refresh ahead of the Series B round.',
            ],
        },
        {
            id: 3,
            role: 'UX Designer',
            company: 'Klint Analytics',
            date: '08/2017 - 05/2019',
            location: 'Copenhagen',
            bullets: [
                'Designed dashboard tooling for enterprise SaaS analytics customers (Tier-1 banks, telcos).',
                'Prototyped data-viz patterns in code (D3, Recharts) to reduce engineer ramp time on bespoke chart asks.',
                'Ran the first formal design critique program — still in place at the company six years later.',
            ],
        },
    ],
    education: [
        {
            id: 1,
            degree: 'MA, Interaction Design',
            school: 'Umeå Institute of Design',
            date: '08/2015 - 06/2017',
            location: 'Umeå, Sweden',
        },
        {
            id: 2,
            degree: 'BA, Visual Communication',
            school: 'Konstfack — University of Arts, Crafts & Design',
            date: '08/2012 - 06/2015',
            location: 'Stockholm, Sweden',
        },
    ],
    skills: [
        'Tools: Figma, FigJam, Framer, Principle, Notion',
        'Research: Moderated & unmoderated testing, diary studies, surveys, journey mapping',
        'Systems: Tokens, theming, accessibility (WCAG 2.2 AA), Storybook',
        'Prototyping: Framer, HTML/CSS, Lottie, light React',
        'Collaboration: Cross-functional facilitation, design critique, mentoring',
        'Languages: English (native), Swedish (native), German (conversational)',
    ],
    projects: [
        {
            id: 1,
            title: 'Helix Design System v2',
            date: '2024',
            bullets: [
                'Rebuilt the company design system from scratch with semantic tokens, dark mode, and a documented contribution model.',
                'Shipped a Storybook-backed component library that four product teams adopted within a quarter.',
            ],
        },
        {
            id: 2,
            title: 'Onboarding Redesign — Helix',
            date: '2023',
            bullets: [
                'Replaced a 7-step wizard with a 3-step contextual flow informed by 12 user interviews and three rounds of unmoderated testing.',
                'Day-7 activation lifted from 38% to 61% — measured across an 180k monthly signup base.',
            ],
        },
        {
            id: 3,
            title: 'Accessibility Audit — Field & Co Merchant Dashboard',
            date: '2021',
            bullets: [
                'Audited a 200-screen dashboard against WCAG 2.1 AA; produced a tracked remediation backlog with engineering ownership.',
                'Brought contrast and keyboard-navigation compliance from 41% to 96% over two quarters.',
            ],
        },
    ],
    // Dynamic Sections
    customSections: [],
    coverLetter: { title: '', body: '', bullets: [] },
    sectionOrder: ['summary', 'experience', 'projects', 'education', 'skills'],

    // Manual Page Breaks
    pageBreaks: {},

    // Canvas Pro: user-added free-form blocks (heading, quote, photo, divider,
    // shape, etc). Only used by the Canvas layout. Each entry has its own
    // position/size and style overrides. Built-in canvas blocks (name, title,
    // contact, summary, experience, education, skills) live in customStyles.
    canvasBlocks: [],
};

// Blank scaffold for "New resume" in the profiles menu. Keeps the canonical
// shape but no content — previously new profiles were seeded from
// `initialData` (Arun's demo resume), which made every new profile look
// identical to the first one and obscured the multi-profile feature.
export const emptyResume = {
    personal: {
        fullName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        socials: [],
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    customSections: [],
    coverLetter: { title: '', body: '', bullets: [] },
    sectionOrder: ['summary', 'experience', 'education', 'skills'],
    pageBreaks: {},
    sectionStyles: {},
    paperSize: 'A4',
    accentColor: null,
    pageMargins: 'standard',
    headerAlignment: 'left',
    canvasBlocks: [],
};

export const parsedMockData = {
    personal: {
        fullName: 'Jordan Smith',
        title: 'Product Manager',
        email: 'jordan.smith@demo-mail.com',
        phone: '(212) 555-0199',
        location: 'New York, NY',
        summary:
            'Results-oriented Product Manager with 6 years of experience in agile environments. Skilled in roadmapping, user research, and data analytics. Successfully launched 3 major SaaS products.',
        socials: [
            { id: 101, network: 'LinkedIn', url: 'https://linkedin.com/in/jsmith-pm' },
            { id: 102, network: 'Website', url: 'https://jordansmith.pm' },
        ],
    },
    experience: [
        {
            id: 101,
            role: 'Product Lead',
            company: 'Innovate Corp',
            date: '2021 - Present',
            location: 'San Francisco, CA',
            bullets: [
                'Spearheaded launch of flagship mobile app, achieving 1M+ downloads in first 6 months',
                'Managed cross-functional team of 15 developers and designers',
                'Defined product roadmap and prioritized features based on customer feedback',
                'Increased user engagement by 35% through data-driven feature iterations',
            ],
        },
        {
            id: 102,
            role: 'Associate PM',
            company: 'StartUp Inc',
            date: '2018 - 2021',
            location: 'New York, NY',
            bullets: [
                'Conducted 50+ user interviews to identify pain points and opportunities',
                'Led to 20% increase in retention through targeted UX improvements',
                'Collaborated with engineering to prioritize backlog and deliver sprints on time',
            ],
        },
    ],
    education: [
        {
            id: 201,
            degree: 'MBA',
            school: 'Stern School of Business',
            date: '2016 - 2018',
        },
    ],
    skills: ['Product Management', 'JIRA', 'Agile/Scrum', 'SQL', 'Figma', 'A/B Testing', 'Google Analytics'],
};
