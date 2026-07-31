# Repository Guidelines

## Project Structure & Module Organization

Providers and routing are in `src/app/`, HTTP infrastructure is in `src/api/`,
and shared components are in
`src/components/`. Resource domain rules live in
`src/features/resources/domain/`; API contracts, pages, forms, hooks, and state
remain grouped by responsibility in the same feature. Test suites live in local
`__tests__/` directories. Shared fixtures and MSW setup are in `src/test/`.
`src/design-system/` must not be modified.

The Express and MongoDB backend is in `backend/`. This
assignment permits frontend changes only; do not change its contracts or source.

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
Prettier and ESLint. Components use PascalCase. Co-locate components with multiple
implementation files in same-named directories (`ResourceFilters/`); pair UI
files with `Component.styles.ts`. Keep style-free, single-file components flat.
Prefix hooks with `use`; use camelCase elsewhere. Keep feature code inside its
feature and avoid barrel files that hide dependency direction.

## Testing Guidelines

Use Vitest, Testing Library, and MSW. Place `*.test.ts` and `*.test.tsx` in the
nearest `__tests__/` directory (for example, `pages/__tests__/`). Assert
observable behavior and API requests rather than component internals. Global
minimum coverage is 80% for statements, lines, and functions and 75% for
branches. Run `npm run check` before submission.

## Commit & Pull Request Guidelines

The short Git history does not establish a message convention. Use focused
Conventional Commits such as `feat: implement resource workflow`,
`test: cover completed edit conflicts`, and `build: containerize frontend`.
Pull requests should summarize behavior, list validation commands, link relevant
issues, and include screenshots for visible UI changes. Never commit secrets;
`VITE_` variables are public browser configuration. Do not commit `dist/`,
`coverage/`, local environment files, or `node_modules/`.
