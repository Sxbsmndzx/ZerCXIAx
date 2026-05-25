import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db, onyxUsersTable, onyxUserSettingsTable } from "@workspace/db";
import {
  RegisterUserBody,
  LoginUserBody,
  UpdateUserProfileBody,
} from "@workspace/api-zod";
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
    plan: user.plan,
    createdAt: user.createdAt.toISOString(),
  };
}

function generateToken(userId: number): string {
  return crypto.createHash("sha256").update(`${userId}:${Date.now()}:onyx_secret`).digest("hex");
}

const activeSessions = new Map<string, number>();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, name } = parsed.data;

  const existing = await db.select().from(onyxUsersTable).where(eq(onyxUsersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "El correo electrónico ya está registrado" });
    return;
  }

  const passwordHash = hashPassword(password);
  const avatarInitials = name.slice(0, 2).toUpperCase();

  const [user] = await db.insert(onyxUsersTable).values({
    email,
    passwordHash,
    name,
    avatarInitials,
    plan: "free",
  }).returning();

  await db.insert(onyxUserSettingsTable).values({
    userId: user.id,
    theme: "system",
    accentColor: "cyan",
    language: "es",
    voiceModeEnabled: false,
    dataTrainingEnabled: true,
  });

  const token = generateToken(user.id);
  activeSessions.set(token, user.id);

  req.log.info({ userId: user.id }, "User registered");
  res.status(201).json({ user: userToResponse(user), token });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const passwordHash = hashPassword(password);

  const [user] = await db.select().from(onyxUsersTable)
    .where(eq(onyxUsersTable.email, email));

  if (!user || user.passwordHash !== passwordHash) {
    res.status(401).json({ error: "Credenciales inválidas" });
    return;
  }

  const token = generateToken(user.id);
  activeSessions.set(token, user.id);

  req.log.info({ userId: user.id }, "User logged in");
  res.json({ user: userToResponse(user), token });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    activeSessions.delete(token);
  }
  res.json({ success: true, message: "Sesión cerrada" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const token = authHeader.slice(7);
  const userId = activeSessions.get(token);
  if (!userId) {
    res.status(401).json({ error: "Token inválido o expirado" });
    return;
  }

  const [user] = await db.select().from(onyxUsersTable).where(eq(onyxUsersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "Usuario no encontrado" });
    return;
  }

  res.json(userToResponse(user));
});

router.patch("/auth/me/profile", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const token = authHeader.slice(7);
  const userId = activeSessions.get(token);
  if (!userId) {
    res.status(401).json({ error: "Token inválido" });
    return;
  }

  const parsed = UpdateUserProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof onyxUsersTable.$inferInsert> = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.avatarInitials) updateData.avatarInitials = parsed.data.avatarInitials;

  const [user] = await db.update(onyxUsersTable)
    .set(updateData)
    .where(eq(onyxUsersTable.id, userId))
    .returning();

  res.json(userToResponse(user));
});

export { activeSessions };
export default router;
