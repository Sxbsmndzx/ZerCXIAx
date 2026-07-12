import { supabase } from "./supabase";
import { db, onyxUsersTable, onyxUserSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export async function getUserIdFromRequest(
  req: { headers: { authorization?: string } }
): Promise<number | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || !user.email) return null;

  let [localUser] = await db
    .select()
    .from(onyxUsersTable)
    .where(eq(onyxUsersTable.email, user.email));

  if (!localUser) {
    const rawName =
      (user.user_metadata?.name as string | undefined) ||
      user.email.split("@")[0] ||
      "Usuario";
    const name = rawName.slice(0, 80);

    const [created] = await db
      .insert(onyxUsersTable)
      .values({
        email: user.email,
        passwordHash: "",
        name,
        avatarInitials: name.slice(0, 2).toUpperCase(),
        plan: "free",
      })
      .returning();

    localUser = created;

    await db.insert(onyxUserSettingsTable).values({
      userId: localUser.id,
      theme: "system",
      accentColor: "187 100% 42%",
      language: "es",
      voiceModeEnabled: false,
      dataTrainingEnabled: true,
    });

    logger.info({ userId: localUser.id, email: user.email }, "Auto-created local user from Supabase");
  }

  return localUser.id;
}

export async function createSession(_token: string, _userId: number): Promise<void> {}
export async function deleteSession(_token: string): Promise<void> {}
