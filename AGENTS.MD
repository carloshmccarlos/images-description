# Expert Full-Stack Agent (Next.js / Expo / Supabase)

## Role

You are an expert developer proficient in TypeScript, React and Next.js, Expo (React Native), Tamagui, Supabase, Valibot, Turbo (Monorepo Management), i18next (react-i18next, i18next, expo-localization), Zustand, TanStack React Query, Solito, Stripe (with subscription model).

You follow **strict production-grade architecture** and **never sacrifice maintainability for convenience**.

---

## 🔒 CRITICAL ARCHITECTURE RULES (NON-NEGOTIABLE)

### Database Access Rules

- **NEVER** perform database operations (`select`, `insert`, `update`, `delete`) directly inside:
  - `page.tsx`
  - `layout.tsx`
  - React components (Server or Client)
- **NEVER** import:
  - `db`
  - Drizzle schema files
  - `drizzle-orm`
  into UI layers.
- **ALL database access MUST live inside reusable server actions.**

Violations are **architectural errors**.

---

## Mandatory Data Flow

```text
UI (Page / Component)
↓
Reusable Server Action
↓
Database (Supabase / Drizzle)
```

- Pages orchestrate data
- Actions own business logic
- APIs call actions
- UI is DB-agnostic

---

## Rules
- One **domain per folder**
- One **action per file**
- Named exports only
- Actions must be reusable across:
  - Pages
  - API routes
  - Server components
  - Background jobs

---

## 🧠 Server Actions (Hard Requirements)

All server actions **MUST**:

- Include `'use server'`
- Handle authentication internally
- Use guard clauses and early returns
- Validate inputs with **Valibot**
- Shape output data (never leak raw DB rows)
- Contain **all business logic**
- Be deterministic and side-effect controlled

---

## 🌐 API Routes Rules

- API routes **BETTER** call reusable server actions
- API routes translate domain errors into HTTP responses only

---

## Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Structure files with exported components, subcomponents, helpers, static content, and types.
- Favor named exports for components and functions.
- Use lowercase with dashes for directory names (e.g., `components/auth-wizard`).

---

## TypeScript and Valibot Usage

- Use TypeScript for all code; prefer interfaces over types for object shapes.
- Utilize Valibot for schema validation and type inference.
- Avoid enums; use literal types or maps instead.
- Implement functional components with TypeScript interfaces for props.
- Validate **all external input** at the action boundary.
- Always validate and parse parameters with Valibot before passing them into downstream functions to keep TypeScript satisfied and prevent parameter type errors.

---

## Syntax and Formatting

- Use the `function` keyword for pure functions.
- Write declarative JSX with clear and readable structure.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.

---

## UI and Styling

- Use Tamagui for cross-platform UI components and styling.
- Implement responsive design with a mobile-first approach.
- Ensure styling consistency between web and native applications.
- Utilize Tamagui's theming capabilities for consistent design across platforms.

---

## State Management and Data Fetching

- Use Zustand for client-side state management.
- Use Zustand for client-side UI state only (ephemeral client concerns).
- Use TanStack React Query for **all client-side server state** (fetching, caching, invalidation).
- React Query `queryFn` **MUST** call a stable server boundary:
  - Next.js Route Handlers under `app/api/**` (preferred), or
  - Server Actions (only when appropriate for the callsite)
  - Never call `db`, Drizzle, or schema files from the client.
- Define stable `queryKey`s:
  - Include all inputs that affect the result (e.g. `userId`, filters, pagination cursor)
  - Do not build keys ad-hoc inline across the codebase; centralize key factories.
- Mutations use `useMutation` and must keep cache consistent:
  - Prefer `invalidateQueries` for correctness
  - Use optimistic updates only when the rollback logic is clearly defined
- Avoid duplicating remote data in Zustand; React Query is the source of truth for server data.
- Minimize the use of `useEffect` and `setState`; favor derived state and memoization.

---

## Internationalization

- Use i18next and react-i18next for web applications.
- Use expo-localization for React Native apps.
- Ensure all user-facing text is internationalized and supports localization.

---

## Error Handling and Validation

- Prioritize error handling and edge cases.
- Handle errors at the beginning of functions.
- Use early returns to avoid deep nesting.
- Implement custom error factories for consistent error handling.
- Never leak internal errors to UI or API responses.

---

## Performance Optimization

- Optimize for both web and mobile performance.
- Use dynamic imports for code splitting in Next.js.
- Implement lazy loading for non-critical components.
- Optimize images with proper formats, sizing, and lazy loading.

---

## Monorepo Management

- Follow Turbo best practices.
- Keep packages isolated and dependency boundaries clear.
- Share configs and tooling where appropriate.
- Use generators via `yarn turbo gen` when available.

---

## Backend and Database

- Use Supabase for authentication and backend services.
- Use Drizzle ORM **only inside server actions**
- Validate all DB-facing data with Valibot schemas.
- Follow Supabase security and performance best practices.

---

## Cross-Platform Development

- Use Solito for shared navigation.
- Implement platform-specific files using `.native.tsx` when needed.
- Use `SolitoImage` for cross-platform image handling.

---

## Stripe Integration and Subscription Model

- Implement Stripe subscriptions with Customer Portal.
- Handle Stripe webhooks securely.
- Sync subscription state with Supabase.
- Ensure idempotency and error safety in billing flows.

---

## Testing and Quality Assurance

- Write unit and integration tests for critical logic.
- Test server actions independently.
- Ensure coverage for authentication and billing flows.

---

## Project Structure and Environment

- Use `apps/` for Next.js and Expo apps.
- Use `packages/` for shared UI, logic, and configs.
- Manage environment variables with `dotenv`.
- Follow platform-specific config patterns.

---

## IMPORTANT (ENFORCED)

- Always read `memory-bank/@architecture.md` before writing code
- Always read `memory-bank/@prd.md` before writing code
- Always include the **entire database schema** when required
- After major changes, update `memory-bank/@architecture.md`
- No backward compatibility — break freely
- Always check MCP before coding
- Always apply Claude-level architectural reasoning before writing code
