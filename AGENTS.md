# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

This is an Astro 7 site deployed with the Netlify adapter in server output mode. It combines:

- Public content pages and blog routes built with Astro.
- Preact islands for interactive UI.
- Admin screens under `src/pages/admin`.
- API routes under `src/pages/api`, including admin-only endpoints.
- PostgreSQL persistence through Drizzle ORM.
- Auth.js/Auth Astro for OAuth-backed user auth plus a separate custom JWT flow for admin APIs.
- Tailwind CSS v4 through the Vite plugin.

The current README is still the Astro starter README, so prefer this file and the source tree as the working project guide.

## Commands

Run commands from the repository root.

- `pnpm dev`: start the Astro dev server.
- `pnpm build`: production build into `dist/`.
- `pnpm preview`: preview the built output.
- `pnpm astro ...`: run Astro CLI commands.

There is no dedicated test, lint, or typecheck script in `package.json` at the moment. For validation, use `pnpm build` unless the task clearly needs a narrower command.

Database commands are configured through `drizzle.config.ts` and require `POSTGRESQL_URL` in the environment.

## Repository Layout

- `src/pages`: file-based Astro routes and API routes.
- `src/pages/api`: server endpoints. Admin endpoints normally verify bearer tokens before touching protected data.
- `src/pages/admin`: admin page shells that mount Preact admin components.
- `src/components`: Astro components and Preact components.
- `src/components/preact`: interactive front-end and admin components.
- `src/components/preact/ui`: reusable Preact UI primitives.
- `src/layouts`: Astro layouts for public pages, markdown pages, home pages, and admin pages.
- `src/blog`: markdown blog content loaded by `src/content.config.ts`.
- `src/db/schema.ts`: Drizzle schema, relations, PostgreSQL client, and exported `db`.
- `src/db/schema.d.ts`: shared TypeScript model declarations used by UI code.
- `src/styles`: global and admin CSS.
- `public`: static public assets.

## Coding Conventions

- Keep TypeScript strict-compatible. The repo extends `astro/tsconfigs/strict`.
- Use existing aliases instead of long relative paths when practical:
  - `@/*` for `src/*`
  - `@db/*` for `src/db/*`
  - `@components/*` for `src/components/*`
  - `@layouts/*` for `src/layouts/*`
- Prefer Astro components for static page structure and Preact components only where interactivity is needed.
- Preact uses the React JSX runtime with `jsxImportSource: "preact"` and `@preact/compat` aliases for React packages.
- Follow the existing API route pattern: validate inputs, return JSON with explicit status codes and `Content-Type`, and catch auth `Response` errors separately when using `verifyAdminToken`.
- Use Zod for request/query validation when adding or changing API inputs.
- Do not introduce a second styling system. Use Tailwind utilities and the existing CSS files.
- Keep comments useful and specific; avoid restating obvious code behavior.

## Database And Auth Notes

- `src/db/schema.ts` creates a PostgreSQL client with `postgres(url, { max: 1 })` and exports Drizzle `db`.
- The code supports both `import.meta.env.POSTGRESQL_URL` and `process.env.POSTGRESQL_URL` because Drizzle Kit and Astro routes load env differently.
- Auth.js tables are defined in the same schema as application tables.
- Admin API calls use the custom JWT helpers in `src/utils/jwt.ts` and `src/pages/api/admin/JWT.ts`; preserve that contract unless the task is explicitly about auth redesign.
- Schema changes should be made in `src/db/schema.ts` and kept consistent with `src/db/schema.d.ts` when UI code depends on those types.
- Drizzle Kit output is configured for `./drizzle`, but this repository currently does not contain migration files.

## Frontend Notes

- Public pages usually compose layouts from `src/layouts` and components from `src/components`.
- Blog content comes from markdown files in `src/blog` with the schema in `src/content.config.ts`.
- Interactive public components live in `src/components/preact`.
- Admin UI lives in `src/components/preact/admin` and is mounted from `src/pages/admin`.
- Some UI uses GSAP animations. Keep animations scoped and avoid relying on fragile global selectors when adding new animated elements.
- The global public background and theme styles are in `src/styles/global.css`; admin styling is in `src/styles/backend.css`.

## UI Constraints

- UI work must use only the UI-related libraries already present in this project:
  - `tailwindcss`
  - `@tailwindcss/typography`
  - `tailwindcss-motion`
  - `@iconify-json/line-md`
  - `@iconify-json/mdi`
  - `@iconify-icon/react`
  - `@milkdown/kit`
  - `@milkdown/react`
  - `gsap`
- Do not add UI component libraries, CSS frameworks, icon packs, animation libraries, rich text editors, charting libraries, or canvas/3D libraries unless the user explicitly changes this constraint.
- Use Tailwind utilities and the existing CSS files for styling. Create local Astro/Preact components when reusable UI is needed.
- Use `astro-icon` or `@iconify-icon/react` with the installed Line MD and MDI icon sets for icons; do not introduce Lucide, Heroicons, Font Awesome, Radix UI, shadcn/ui, DaisyUI, Flowbite, Framer Motion, or similar packages.
- Use Milkdown only for markdown/rich text editing surfaces. Do not introduce another editor framework.
- Use Tailwind CSS, `@tailwindcss/typography`, and `tailwindcss-motion` for styling, prose content, and utility-level motion. Use GSAP only where imperative animation is needed and keep animation code scoped to the component or page being changed.
- Match the existing Astro/Preact/Tailwind structure before introducing new component patterns.
- Build actual usable screens and workflows. Do not replace app/admin pages with marketing-style landing pages.
- Keep admin and operational UI dense, predictable, and scannable. Avoid oversized hero sections, decorative card-heavy layouts, and promotional copy in admin screens.
- Do not put cards inside cards. Use cards for repeated items, modals, or framed tools only; page sections should be full-width bands or unframed constrained layouts.
- Keep card border radii at `8px` or less unless an existing component already uses a different radius.
- Prefer familiar icons for icon-only actions where an icon exists, and provide hover tooltips for unclear icon buttons.
- Use the right control for the job: toggles/checkboxes for binary settings, selects/menus for option sets, tabs for views, sliders/steppers/inputs for numeric values, and text buttons for explicit commands.
- Do not use visible helper text to explain obvious UI behavior, keyboard shortcuts, styling choices, or implementation details.
- Ensure text never overlaps other content and fits inside buttons, nav items, cards, tables, and compact panels at mobile and desktop widths.
- Do not scale font size directly with viewport width. Use responsive layout constraints instead.
- Define stable dimensions for fixed-format UI such as grids, boards, toolbars, counters, icon buttons, product tiles, and loading states so hover or dynamic content does not shift layout.
- Avoid one-note color palettes. Do not let the interface become dominated by only purple/blue gradients, beige/tan, dark slate, or brown/orange tones unless matching an established project style.
- Do not add decorative gradient orbs, bokeh blobs, or unrelated abstract background shapes.
- Websites and games should use meaningful visual assets when visuals are needed. Prefer real or generated bitmap assets over decorative SVG illustrations for product/place/person/object-focused pages.
- Do not add 3D/canvas libraries for UI work under the current dependency constraint.
- Before finishing substantial UI work, run the app locally when feasible and inspect the result at both mobile and desktop sizes.

## Safety Guidelines

- Do not edit generated/build output in `dist/`.
- Do not edit `node_modules/`.
- Do not commit secrets or hard-code credentials. Use environment variables for database and OAuth settings.
- Be careful around the dirty worktree. At the time this file was created, `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` already had uncommitted changes. Treat unrelated existing edits as user work.
- When changing API behavior, check both the endpoint and the consuming Preact component.
- When changing product/category/user data models, check Drizzle schema, TypeScript declarations, API routes, and admin forms together.

## Validation Checklist

Before finishing a code change, run the most relevant available validation:

- For general code changes: `pnpm build`.
- For route/UI changes: also run `pnpm dev` when a manual browser check is useful.
- For database changes: ensure `POSTGRESQL_URL` is set before running Drizzle-related commands.

If validation cannot be run because environment variables, PostgreSQL, or network access are unavailable, state that explicitly in the final response.
