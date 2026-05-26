import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, onyxSavedPromptsTable } from "@workspace/db";
import { CreateSavedPromptBody, DeleteSavedPromptParams } from "@workspace/api-zod";
import { getUserIdFromRequest } from "../lib/session";

const router: IRouter = Router();

router.get("/saved-prompts", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const prompts = await db.select().from(onyxSavedPromptsTable)
    .where(eq(onyxSavedPromptsTable.userId, userId))
    .orderBy(desc(onyxSavedPromptsTable.createdAt));

  res.json(prompts.map(p => ({
    id: p.id,
    title: p.title,
    content: p.content,
    icon: p.icon,
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/saved-prompts", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const parsed = CreateSavedPromptBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [prompt] = await db.insert(onyxSavedPromptsTable).values({
    userId,
    title: parsed.data.title,
    content: parsed.data.content,
    icon: parsed.data.icon ?? "bookmark",
  }).returning();

  res.status(201).json({
    id: prompt.id,
    title: prompt.title,
    content: prompt.content,
    icon: prompt.icon,
    createdAt: prompt.createdAt.toISOString(),
  });
});

router.delete("/saved-prompts/:promptId", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const params = DeleteSavedPromptParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [deleted] = await db.delete(onyxSavedPromptsTable)
    .where(and(eq(onyxSavedPromptsTable.id, params.data.promptId), eq(onyxSavedPromptsTable.userId, userId)))
    .returning();

  if (!deleted) { res.status(404).json({ error: "Prompt no encontrado" }); return; }

  res.json({ success: true, message: "Prompt eliminado" });
});

export default router;
