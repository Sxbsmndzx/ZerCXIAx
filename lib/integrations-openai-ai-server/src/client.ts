import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY must be set.");
}

const apiKey = process.env.OPENAI_API_KEY;
const isOpenRouter = apiKey.startsWith("sk-or-");

export const openai = new OpenAI({
  apiKey,
  baseURL: isOpenRouter ? "https://openrouter.ai/api/v1" : undefined,
  defaultHeaders: isOpenRouter
    ? {
        "HTTP-Referer": "https://onyx-ai.replit.app",
        "X-Title": "Onyx AI",
      }
    : undefined,
});

export const AI_MODEL = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";
