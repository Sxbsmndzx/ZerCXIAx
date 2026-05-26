import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, onyxConversationsTable, onyxMessagesTable, onyxUserSettingsTable } from "@workspace/db";
import { SendMessageBody, SendMessageParams } from "@workspace/api-zod";
import { openai, AI_MODEL } from "@workspace/integrations-openai-ai-server";
import { getUserIdFromRequest } from "../lib/session";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  es: "DEBES responder SIEMPRE en español, sin excepción. Nunca respondas en otro idioma.",
  en: "You MUST respond ONLY in English, without exception. Never respond in Spanish or any other language, even if the user writes in another language.",
  pt: "VOCÊ DEVE responder SEMPRE em português, sem exceção. Nunca responda em outro idioma.",
  fr: "Vous DEVEZ répondre TOUJOURS en français, sans exception. Ne répondez jamais dans une autre langue.",
  de: "Sie MÜSSEN IMMER auf Deutsch antworten, ohne Ausnahme. Antworten Sie niemals in einer anderen Sprache.",
};

router.post("/conversations/:conversationId/messages", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [conv] = await db.select().from(onyxConversationsTable)
    .where(and(eq(onyxConversationsTable.id, params.data.conversationId), eq(onyxConversationsTable.userId, userId)));

  if (!conv) { res.status(404).json({ error: "Conversación no encontrada" }); return; }

  const [userSettings] = await db.select().from(onyxUserSettingsTable)
    .where(eq(onyxUserSettingsTable.userId, userId));

  const langCode = userSettings?.language ?? "es";
  const langInstruction = LANGUAGE_INSTRUCTIONS[langCode] ?? LANGUAGE_INSTRUCTIONS.es;

  const previousMessages = await db.select().from(onyxMessagesTable)
    .where(eq(onyxMessagesTable.conversationId, conv.id))
    .orderBy(onyxMessagesTable.createdAt);

  const [userMsg] = await db.insert(onyxMessagesTable).values({
    conversationId: conv.id,
    role: "user",
    content: parsed.data.content,
  }).returning();

  const chatMessages = [
    {
      role: "system" as const,
      content: `Eres Onyx, un asistente de inteligencia artificial avanzado, inteligente y preciso. ${langInstruction} Sé conciso pero completo en tus respuestas.`,
    },
    ...previousMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: parsed.data.content },
  ];

  let aiContent = "";
  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      max_completion_tokens: 8192,
      messages: chatMessages,
    });
    aiContent = completion.choices[0]?.message?.content ?? "Lo siento, no pude generar una respuesta.";
  } catch (err) {
    logger.error({ err }, "OpenAI API error");
    aiContent = "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.";
  }

  const [assistantMsg] = await db.insert(onyxMessagesTable).values({
    conversationId: conv.id,
    role: "assistant",
    content: aiContent,
  }).returning();

  await db.update(onyxConversationsTable)
    .set({ lastMessageAt: new Date() })
    .where(eq(onyxConversationsTable.id, conv.id));

  res.json({
    userMessage: {
      id: userMsg.id,
      conversationId: userMsg.conversationId,
      role: userMsg.role,
      content: userMsg.content,
      createdAt: userMsg.createdAt.toISOString(),
    },
    assistantMessage: {
      id: assistantMsg.id,
      conversationId: assistantMsg.conversationId,
      role: assistantMsg.role,
      content: assistantMsg.content,
      createdAt: assistantMsg.createdAt.toISOString(),
    },
  });
});

export default router;
