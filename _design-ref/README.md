# Design Reference

Design system source from claude.ai/design (UI kit `ui_kits/freeresume-app/index.html`).

## Key tokens

- **Fonts**: Inter (body), Instrument Serif (display)
- **Easing**: `cubic-bezier(0.21, 0.47, 0.32, 0.98)` — `var(--ease-app)` in CSS
- **Accent**: `teal-700` for headings / eyebrows, `teal-600` for action buttons
- **Neutrals**: `stone-50` page bg, `slate-200` borders, `slate-900` text/buttons

## Component patterns

- `CardChrome` — collapsible item card (drag grip + page-break + delete + chevron in a tight row)
- `FillInput` — transparent input until focused → white bg + slate-300 border
- `BulletRow` — bullet character outside textarea, textarea looks inline until focused
- `Eyebrow` — small uppercase teal label above section heads
- `ThumbPaper` — per-template-family thumbnail with distinct header style + placeholder bars

## Screens

1. **Landing** — hero / template strip / features bento / templates grid / dark "how it works" / stats / cta / footer
2. **Picker** — split-view template chooser (grid left, live preview right)
3. **Editor** — light sidebar (forms) + light workspace (preview) + dark header chrome
4. **ATS modal** — centered overlay with green score circle, keyword chips, 2-col issues

Not adding the standalone Picker screen yet — existing onboarding modal flow stays for now.
This adaptation focuses on editor sidebar refinement + ATS modal + thumbnails.
