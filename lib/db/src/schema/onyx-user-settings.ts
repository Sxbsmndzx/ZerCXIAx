import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { onyxUsersTable } from "./onyx-users";

export const onyxUserSettingsTable = pgTable("onyx_user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => onyxUsersTable.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("system"),
  accentColor: text("accent_color").notNull().default("cyan"),
  language: text("language").notNull().default("es"),
  voiceModeEnabled: boolean("voice_mode_enabled").notNull().default(false),
  dataTrainingEnabled: boolean("data_training_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOnyxUserSettingsSchema = createInsertSchema(onyxUserSettingsTable).omit({
  id: true,
  updatedAt: true,
});

export type OnyxUserSettings = typeof onyxUserSettingsTable.$inferSelect;
export type InsertOnyxUserSettings = z.infer<typeof insertOnyxUserSettingsSchema>;
