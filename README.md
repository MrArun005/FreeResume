# FreeResume

A free, privacy-first résumé builder. AI-tailored, ATS-friendly, no signup, your data stays in your browser.

## Features

- **16 templates** including a "Google Style" template tuned for ATS pipelines
- **AI assist** — tailor to a job description, improve writing, ATS score, cover-letter generation, roast feedback
- **Drag & drop** to reorder sections and items
- **Pixel-perfect PDF export** via [@react-pdf/renderer](https://react-pdf.org) — runs entirely in your browser
- **Privacy by design** — everything saves to `localStorage`, nothing leaves your machine

## Tech stack

- React 18 + Vite
- Tailwind CSS
- Framer Motion
- @dnd-kit (drag & drop)
- @react-pdf/renderer (client-side PDF)
- Google Gemini API (AI features)
- Vercel Functions (`api/*.js`) for AI endpoints

## Getting started

```bash
npm install
cp .env.example .env   # then paste your Gemini API key
npm run dev
```

Get a free Gemini API key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

## Project structure

```
src/
├── components/
│   ├── editor/       # Form sections (Personal, Experience, etc.)
│   ├── layouts/      # 16 resume template designs
│   ├── pages/        # LandingPage, BlogPost
│   ├── pdf/          # @react-pdf/renderer document
│   └── ui/           # Modals, drag handles, theme switchers
├── constants/        # Templates, themes, blog posts
├── data/             # Initial / mock data
├── utils/            # resumeParser, pagination, atsScorer
└── App.jsx

api/                  # Vercel serverless functions for AI
└── _utils/gemini.js  # Gemini SDK wrapper with model fallback chain
```

## Scripts

```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## License

MIT
