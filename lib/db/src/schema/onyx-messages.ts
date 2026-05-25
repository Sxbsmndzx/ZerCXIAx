import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { onyxConversationsTable } from "./onyx-conversations";

export const onyxMessagesTable = pgTable("onyx_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => onyxConversationsTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOnyxMessageSchema = createInsertSchema(onyxMessagesTable).omit({
  id: true,
  createdAt: true,
});

export type OnyxMessage = typeof onyxMessagesTable.$inferSelect;
export type InsertOnyxMessage = z.infer<typeof insertOnyxMessageSchema>;
