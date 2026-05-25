# Onyx AI

Una app web de inteligencia artificial (estilo ChatGPT) con diseño oscuro premium, acento cian, totalmente en español. Funciona en celular y computadora.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/onyx-ai run dev` — run the frontend (port 25387)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `OPENAI_API_KEY` — OpenAI API key for AI responses

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + wouter routing
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: OpenAI (gpt-4o-mini) via OPENAI_API_KEY
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/onyx-users.ts` — Users table
- `lib/db/src/schema/onyx-conversations.ts` — Conversations table
- `lib/db/src/schema/onyx-messages.ts` — Messages table
- `lib/db/src/schema/onyx-user-settings.ts` — User settings table
- `lib/db/src/schema/onyx-saved-prompts.ts` — Saved prompts table
- `artifacts/api-server/src/routes/onyx-auth.ts` — Auth routes (register, login, logout, me)
- `artifacts/api-server/src/routes/onyx-conversations.ts` — Conversation CRUD
- `artifacts/api-server/src/routes/onyx-messages.ts` — Message sending + AI response
- `artifacts/api-server/src/routes/onyx-settings.ts` — User settings
- `artifacts/api-server/src/routes/onyx-saved-prompts.ts` — Saved prompts
- `artifacts/api-server/src/routes/onyx-stats.ts` — Stats overview
- `artifacts/onyx-ai/src/contexts/AuthContext.tsx` — Auth state management
- `artifacts/onyx-ai/src/contexts/ThemeContext.tsx` — Theme + accent color
- `artifacts/onyx-ai/src/pages/LoginPage.tsx` — Login
- `artifacts/onyx-ai/src/pages/RegisterPage.tsx` — Register
- `artifacts/onyx-ai/src/pages/ChatPage.tsx` — Main chat with sidebar
- `artifacts/onyx-ai/src/pages/ConversationPage.tsx` — Active conversation thread
- `artifacts/onyx-ai/src/pages/HistoryPage.tsx` — Chat history
- `artifacts/onyx-ai/src/pages/SettingsPage.tsx` — Settings (tema, color, idioma, etc.)
- `artifacts/onyx-ai/src/pages/ProfilePage.tsx` — User profile

## Architecture decisions

- Auth is token-based (stored in localStorage as "onyx_token"), sessions held in-memory in `activeSessions` Map on the server. Simple and stateless for the first build.
- AI uses `gpt-4o-mini` via direct OpenAI SDK — no streaming for now, full response returned at once.
- Theme system uses CSS variable overrides + class on `document.documentElement` for dark/light mode.
- Accent color stored in user settings on the server, applied as CSS variable `--accent-color` override on the client.
- All route files are named with the `onyx-` prefix for easy identification.

## Product

- Login / Registro de usuarios
- Chat con IA (powered by OpenAI gpt-4o-mini)
- Historial de conversaciones por fecha
- Prompts guardados
- Configuración: tema (claro/oscuro/sistema), color de acento, idioma, modo de voz, controles de datos
- Perfil de usuario editable
- Diseño responsivo — celular y computadora

## User preferences

- Nombres de archivos específicos y descriptivos con prefijo `onyx-` en el backend
- Interfaz completamente en español
- Todo funcional — sin datos mock ni placeholders

## Gotchas

- `activeSessions` Map se limpia al reiniciar el servidor — los usuarios deben volver a iniciar sesión
- El modelo de OpenAI es `gpt-4o-mini` (no el más nuevo) — cambiar en `onyx-messages.ts` si se desea
- Para cambiar la base URL de OpenAI, modificar `lib/integrations-openai-ai-server/src/client.ts`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
