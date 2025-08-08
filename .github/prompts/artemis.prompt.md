---
mode: agent
---
# Copilot instructions — Artemis Engine

Purpose: Help AI agents be productive in this Next.js 15 + React 19 + TypeScript app that automates multi‑step content generation and publishing.

## Big picture
- Orchestrator: `components/App.tsx` uses `hooks/useArtemis` to compose modules: data (`useArtemisData`), content/API (`useArtemisContent`), UI/loading (`useArtemisUI`), workflow utils.
- Step flow: `components/GenerationSteps.tsx` renders Blog → SEO → Visual → Publish. Gating via `workflowState` booleans in `useArtemis` (e.g., SEO unlocks after Blog).
- Types: Core shapes in `types/artemis.ts` (Topic, SeoData, BlogContent, VisualDescription, SocialPost, PortableText). Portable Text is used for CMS payloads.
- API routes: `app/api/*/route.ts` hold server logic. Clients receive plain JSON and wrap it via a central API client.

## Dev workflows
- Scripts (pnpm): `dev`, `build`, `start`, `rm:del` (clean + reinstall + dev).
- Env keys: OPENAI_API_KEY, SANITY_PROJECT_ID/DATASET/API_TOKEN/API_VERSION, GOOGLE_SHEETS_CLIENT_EMAIL/PRIVATE_KEY/SPREADSHEET_ID, GEMINI_API_KEY. Missing keys trigger safe mocks.
- Styling: Tailwind v4 via PostCSS (`postcss.config.mjs`) + DaisyUI, custom styles in `app/globals.css`.

## Integration & data flow
- OpenAI: `utils/openaiClient.ts` provides a singleton and `hasValidOpenAIKey()`. Many routes return mock data when the key is absent.
- Blog: `app/api/generate-blog/route.ts` supports streaming (expects a simple topic string) and non‑streaming (expects `{ TITLE, CONTENT }`; returns Portable Text). Client calls in `useArtemisContent.ts`.
- SEO: `app/api/generate-seo/route.ts` returns `{ metaTitle, metaDescription, keywords }` (mocked without OPENAI_API_KEY).
- Visuals: `app/api/generate-visual/route.ts` uses Google GenAI (Imagen). Params: `{ prompt, scene, bodyLanguage }`. Response: `{ success, images, prompt }` when GEMINI_API_KEY is present; a mock `{ descriptions: [...] }` otherwise.
- Sheets: `app/api/publish-visuals/route.ts` → `utils/googleSheets.appendToSheet(values)` appends to `STUFF!A1` via service account JWT.
- CMS: `app/api/publish-cms/route.ts` → `publish-cms/sanityClient.ts` creates a `post` doc with `title, slug, content(portable text), seo, visuals, socialPosts`.

## Repo‑specific conventions
- CSV/Topics: Headers are UPPERCASE: `ID, TITLE, CONTENT, VISUAL`. Access as `topic.TITLE` (not `topic.title`). See `hooks/useArtemisData.ts` and `utils/helpers.parseCsvData`.
- API client: Use `utils/apiClient.ts` (singleton). It returns `{ success, data?, error? }`. Server routes themselves return plain JSON objects (no `success` wrapper) unless domain status is needed.
- Loading state: Use `useArtemisUI` (`useLoadingState`/`useLoadingWithMessage`) instead of ad‑hoc booleans; visual step supports a message.
- Resets: Use `useGenericReset` + `useWorkflowReset`; resetting upstream steps clears downstream completion flags and state (e.g., resetting Blog also resets SEO/Visual/Social/CMS).
- Components: Step UIs in `components/steps/*` are memoized and expect minimal, stable props.

## Gotchas (from current code)
- Streaming blog param mismatch: `useArtemis.generateBlogStreaming` calls `generateBlogStreaming(topic.title, ...)` but Topics use `TITLE`. Pass a string for streaming or align field casing.
- Visuals publishing path: Client should post to `/api/publish-visuals`; avoid `/publish-visual-sheets` (seen in `VisualStep.tsx`).
- Visuals response shape varies by env: With GEMINI_API_KEY you get `{ images }`; without it you get `{ descriptions }`. UI handles both; keep both fields when extending.

## Adding features the “repo way”
- New step: Create a component in `components/steps/`, render it in `GenerationSteps.tsx`, gate via `workflowState` in `useArtemis`, and wire resets via `useWorkflowReset`.
- New API: Add `app/api/<name>/route.ts` returning plain JSON. Consume via `useArtemisContent` with `apiClient.post('/<name>', payload)` and expose a narrow typed return shape.
- Types first: Update `types/artemis.ts` for shared shapes; keep Portable Text compatibility for CMS.

Key references: `hooks/useArtemis*.ts`, `app/api/*/route.ts`, `types/artemis.ts`, `utils/{apiClient,openaiClient,googleSheets,helpers}.ts`, `components/steps/*`.
