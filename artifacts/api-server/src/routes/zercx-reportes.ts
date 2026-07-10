// RUTA DE REPORTES
// Guarda los reportes de mensajes incorrectos de ZerCX AI en la base de datos.
// POST /api/reportes — guarda un nuevo reporte (requiere sesión)
// GET  /api/reportes — lista todos los reportes (para el admin en /admin)
import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, zercxReportesTable, onyxUsersTable } from "@workspace/db";
import { getUserIdFromRequest } from "../lib/session";

const router: IRouter = Router();

// Guarda un reporte nuevo
router.post("/reportes", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const { mensajeId, contenido, motivo } = req.body;
  if (!contenido) { res.status(400).json({ error: "El contenido del reporte es requerido" }); return; }

  const [reporte] = await db.insert(zercxReportesTable).values({
    userId,
    mensajeId: mensajeId ?? null,
    contenido,
    motivo: motivo ?? "No especificado",
  }).returning();

  res.json({ ok: true, id: reporte.id });
});

// Lista todos los reportes (solo usuarios autenticados pueden ver)
router.get("/reportes", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const reportes = await db
    .select({
      id: zercxReportesTable.id,
      userId: zercxReportesTable.userId,
      mensajeId: zercxReportesTable.mensajeId,
      contenido: zercxReportesTable.contenido,
      motivo: zercxReportesTable.motivo,
      revisado: zercxReportesTable.revisado,
      creadoEn: zercxReportesTable.creadoEn,
      nombreUsuario: onyxUsersTable.name,
      correoUsuario: onyxUsersTable.email,
    })
    .from(zercxReportesTable)
    .leftJoin(onyxUsersTable, eq(zercxReportesTable.userId, onyxUsersTable.id))
    .orderBy(desc(zercxReportesTable.creadoEn));

  res.json(reportes);
});

// Marca un reporte como revisado
router.patch("/reportes/:id/revisado", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const id = parseInt(req.params.id);
  await db.update(zercxReportesTable)
    .set({ revisado: true })
    .where(eq(zercxReportesTable.id, id));

  res.json({ ok: true });
});

export default router;
