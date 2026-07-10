// TABLA DE REPORTES DE MENSAJES
// Guarda los reportes que los usuarios envían cuando una respuesta de ZerCX AI
// es incorrecta, inapropiada o tiene errores.
// Para ver todos los reportes: GET /api/reportes (requiere sesión iniciada)
import { integer, pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { onyxUsersTable } from "./onyx-users";

export const zercxReportesTable = pgTable("zercx_reportes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => onyxUsersTable.id, { onDelete: "cascade" }),
  // ID del mensaje reportado (puede ser null si el mensaje fue eliminado)
  mensajeId: integer("mensaje_id"),
  // Texto de la respuesta de la IA que se reportó
  contenido: text("contenido").notNull(),
  // Motivo del reporte escrito por el usuario
  motivo: text("motivo").notNull().default("No especificado"),
  // Si el administrador ya revisó el reporte
  revisado: boolean("revisado").notNull().default(false),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

export const insertZercxReporteSchema = createInsertSchema(zercxReportesTable).omit({
  id: true,
  creadoEn: true,
  revisado: true,
});

export type ZercxReporte = typeof zercxReportesTable.$inferSelect;
export type InsertZercxReporte = z.infer<typeof insertZercxReporteSchema>;
