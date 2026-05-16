# Feature Comparison – Free Resume vs Premium Builders

## Overview
This document summarizes the premium‑only features of leading resume‑builder platforms (Zety, Novoresume, Enhancv, Visual CV) and compares them with what **Free Resume** currently offers. It also highlights the most needed feature for our product.

---

## Premium‑Only Features by Platform
| Platform | Premium‑Only Features |
|----------|-----------------------|
| **Zety** | • Unlimited PDF/Word downloads<br>• Access to **all** templates & layouts<br>• Full customisation (colours, fonts, backgrounds, spacing)<br>• **ATS Resume Checker** (real‑time scoring)<br>• **AI‑powered wording suggestions** & pre‑written content blocks<br>• Instant job matches<br>• Multi‑page resume support<br>• 24/7 live chat & phone support |
| **Novoresume** | • Full customisation (colours, fonts, layout tweaks)<br>• Unlimited resume versions & **cover‑letter builder**<br>• Multi‑language resume creation<br>• **AI Assistant** (beta) guiding the creation process<br>• **Job Tracker** for applications<br>• Multi‑page resumes beyond the free 1‑page limit<br>• Public shareable link with analytics |
| **Enhancv** | • 150+ resume & cover‑letter templates<br>• Drag‑and‑drop section re‑ordering with live preview<br>• **ATS Check** with detailed suggestions<br>• **AI helper** for content improvement (spell‑check, readability, tone)<br>• Watermark‑free PDF/PNG downloads<br>• Unlimited resumes & cover letters<br>• Custom visual blocks (projects, hobbies, etc.) |
| **Visual CV** | • 20‑30 professional templates + cover‑letter templates<br>• Unlimited file storage (resumes, CVs, cover letters)<br>• **Custom domain** for a public resume URL<br>• **Performance analytics** (views, downloads, geography)
• Google Docs import/export
• **Career Journal** for tracking achievements
• AI Resume Builder for quick content generation |

---

## What Free Resume Already Offers (Free Features)
| Feature | Description |
|---------|-------------|
| Item‑level manual page breaks | Force any experience/education/custom item onto a new page via a toggle button. |
| Zero‑watermark, 100 % free, no sign‑up | No hidden fees, no branding on exports. |
| Live WYSIWYG preview | Real‑time preview that mirrors the printed PDF layout. |
| Drag‑and‑drop section ordering | Re‑order sections with smooth DnD. |
| Custom sections | Users can add arbitrary sections with bullet‑point editors. |
| Theme selector with curated palettes | Switch between 12+ themes without leaving the editor. |
| Basic ATS‑Score modal | Quick visual indicator of ATS‑friendliness. |
| Export to Word (DOCX) | Direct download of a clean Word file. |
| Tutorial & onboarding flow | Guided tour for first‑time users. |

---

## Most Needed Feature – Cover‑Letter Builder
**Why it matters**
- Users expect a matching cover letter when they search for a resume builder.
- All major premium competitors bundle a cover‑letter editor.
- Implementation can reuse existing `CustomSection` UI, `BulletPointEditor`, and PDF export pipeline, making it a low‑to‑moderate effort.
- Provides a natural path for future premium upgrades (AI suggestions, analytics, etc.).

**High‑level implementation plan**
1. Extend the resume JSON (`initialData`) with a `coverLetter` object.
2. Create `CoverLetterSection.jsx` (similar to `CustomSection`).
3. Add a new tab/button in the editor header to toggle the cover‑letter view.
4. Ensure theme & layout support for the cover letter preview.
5. Extend `ResumePDF.jsx` to render the cover letter as a separate page.
6. Run the existing ATS checker on the cover‑letter text.
7. Persist cover‑letter data in `localStorage`.
8. Add download buttons (PDF/Word) and a “Copy to clipboard” shortcut.
9. Update the tutorial steps to introduce the new flow.
10. Test across all layouts (Gold, Classic, Creative, etc.).

---

## Prioritisation (Quick‑win → Long‑term)
| Priority | Feature | Reason |
|----------|---------|--------|
| **High** | Cover‑letter builder | Immediate user value, low effort, closes major functional gap. |
| **High** | AI content suggestions | Differentiates product; can be a paid add‑on later. |
| **Medium** | Detailed ATS checker | Improves conversion; builds on existing score. |
| **Medium** | Job‑tracker | Adds a mini‑CRM layer for job seekers. |
| **Low** | Public shareable link + analytics | Requires backend but high perceived value for power users. |
| **Low** | Custom domain | Marketing feature; can be a premium tier. |
| **Low** | Multi‑language UI | Expands market; needs translation effort. |
| **Low** | Version history | Good UX, not mission‑critical. |
| **Low** | QR‑code generation | Nice‑to‑have, easy to implement. |
| **Low** | Collaboration | Complex; future SaaS offering. |

---

*Prepared by the development team on 2025‑11‑25.*
