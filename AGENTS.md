# Repository Guidelines

## Project Structure & Module Organization

The React frontend lives in `src/`. Providers and routing are in `src/app/`,
generic HTTP infrastructure is in `src/api/`, and shared application components
are in `src/components/`. Resource API contracts, queries, pages, forms, hooks,
state, and tests are grouped under `src/features/resources/`. Test fixtures and
MSW setup are in `src/test/`. `src/design-system/` is provided code and must not
be modified.

The Express and MongoDB backend is an independent package in `backend/`. This
assignment permits frontend changes only; do not change backend contracts or
backend source.

## Build, Test, and Development Commands

Run frontend commands from the repository root:

- `npm run dev` — start the Vite development server.
- `npm run format` — format the repository with Prettier.
- `npm run typecheck` — run TypeScript project checks.
- `npm run lint` — run ESLint.
- `npm run test` — execute Vitest once.
- `npm run test:watch` — run Vitest interactively.
- `npm run test:coverage` — run tests with enforced coverage thresholds.
- `npm run build` — type-check and create the production bundle.
- `npm run check` — run lint, coverage, and production build.
- `npm run storybook` / `npm run build-storybook` — serve or build Storybook.
- `docker compose up --build -d` — start frontend, backend, and MongoDB.

## Coding Style & Naming Conventions

Use TypeScript, two-space indentation, single quotes, and no semicolons. Follow
the repository Prettier and ESLint configuration. Components and component files
use PascalCase (`ResourceFilters.tsx`); hooks use a `use` prefix
(`useResourceListParams.ts`); other functions and variables use camelCase.
Keep feature-specific code inside its feature and avoid barrel files that hide
dependency direction.

## Testing Guidelines

Use Vitest, Testing Library, and MSW. Colocate `*.test.ts` and `*.test.tsx` with
the behavior under test. Assert observable behavior and API requests rather than
component internals. Global minimum coverage is 80% for statements, lines, and
functions and 75% for branches. Run `npm run check` before submission.

## Commit & Pull Request Guidelines

The short Git history does not establish a message convention. Use focused
Conventional Commits such as `feat: implement resource workflow`,
`test: cover completed edit conflicts`, and `build: containerize frontend`.
Pull requests should summarize behavior, list validation commands, link relevant
issues, and include screenshots for visible UI changes. Never commit secrets;
`VITE_` variables are public browser configuration. Do not commit `dist/`,
`coverage/`, local environment files, or `node_modules/`.
