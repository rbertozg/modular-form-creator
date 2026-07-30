# Modular Form Creator

Resources Management application for creating resources, completing their
required modules, and moving them through the `draft` → `completed` lifecycle.

## Features

- Paginated resource list with search, status filtering, and sorting.
- Resource creation and deletion with confirmation.
- Basic Info and Project Details module forms.
- Project Details locked until Basic Info is complete for draft resources.
- Provisioning available only after both modules are complete.
- Summary view for all resource data.
- In-memory edit buffer for completed resources.
- Aggregated unsaved-change panel and per-resource indicators.
- Navigation warning for edits that have not yet been saved or buffered.
- Transient success and local-save notifications.
- Runtime validation of backend resource responses.
- Accessible loading, empty, error, and confirmation states.

## Technology

- React 19, TypeScript, Vite, and React Router
- styled-components and the repository design system
- TanStack Query for server state
- React Hook Form and Zod for forms and validation
- Sonner for non-critical transient notifications
- Vitest, Testing Library, and MSW for automated tests
- Express, MongoDB, Docker Compose, and Nginx

## Prerequisites

- Node.js 24.x and npm
- Docker with Docker Compose

## Run the Full Stack with Docker

Build and start the frontend, backend, and MongoDB:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Resources page: `http://localhost:5173/resources`
- Backend API: `http://localhost:5001/api`
- Swagger UI: `http://localhost:5001/docs`
- MongoDB: `mongodb://localhost:27017`

The containerized frontend sends requests to `/api`. Nginx proxies those
requests to the backend service inside the Compose network, so no browser-side
Docker hostname or additional frontend environment file is needed.

Stop the stack while retaining MongoDB data:

```bash
docker compose down
```

Remove containers and the local MongoDB volume:

```bash
docker compose down --volumes
```

The latter command permanently removes local resource data.

## Local Frontend Development

Start only the backend and database in Docker:

```bash
docker compose up -d backend mongo
```

Install frontend dependencies and start Vite:

```bash
npm install
npm run dev
```

The frontend defaults to `http://localhost:5001/api`. To override it, copy
`.env.example` to `.env.local` and change:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Variables prefixed with `VITE_` are embedded in the browser bundle and must
never contain secrets.

## Available Commands

```bash
npm run dev             # Start the Vite development server
npm run typecheck       # Run TypeScript project checks
npm run lint            # Run ESLint
npm run test            # Run the Vitest suite
npm run test:coverage   # Run tests with enforced coverage thresholds
npm run build           # Type-check and create the production bundle
npm run preview         # Preview the production bundle locally
npm run storybook       # Start Storybook on port 6006
npm run check           # Run lint, coverage, and production build
```

Current coverage thresholds exclude bootstrap files, generated declarations,
styles, stories, and the immutable design system:

- Statements, lines, and functions: 80%
- Branches: 75%

## Application Routes

- `/resources` — list, create, filter, and delete resources.
- `/resources/:resourceId` — module progress and resource actions.
- `/resources/:resourceId/basic-info` — Basic Info form.
- `/resources/:resourceId/project-details` — Project Details form.
- `/resources/:resourceId/details` — combined summary.

## Resource Lifecycle

Draft module submissions are persisted immediately through their dedicated
`PATCH` endpoints. Project Details remains unavailable until Basic Info is
complete. Provisioning is the only action that changes a draft resource to
completed.

For completed resources, module edits are stored only in React memory. They
survive navigation inside the current application session but are lost after a
refresh or browser close. `Submit all changes` persists both modules in one
explicit `PUT`; `Discard changes` restores the current server state.

Leaving a module with fields that have not yet been saved or copied to the
completed-resource buffer requires confirmation. Once completed edits are in
the buffer, normal SPA navigation remains available because those changes are
still present in the current session.

Resource names are immutable after creation. Outgoing Basic Info and full
update payloads restore both name fields from the authoritative resource, even
if a readonly form control was manipulated. Client validation mirrors the
backend contract, and resource responses are additionally checked with
dedicated runtime schemas before entering the query cache.

Mutations remain pessimistic. If a transport, `5xx`, or invalid-response
failure leaves the outcome uncertain, the UI verifies authoritative server
state before reporting success: provisioning requires a completed resource,
DELETE requires a `404`, and a completed-resource `PUT` requires matching
business data. Unconfirmed form values and completed buffers are preserved.
For an uncertain draft-module `PATCH`, the form remains dirty and the cached
detail is marked stale without replacing the entered values; retrying the same
module payload is intentionally safe and idempotent.

## Project Structure

```text
src/
├── api/                         # Generic HTTP client and error mapping
├── app/                         # Providers and route configuration
├── components/                  # Application-level shared components
├── design-system/               # Provided immutable component library
├── features/resources/          # Resource API, hooks, pages, forms, and tests
├── layouts/                     # Application shell
└── test/                        # Test setup, fixtures, and render helpers
```

Backend documentation and the exact endpoint contract are available in
`backend/README.md`.
