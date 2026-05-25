import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { onyxUsersTable } from "./onyx-users";

export const onyxSavedPromptsTable = pgTable("onyx_saved_prompts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => onyxUsersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  icon: text("icon").notNull().default("bookmark"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOnyxSavedPromptSchema = createInsertSchema(onyxSavedPromptsTable).omit({
  id: true,
  createdAt: true,
});

export type OnyxSavedPrompt = typeof onyxSavedPromptsTable.$inferSelect;
export type InsertOnyxSavedPrompt = z.infer<typeof insertOnyxSavedPromptSchema>;
