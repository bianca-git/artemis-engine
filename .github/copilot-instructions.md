# Copilot Instructions for Artemis Engine

## Project Overview
- **Artemis Engine** is a Next.js 14 app for automated real-time engagement and marketing intelligence.
- The UI is built with React (function components, hooks) and Tailwind CSS, with custom styles in `globals.css`.
- Major UI logic is in `components/` (e.g., `App.tsx`, `StepCard.tsx`).
- Core workflow/data logic is in `hooks/useArtemis.ts`.
- Utility functions are in `utils/helpers.ts`.

## Architecture & Data Flow
- The main workflow is step-based, managed by the `useArtemis` hook. Steps are rendered as cards (`StepCard`).
- Data (topics, blog content, images, etc.) is loaded from CSV and manipulated in-memory via React state.
- API calls (see `useArtemis.ts`) are made to `/api/*` endpoints for generating content (SEO, blog, visuals, social, CMS publish). These are currently placeholders for real backend integration.
- CSV parsing and topic mapping are handled by helpers in `utils/helpers.ts`.

## Developer Workflows
- **Dev server:** `npm run dev` (Next.js)
- **Build:** `npm run build`
- **Start:** `npm start`
- **Debug:** Use VS Code launch config `Next.js: debug dev server` (runs `npm run dev` with Node.js debugger)
- **Styles:** Tailwind config in `tailwind.config.js`, PostCSS in `postcss.config.js`, custom styles in `globals.css`.

## Project Conventions & Patterns
- **State:** Managed with React hooks, especially in `useArtemis.ts`.
- **Step Workflow:** Steps are objects with `title`, `icon`, `isUnlocked`, `isComplete`, etc. See `StepCard.tsx` for rendering logic.
- **API Integration:** All async content generation uses `fetch` to `/api/*` endpoints with JSON payloads. Replace these with real endpoints as needed.
- **CSV Data:** Initial CSV is hardcoded in `useArtemis.ts` for demo; user can load/replace via UI.
- **Icons:** Uses `lucide-react` for consistent iconography.
- **Custom Colors:** Magenta and cyan are used for branding (see `globals.css`).

## Integration Points
- **API:** All content generation and publishing is via `/api/*` endpoints (see `useArtemis.ts`).
- **Firebase:** No direct integration in main codebase, but a Firebase service account JSON is present (not used by default).

## Examples
- To add a new workflow step: update state in `useArtemis.ts` and render in `App.tsx`/`StepCard.tsx`.
- To add a new API integration: add a handler in `useArtemis.ts` and connect to a new `/api/*` route.

## Key Files
- `components/App.tsx` – Main UI
- `components/StepCard.tsx` – Step rendering
- `hooks/useArtemis.ts` – Workflow/data logic
- `utils/helpers.ts` – CSV and utility functions
- `styles/globals.css` – Custom styles
- `tailwind.config.js`, `postcss.config.js` – Styling config

---

If you update conventions or add new workflows, document them here for future AI agents.
