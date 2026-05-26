import { Router, type IRouter } from "express";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { db, onyxConversationsTable, onyxMessagesTable } from "@workspace/db";
import {
  CreateConversationBody,
  UpdateConversationBody,
  GetConversationParams,
  UpdateConversationParams,
  DeleteConversationParams,
} from "@workspace/api-zod";
import { getUserIdFromRequest } from "../lib/session";

const router: IRouter = Router();

router.get("/conversations", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const convs = await db
    .select({
      id: onyxConversationsTable.id,
      title: onyxConversationsTable.title,
      lastMessageAt: onyxConversationsTable.lastMessageAt,
      createdAt: onyxConversationsTable.createdAt,
      messageCount: count(onyxMessagesTable.id),
    })
    .from(onyxConversationsTable)
    .leftJoin(onyxMessagesTable, eq(onyxMessagesTable.conversationId, onyxConversationsTable.id))
    .where(eq(onyxConversationsTable.userId, userId))
    .groupBy(onyxConversationsTable.id)
    .orderBy(desc(sql`COALESCE(${onyxConversationsTable.lastMessageAt}, ${onyxConversationsTable.createdAt})`));

  // Get last assistant message preview per conversation
  const previewMap = new Map<number, string>();
  for (const conv of convs) {
    const [lastMsg] = await db
      .select({ content: onyxMessagesTable.content })
      .from(onyxMessagesTable)
      .where(and(
        eq(onyxMessagesTable.conversationId, conv.id),
        eq(onyxMessagesTable.role, "assistant")
      ))
      .orderBy(desc(onyxMessagesTable.createdAt))
      .limit(1);
    if (lastMsg) previewMap.set(conv.id, lastMsg.content.substring(0, 80));
  }

  const result = convs.map(c => ({
    id: c.id,
    title: c.title,
    lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
    lastMessagePreview: previewMap.get(c.id) ?? null,
    messageCount: Number(c.messageCount),
    createdAt: c.createdAt.toISOString(),
  }));

  res.json(result);
});

router.post("/conversations", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const parsed = CreateConversationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [conv] = await db.insert(onyxConversationsTable).values({
    userId,
    title: parsed.data.title,
  }).returning();

  res.status(201).json({
    id: conv.id,
    title: conv.title,
    lastMessageAt: null,
    lastMessagePreview: null,
    messageCount: 0,
    createdAt: conv.createdAt.toISOString(),
  });
});

router.get("/conversations/:conversationId", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const parsed = GetConversationParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [conv] = await db.select().from(onyxConversationsTable)
    .where(and(eq(onyxConversationsTable.id, parsed.data.conversationId), eq(onyxConversationsTable.userId, userId)));

  if (!conv) { res.status(404).json({ error: "Conversación no encontrada" }); return; }

  const messages = await db.select().from(onyxMessagesTable)
    .where(eq(onyxMessagesTable.conversationId, conv.id))
    .orderBy(onyxMessagesTable.createdAt);

  res.json({
    id: conv.id,
    title: conv.title,
    lastMessageAt: conv.lastMessageAt?.toISOString() ?? null,
    lastMessagePreview: null,
    messageCount: messages.length,
    createdAt: conv.createdAt.toISOString(),
    messages: messages.map(m => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  });
});

router.patch("/conversations/:conversationId", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const params = UpdateConversationParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateConversationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [conv] = await db.update(onyxConversationsTable)
    .set({ title: parsed.data.title })
    .where(and(eq(onyxConversationsTable.id, params.data.conversationId), eq(onyxConversationsTable.userId, userId)))
    .returning();

  if (!conv) { res.status(404).json({ error: "Conversación no encontrada" }); return; }
  res.json({ id: conv.id, title: conv.title, lastMessageAt: conv.lastMessageAt?.toISOString() ?? null, lastMessagePreview: null, messageCount: 0, createdAt: conv.createdAt.toISOString() });
});

router.delete("/conversations/:conversationId", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const parsed = DeleteConversationParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  await db.delete(onyxConversationsTable)
    .where(and(eq(onyxConversationsTable.id, parsed.data.conversationId), eq(onyxConversationsTable.userId, userId)));

  res.json({ success: true });
});

export default router;
