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
import { activeSessions } from "./onyx-auth";

const router: IRouter = Router();

function getUserIdFromRequest(req: Parameters<Parameters<typeof router.get>[1]>[0]): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return activeSessions.get(token) ?? null;
}

router.get("/conversations", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);
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

  const result = convs.map(c => ({
    id: c.id,
    title: c.title,
    lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
    messageCount: Number(c.messageCount),
    createdAt: c.createdAt.toISOString(),
  }));

  res.json(result);
});

router.post("/conversations", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);
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
    messageCount: 0,
    createdAt: conv.createdAt.toISOString(),
  });
});

router.get("/conversations/:conversationId", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const params = GetConversationParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [conv] = await db.select().from(onyxConversationsTable)
    .where(and(eq(onyxConversationsTable.id, params.data.conversationId), eq(onyxConversationsTable.userId, userId)));

  if (!conv) { res.status(404).json({ error: "Conversación no encontrada" }); return; }

  const msgs = await db.select().from(onyxMessagesTable)
    .where(eq(onyxMessagesTable.conversationId, conv.id))
    .orderBy(onyxMessagesTable.createdAt);

  res.json({
    id: conv.id,
    title: conv.title,
    messages: msgs.map(m => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
    createdAt: conv.createdAt.toISOString(),
  });
});

router.patch("/conversations/:conversationId", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);
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

  res.json({
    id: conv.id,
    title: conv.title,
    lastMessageAt: conv.lastMessageAt?.toISOString() ?? null,
    messageCount: 0,
    createdAt: conv.createdAt.toISOString(),
  });
});

router.delete("/conversations/:conversationId", async (req, res): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const params = DeleteConversationParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [conv] = await db.delete(onyxConversationsTable)
    .where(and(eq(onyxConversationsTable.id, params.data.conversationId), eq(onyxConversationsTable.userId, userId)))
    .returning();

  if (!conv) { res.status(404).json({ error: "Conversación no encontrada" }); return; }

  res.json({ success: true, message: "Conversación eliminada" });
});

export default router;
