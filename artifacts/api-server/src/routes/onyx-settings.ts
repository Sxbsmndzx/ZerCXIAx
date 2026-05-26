import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, onyxUserSettingsTable } from "@workspace/db";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { getUserIdFromRequest } from "../lib/session";

const router: IRouter = Router();

function settingsToResponse(s: typeof onyxUserSettingsTable.$inferSelect) {
  return {
    theme: s.theme,
    accentColor: s.accentColor,
    language: s.language,
    voiceModeEnabled: s.voiceModeEnabled,
    dataTrainingEnabled: s.dataTrainingEnabled,
  };
}

router.get("/settings", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const [settings] = await db.select().from(onyxUserSettingsTable)
    .where(eq(onyxUserSettingsTable.userId, userId));

  if (!settings) {
    const [created] = await db.insert(onyxUserSettingsTable).values({
      userId,
      theme: "system",
      accentColor: "187 100% 42%",
      language: "es",
      voiceModeEnabled: false,
      dataTrainingEnabled: true,
    }).returning();
    res.json(settingsToResponse(created));
    return;
  }

  res.json(settingsToResponse(settings));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Partial<typeof onyxUserSettingsTable.$inferInsert> = {};
  if (parsed.data.theme !== undefined) updateData.theme = parsed.data.theme;
  if (parsed.data.accentColor !== undefined) updateData.accentColor = parsed.data.accentColor;
  if (parsed.data.language !== undefined) updateData.language = parsed.data.language;
  if (parsed.data.voiceModeEnabled !== undefined) updateData.voiceModeEnabled = parsed.data.voiceModeEnabled;
  if (parsed.data.dataTrainingEnabled !== undefined) updateData.dataTrainingEnabled = parsed.data.dataTrainingEnabled;
  updateData.updatedAt = new Date();

  const [settings] = await db.update(onyxUserSettingsTable)
    .set(updateData)
    .where(eq(onyxUserSettingsTable.userId, userId))
    .returning();

  if (!settings) { res.status(404).json({ error: "Configuración no encontrada" }); return; }

  res.json(settingsToResponse(settings));
});

export default router;
