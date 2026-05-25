---
name: OpenAI client setup
description: How the OpenAI client is wired in this project (direct API key, not Replit AI integrations).
---

The integration template ships with three client files that check for `AI_INTEGRATIONS_OPENAI_BASE_URL` / `AI_INTEGRATIONS_OPENAI_API_KEY`:
- `lib/integrations-openai-ai-server/src/client.ts`
- `lib/integrations-openai-ai-server/src/image/client.ts`
- `lib/integrations-openai-ai-server/src/audio/client.ts`

All three must be patched to use `process.env.OPENAI_API_KEY` directly (no baseURL override) because this project uses the user's own OpenAI key, not the Replit AI integrations proxy.

**Why:** The server crashes at startup if any of those files throws at module evaluation time — even if the route that uses audio/image is never called.

**How to apply:** Any time you add or regenerate the OpenAI integration lib, check all three client files and replace the env var guards.
