import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { onyxUsersTable } from "./onyx-users";

export const onyxConversationsTable = pgTable("onyx_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => onyxUsersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOnyxConversationSchema = createInsertSchema(onyxConversationsTable).omit({
  id: true,
  createdAt: true,
});

export type OnyxConversation = typeof onyxConversationsTable.$inferSelect;
export type InsertOnyxConversation = z.infer<typeof insertOnyxConversationSchema>;
