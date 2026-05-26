import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const onyxUsersTable = pgTable("onyx_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  avatarInitials: text("avatar_initials").notNull().default(""),
  avatarUrl: text("avatar_url"),
  plan: text("plan").notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOnyxUserSchema = createInsertSchema(onyxUsersTable).omit({
  id: true,
  createdAt: true,
});

export type OnyxUser = typeof onyxUsersTable.$inferSelect;
export type InsertOnyxUser = z.infer<typeof insertOnyxUserSchema>;
