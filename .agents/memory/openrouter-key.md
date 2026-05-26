---
name: OpenRouter API key detection
description: How to handle OpenRouter keys passed as OPENAI_API_KEY in the OpenAI client
---

The user's OPENAI_API_KEY starts with `sk-or-v1` — it's an OpenRouter key, not a native OpenAI key.

**Rule:** In `lib/integrations-openai-ai-server/src/client.ts`, detect the key prefix and set OpenRouter's base URL + required headers + correct model name.

```typescript
const isOpenRouter = apiKey.startsWith("sk-or-");
export const openai = new OpenAI({
  apiKey,
  baseURL: isOpenRouter ? "https://openrouter.ai/api/v1" : undefined,
  defaultHeaders: isOpenRouter ? { "HTTP-Referer": "...", "X-Title": "Onyx AI" } : undefined,
});
export const AI_MODEL = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";
```

**Why:** OpenRouter uses a different base URL and requires model names prefixed with provider (e.g. `openai/gpt-4o-mini` not `gpt-4o-mini`). Without these, the SDK throws AuthenticationError.

**How to apply:** Always import `AI_MODEL` from the integrations lib instead of hardcoding `"gpt-4o-mini"`.
