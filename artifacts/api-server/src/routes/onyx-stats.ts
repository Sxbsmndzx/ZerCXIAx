import { Router, type IRouter } from "express";
import { eq, count, and, gte } from "drizzle-orm";
import { db, onyxConversationsTable, onyxMessagesTable, onyxSavedPromptsTable } from "@workspace/db";
import { activeSessions } from "./onyx-auth";

const router: IRouter = Router();

function getUserId(req: Parameters<Parameters<typeof router.get>[1]>[0]): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return activeSessions.get(token) ?? null;
}

router.get("/stats/overview", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalConvs] = await db.select({ count: count() })
    .from(onyxConversationsTable)
    .where(eq(onyxConversationsTable.userId, userId));

  const [totalMsgs] = await db.select({ count: count() })
    .from(onyxMessagesTable)
    .leftJoin(onyxConversationsTable, eq(onyxMessagesTable.conversationId, onyxConversationsTable.id))
    .where(eq(onyxConversationsTable.userId, userId));

  const [savedPrompts] = await db.select({ count: count() })
    .from(onyxSavedPromptsTable)
    .where(eq(onyxSavedPromptsTable.userId, userId));

  const [todayConvs] = await db.select({ count: count() })
    .from(onyxConversationsTable)
    .where(and(
      eq(onyxConversationsTable.userId, userId),
      gte(onyxConversationsTable.createdAt, startOfDay),
    ));

  res.json({
    totalConversations: Number(totalConvs?.count ?? 0),
    totalMessages: Number(totalMsgs?.count ?? 0),
    savedPrompts: Number(savedPrompts?.count ?? 0),
    conversationsToday: Number(todayConvs?.count ?? 0),
  });
});

export default router;
