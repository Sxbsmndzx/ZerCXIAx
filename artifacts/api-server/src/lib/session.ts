import { db, onyxSessionsTable } from "@workspace/db";
import { eq, gt, and } from "drizzle-orm";

export async function getUserIdFromRequest(
  req: { headers: { authorization?: string } }
): Promise<number | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const [session] = await db
    .select({ userId: onyxSessionsTable.userId })
    .from(onyxSessionsTable)
    .where(
      and(
        eq(onyxSessionsTable.token, token),
        gt(onyxSessionsTable.expiresAt, new Date())
      )
    );
  return session?.userId ?? null;
}

export async function createSession(token: string, userId: number): Promise<void> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await db.insert(onyxSessionsTable).values({ token, userId, expiresAt });
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(onyxSessionsTable).where(eq(onyxSessionsTable.token, token));
}
