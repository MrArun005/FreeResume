# Next Steps for **Free Resume** 🚀

## 🎨 Design & Visual Polish

- Refine the glass‑morphism cards on the landing page (blur, subtle shadows, smooth hover scale).
- Switch the default font to **Outfit** for headings and **Inter** for body text – both load from Google Fonts.
- Add micro‑animations to the template thumbnails (fade‑in, slight lift on hover).
- Centralise colour tokens in `src/constants/designTokens.js` so any future palette change propagates automatically.

## 📄 Core Feature Gap – Cover‑Letter Builder

We identified the **cover‑letter editor** as the single most needed addition.

- Create a new component `CoverLetterSection.jsx` that mirrors `CustomSection` (title, body textarea, bullet‑point editor).
- Add a **Cover Letter** tab in the editor header and a toggle in the sidebar.
- Extend the PDF export (`ResumePDF.jsx`) to prepend the cover letter as its own page.
- Persist cover‑letter data in the same `resume` JSON structure (`resume.coverLetter`).
- Update the tutorial modal to showcase the new cover‑letter flow.

## 🤖 Smart Assistance – AI Content Suggestions (optional, low‑priority)

- Hook a lightweight LLM endpoint (e.g., `gpt‑4o‑mini`) to generate bullet‑point ideas based on the job title.
- Show suggestions in a collapsible panel inside each section.
- Keep the call optional and rate‑limited to avoid cost spikes.

## 📊 Enhanced ATS Feedback

- Replace the single score with a checklist that highlights:
    - Over‑long lines
    - Missing keywords
    - Unusual fonts or colours
- Use the existing `resume` data to run a simple keyword matcher.

## 📂 Project Structure Improvements

- Move all layout components into `src/components/layouts/` (already done for most).
- Extract the **ThemeSelector**, **TemplateSidebar**, and **Header** into their own folders for easier maintenance.
- Add a `src/constants/` folder for design tokens, template metadata, and default resume JSON.

## 🌐 Community & Feedback Loop

- Implement an in‑app **Suggestion Widget** (floating button → modal) that creates a GitHub issue via the public repo API.
- Publish a public **Roadmap** page (Markdown → GitHub Pages) linked from the footer.
- Add a simple **Job Tracker** table (company, role, status) stored in `localStorage`.

## 📈 Performance & Accessibility

- Enable code‑splitting for each layout with `React.lazy`.
- Audit colour contrast (≥ 4.5:1) and add ARIA labels to all icons (`SplitSquareHorizontal`, `Printer`, etc.).
- Lazy‑load heavy assets (icons, images) and compress them.

## 🗓️ 12‑Week Sprint Outline

1‑2 weeks: Design token centralisation & visual polish.
3‑4 weeks: Build the Cover‑Letter component, UI integration, PDF export.
5‑6 weeks: Add AI suggestion hook (optional) and detailed ATS checklist.
7‑8 weeks: Implement suggestion widget, roadmap page, and job‑tracker.
9‑10 weeks: Performance optimisations, lazy loading, accessibility audit.
11‑12 weeks: QA, bug‑fixes, final polish, release.

---

_All changes are aimed at delivering a premium, ad‑free, no‑login experience that feels polished and complete, while keeping the codebase maintainable and open to community contributions._
