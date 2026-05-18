export const initialData = {
    personal: {
        fullName: 'Arun M',
        title: 'FullStack Developer',
        email: 'arunmallikarjun005@gmail.com',
        phone: '7483573363',
        location: 'Bengaluru, India',
        summary:
            'Passionate Full Stack Developer with 3.2 years of experience creating and implementing innovative web applications. Proficient in both front-end and back-end technologies, with a strong focus on user-interface design and seamless functionality implementation and delivering high-quality solutions within deadlines.',
        socials: [
            { id: 1, network: 'LinkedIn', url: 'https://linkedin.com/in/arun-%C2%A0m-9163181a0' },
            { id: 2, network: 'Portfolio', url: 'https://arunmallikarjun.netlify.app' },
        ],
    },
    experience: [
        {
            id: 1,
            role: 'Senior Developer',
            company: 'Tecnotree Convergence Private Limited',
            date: '10/2023 - Present',
            location: 'Bengaluru',
            bullets: [
                'Integrated third-party applications into existing software, enhancing features and performances',
                'Analyzed and mitigated performance issues in microservices ecosystem and increasing system scalability',
                'Conducted comprehensive code reviews for team members, providing constructive feedback to enhance code quality and readability',
                'Boosted application performance by 30% by optimising React component renders, resulting in a smoother user interface',
                'Identified and addressed production bottlenecks, including browser service limitations, ensuring high service availability and reliability',
                'Delivered customized Active Reports solutions , enabling advanced data visualization and enhancing reporting eﬃciency for clients',
            ],
        },
        {
            id: 2,
            role: 'Software Engineer',
            company: 'Tecnotree Convergence Private Limited',
            date: '10/2021 - 10/2023',
            location: 'Bengaluru',
            bullets: [
                'Developed high-quality code for diverse software projects considering system performance optimization',
                'Designed and executed workflows through the utilization of microservices, capitalizing on their flexibility and scalability',
                'Diagnosed and resolved deployment issues, such as Chrome service limitations, by implementing optimized resource management strategies',
            ],
        },
    ],
    education: [
        {
            id: 1,
            degree: "Bachelor's of Engineering, Computer science and Engineering",
            school: 'Visvesvaraya Technological University',
            date: '07/2017 - 09/2021',
            location: 'Mysuru',
        },
    ],
    skills: [
        'Javascript',
        'NodeJs',
        'Java',
        'SpringBoot',
        'Css',
        'HTML',
        'MongoDB',
        'MySQL',
        'Kubernates',
        'Scrum',
        'Jira',
        'Git',
        'RESTful API',
        'ReactJS',
        'Material-UI',
        'Redux',
    ],
    projects: [
        {
            id: 1,
            title: 'Automated YouTube Video Creator',
            date: '2024',
            bullets: [
                'Built an automated platform combining OpenAI, ElevenLabs, and DALL-E for script generation, text-to-speech, and background visuals.',
                'Developed a web-based dashboard UI to manage video rendering and schedule uploads directly to YouTube.',
            ],
        },
        {
            id: 2,
            title: 'FixMyPipe (Plumbing Booking Platform)',
            date: '2024',
            bullets: [
                'Developed a SaaS application with PWA features for service booking, calendar scheduling, and admin workflows.',
                'Configured Firebase Cloud Messaging for push notifications via service workers to ensure real-time updates for users and plumbers.',
            ],
        },
        {
            id: 3,
            title: 'Export Coding with the help of AI (Custom Resume Builder)',
            date: '2024',
            bullets: [
                'Engineered a highly customizable resume builder application that manages complex document-level UI rendering.',
                'Implemented advanced pagination logic and precise styling rules for varied layouts (Jakes, Classic, Freeform) to calculate dynamic DOM heights for pixel-perfect PDF exports.',
            ],
        },
        {
            id: 4,
            title: 'Management UI',
            date: '10/2021 - Present',
            bullets: [
                'Implemented various features within React-based frontend application to streamline data configuration for array of microservices',
                'Implemented data transfer capabilities to facilitate seamless data transfer between diﬀerent environments',
                'Implemented active reports to design the dynamic invoices',
            ],
        },
        {
            id: 5,
            title: 'Active Reports',
            date: '08/2022 - Present',
            bullets: [
                'Developed interactive and dynamic reports using Active Reports and JavaScript, enabling real-time data visualization',
                'Implemented advanced features such as drill-down, parameterized filtering, and custom scripting',
                'Integrated Active Reports with RESTful APIs and optimized rendering for large datasets',
            ],
        },
        {
            id: 6,
            title: 'Digital Accelerator Platform',
            date: '10/2021 - Present',
            bullets: [
                'Digital accelerator platform (DAP) empowers users to rapidly create and enhance services utilizing low-code methodologies',
            ],
        },
    ],
    // Dynamic Sections
    customSections: [],
    coverLetter: { title: '', body: '', bullets: [] },
    sectionOrder: ['summary', 'experience', 'projects', 'education', 'skills'],

    // Manual Page Breaks
    pageBreaks: {},
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
