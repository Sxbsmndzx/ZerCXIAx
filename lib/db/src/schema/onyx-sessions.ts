import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { onyxUsersTable } from "./onyx-users";

export const onyxSessionsTable = pgTable("onyx_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer("user_id").notNull().references(() => onyxUsersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (t) => [
  index("onyx_sessions_token_idx").on(t.token),
  index("onyx_sessions_user_id_idx").on(t.userId),
]);
