import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, onyxConversationsTable, onyxMessagesTable, onyxUserSettingsTable } from "@workspace/db";
import { SendMessageBody, SendMessageParams } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { activeSessions } from "./onyx-auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getUserIdFromRequest(req: Parameters<Parameters<typeof router.post>[1]>[0]): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return activeSessions.get(token) ?? null;
}

const LANGUAGE_NAMES: Record<string, string> = {
  es: "español",
  en: "English",
  pt: "Portuguese (português)",
  fr: "French (français)",
  de: "German (Deutsch)",
};

router.post("/conversations/:conversationId/messages", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [conv] = await db.select().from(onyxConversationsTable)
    .where(and(eq(onyxConversationsTable.id, params.data.conversationId), eq(onyxConversationsTable.userId, userId)));

  if (!conv) { res.status(404).json({ error: "Conversación no encontrada" }); return; }

  // Get user language preference
  const [userSettings] = await db.select().from(onyxUserSettingsTable)
    .where(eq(onyxUserSettingsTable.userId, userId));
  const preferredLang = LANGUAGE_NAMES[userSettings?.language ?? "es"] ?? "español";

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
      content: `Eres Onyx, un asistente de inteligencia artificial avanzado. Eres inteligente, útil y preciso. El idioma preferido del usuario es ${preferredLang} — responde siempre en ese idioma a menos que el usuario escriba en otro idioma. Sé conciso pero completo en tus respuestas.`,
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
      model: "gpt-4o-mini",
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
