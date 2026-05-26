import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db, onyxUsersTable, onyxUserSettingsTable } from "@workspace/db";
import {
  RegisterUserBody,
  LoginUserBody,
  UpdateUserProfileBody,
} from "@workspace/api-zod";
import { getUserIdFromRequest, createSession, deleteSession } from "../lib/session";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "onyx_salt_2024").digest("hex");
}

function userToResponse(user: typeof onyxUsersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarInitials: user.avatarInitials || user.name.slice(0, 2).toUpperCase(),
    avatarUrl: user.avatarUrl ?? null,
    plan: user.plan,
    createdAt: user.createdAt.toISOString(),
  };
}

function generateToken(userId: number): string {
  return crypto.randomBytes(32).toString("hex") + userId.toString(36);
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { email, password, name } = parsed.data;
  const existing = await db.select().from(onyxUsersTable).where(eq(onyxUsersTable.email, email));
  if (existing.length > 0) { res.status(409).json({ error: "El correo electrónico ya está registrado" }); return; }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(onyxUsersTable).values({
    email, passwordHash, name,
    avatarInitials: name.slice(0, 2).toUpperCase(),
    plan: "free",
  }).returning();

  await db.insert(onyxUserSettingsTable).values({
    userId: user.id,
    theme: "system",
    accentColor: "187 100% 42%",
    language: "es",
    voiceModeEnabled: false,
    dataTrainingEnabled: true,
  });

  const token = generateToken(user.id);
  await createSession(token, user.id);
  req.log.info({ userId: user.id }, "User registered");
  res.status(201).json({ user: userToResponse(user), token });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(onyxUsersTable).where(eq(onyxUsersTable.email, email));
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Credenciales inválidas" }); return;
  }

  const token = generateToken(user.id);
  await createSession(token, user.id);
  req.log.info({ userId: user.id }, "User logged in");
  res.json({ user: userToResponse(user), token });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    await deleteSession(authHeader.slice(7));
  }
  res.json({ success: true });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }
  const [user] = await db.select().from(onyxUsersTable).where(eq(onyxUsersTable.id, userId));
  if (!user) { res.status(401).json({ error: "Usuario no encontrado" }); return; }
  res.json(userToResponse(user));
});

router.patch("/auth/me/profile", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const parsed = UpdateUserProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Partial<typeof onyxUsersTable.$inferInsert> = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.avatarInitials) updateData.avatarInitials = parsed.data.avatarInitials;

  const [user] = await db.update(onyxUsersTable).set(updateData).where(eq(onyxUsersTable.id, userId)).returning();
  res.json(userToResponse(user));
});

router.post("/auth/me/avatar", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const { avatarUrl } = req.body as { avatarUrl?: string };
  if (!avatarUrl) { res.status(400).json({ error: "Se requiere avatarUrl" }); return; }

  if (!avatarUrl.startsWith("data:image/")) {
    res.status(400).json({ error: "Formato de imagen inválido" }); return;
  }

  if (avatarUrl.length > 2_800_000) {
    res.status(400).json({ error: "La imagen es demasiado grande (máx. 2MB)" }); return;
  }

  const [user] = await db.update(onyxUsersTable)
    .set({ avatarUrl })
    .where(eq(onyxUsersTable.id, userId))
    .returning();

  req.log.info({ userId }, "Avatar updated");
  res.json(userToResponse(user));
});

router.delete("/auth/me/avatar", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const [user] = await db.update(onyxUsersTable)
    .set({ avatarUrl: null })
    .where(eq(onyxUsersTable.id, userId))
    .returning();

  res.json(userToResponse(user));
});

router.post("/auth/change-password", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Se requieren la contraseña actual y la nueva" }); return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }); return;
  }

  const [user] = await db.select().from(onyxUsersTable).where(eq(onyxUsersTable.id, userId));
  if (!user || user.passwordHash !== hashPassword(currentPassword)) {
    res.status(401).json({ error: "La contraseña actual es incorrecta" }); return;
  }

  await db.update(onyxUsersTable).set({ passwordHash: hashPassword(newPassword) }).where(eq(onyxUsersTable.id, userId));
  req.log.info({ userId }, "Password changed");
  res.json({ success: true });
});

export default router;
