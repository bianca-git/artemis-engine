
# Copilot Instructions for Artemis Engine

## Project Overview
Artemis Engine is a Next.js 15 application for automated real-time engagement and marketing intelligence. The UI is built with React (function components, hooks) and Tailwind CSS, with DaisyUI for UI primitives and custom styles in `globals.css`. The app orchestrates a step-based workflow for generating and publishing marketing content.

## Architecture & Data Flow
- **Main UI:** `components/App.tsx` coordinates the workflow, rendering sections for topic amplification, data loading, topic selection, blog generation, and publishing.
- **Workflow Steps:** Each step is a card (`StepCard.tsx`) managed by state in `hooks/useArtemis.ts`. Steps include topic amplification, blog generation, SEO, visuals, and CMS publishing.
- **State Management:** Custom hooks in `hooks/` (`useArtemis.ts`, `useArtemisData.ts`, `useArtemisContent.ts`, `useArtemisUI.ts`, `useArtemisWorkflow.ts`) modularize data, workflow, content API, and UI state.
- **Data Loading:** Topics are loaded from CSV (see `useArtemisData.ts` and `utils/helpers.ts`). The user can load/replace CSV via the UI.
- **Content Generation:** All async content generation (blog, SEO, visuals) uses `fetch` to `/api/*` endpoints. These are currently demo endpoints using OpenAI APIs.
- **Visuals:** Visual descriptions are generated and can be published to Google Sheets or CMS.
- **CMS Integration:** Publishing uses `/api/publish-cms/route.ts` and `sanityClient.ts` for Sanity CMS.

## Developer Workflows
- **Dev Server:** `pnpm dev` (Next.js)
- **Build:** `pnpm build`
- **Start:** `pnpm start`
- **Debug:** Use VS Code launch config `Next.js: debug dev server` (runs `pnpm dev` with Node.js debugger)
- **Styles:** Tailwind config in `tailwind.config.js`, DaisyUI in `postcss.config.js`, custom styles in `globals.css`.

## Project Conventions & Patterns
- **Step Workflow:** Steps are objects with `title`, `icon`, `isUnlocked`, `isComplete`, etc. See `StepCard.tsx` and `GenerationSteps.tsx` for rendering logic.
- **API Integration:** All async content generation uses `fetch` to `/api/*` endpoints with JSON payloads. Replace these with real endpoints as needed.
- **CSV Data:** Initial CSV is hardcoded in `useArtemisData.ts` for demo; user can load/replace via UI.
- **Icons:** Uses `lucide-react` for iconography.
- **Custom Colors:** Magenta and cyan are used for branding (see `globals.css`).
- **UI Components:** Use DaisyUI classes for buttons, cards, alerts, and loading states for visual consistency.

## Integration Points
- **API:** All content generation and publishing is via `/api/*` endpoints (see `useArtemis.ts`).
- **Sanity CMS:** Publishing uses `sanityClient.ts` and `/api/publish-cms/route.ts`.
- **OpenAI:** Content generation endpoints call OpenAI APIs for blog, SEO, and visual generation.
- **Google Sheets:** Visuals can be published to Google Sheets via utility functions.

## Key Files & Directories
- `components/App.tsx` – Main UI
- `components/StepCard.tsx` – Step rendering
- `components/GenerationSteps.tsx` – Workflow steps
- `components/BlogSection.tsx` – Blog rendering
- `components/TopicAmplifier.tsx` – Topic brainstorming
- `hooks/useArtemis.ts` – Workflow/data logic
- `hooks/useArtemisContent.ts` – API integration
- `hooks/useArtemisData.ts` – CSV/topic logic
- `utils/helpers.ts` – CSV and utility functions
- `styles/globals.css` – Custom styles
- `tailwind.config.js`, `postcss.config.js` – Styling config
- `app/api/*` – API endpoints for content generation and publishing

## Examples
- To add a new workflow step: update state in `useArtemis.ts` and render in `App.tsx`/`StepCard.tsx`/`GenerationSteps.tsx`.
- To add a new API integration: add a handler in `useArtemisContent.ts` and connect to a new `/api/*` route.

---
If you update conventions or add new workflows, document them here for future AI agents.
