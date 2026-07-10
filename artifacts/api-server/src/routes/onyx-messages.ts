// RUTA DE MENSAJES DE LA IA
// Maneja el envío de mensajes del usuario y la respuesta de ZerCX AI.
// También genera el título automático de la conversación en el primer mensaje,
// y extrae sugerencias de seguimiento del texto de la IA.
import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, onyxConversationsTable, onyxMessagesTable, onyxUserSettingsTable } from "@workspace/db";
import { SendMessageBody, SendMessageParams } from "@workspace/api-zod";
import { openai, AI_MODEL } from "@workspace/integrations-openai-ai-server";
import { getUserIdFromRequest } from "../lib/session";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Instrucción de idioma según la configuración del usuario
const INSTRUCCIONES_IDIOMA: Record<string, string> = {
  es: "DEBES responder SIEMPRE en español, sin excepción. Nunca respondas en otro idioma.",
  en: "You MUST respond ONLY in English, without exception. Never respond in another language.",
  pt: "VOCÊ DEVE responder SEMPRE em português, sem exceção. Nunca responda em outro idioma.",
  fr: "Vous DEVEZ répondre TOUJOURS en français, sans exception. Ne répondez jamais dans une autre langue.",
  de: "Sie MÜSSEN IMMER auf Deutsch antworten, ohne Ausnahme. Antworten Sie niemals in einer anderen Sprache.",
};

// Extrae las sugerencias del texto de la IA (formato: SUGERENCIAS: pregunta1 | pregunta2 | pregunta3)
function extraerSugerencias(texto: string): { contenido: string; sugerencias: string[] } {
  const lineas = texto.split("\n");
  const indiceSug = lineas.findIndex((l) => l.trim().startsWith("SUGERENCIAS:"));
  if (indiceSug === -1) return { contenido: texto, sugerencias: [] };

  const linea = lineas[indiceSug].replace("SUGERENCIAS:", "").trim();
  const sugerencias = linea
    .split(" | ")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  const contenido = lineas.slice(0, indiceSug).join("\n").trim();
  return { contenido, sugerencias };
}

router.post("/conversations/:conversationId/messages", async (req, res): Promise<void> => {
  const userId = await getUserIdFromRequest(req);
  if (!userId) { res.status(401).json({ error: "No autenticado" }); return; }

  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [conv] = await db.select().from(onyxConversationsTable)
    .where(and(eq(onyxConversationsTable.id, params.data.conversationId), eq(onyxConversationsTable.userId, userId)));

  if (!conv) { res.status(404).json({ error: "Conversación no encontrada" }); return; }

  const [configUsuario] = await db.select().from(onyxUserSettingsTable)
    .where(eq(onyxUserSettingsTable.userId, userId));

  const codigoIdioma = configUsuario?.language ?? "es";
  const instruccionIdioma = INSTRUCCIONES_IDIOMA[codigoIdioma] ?? INSTRUCCIONES_IDIOMA.es;

  const mensajesPrevios = await db.select().from(onyxMessagesTable)
    .where(eq(onyxMessagesTable.conversationId, conv.id))
    .orderBy(onyxMessagesTable.createdAt);

  const esPrimerMensaje = mensajesPrevios.length === 0;

  // Guarda el mensaje del usuario en la base de datos
  const [mensajeUsuario] = await db.insert(onyxMessagesTable).values({
    conversationId: conv.id,
    role: "user",
    content: parsed.data.content,
  }).returning();

  // Construye el historial de mensajes para la IA
  const mensajesChat = [
    {
      role: "system" as const,
      content: `Eres ZerCX, un asistente de inteligencia artificial avanzado, inteligente y preciso. ${instruccionIdioma} Sé conciso pero completo en tus respuestas. Al final de cada respuesta, en una línea separada, incluye exactamente 3 preguntas de seguimiento cortas y relevantes al tema en este formato: SUGERENCIAS: ¿Pregunta 1? | ¿Pregunta 2? | ¿Pregunta 3?`,
    },
    ...mensajesPrevios.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: parsed.data.content },
  ];

  let respuestaIA = "";
  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      max_completion_tokens: 8192,
      messages: mensajesChat,
    });
    respuestaIA = completion.choices[0]?.message?.content ?? "Lo siento, no pude generar una respuesta.";
  } catch (err) {
    logger.error({ err }, "Error en la API de OpenAI/OpenRouter");
    respuestaIA = "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.";
  }

  // Separa el contenido de la respuesta y las sugerencias
  const { contenido: contenidoRespuesta, sugerencias } = extraerSugerencias(respuestaIA);

  // Guarda la respuesta de la IA (sin las sugerencias)
  const [mensajeAsistente] = await db.insert(onyxMessagesTable).values({
    conversationId: conv.id,
    role: "assistant",
    content: contenidoRespuesta,
  }).returning();

  // Actualiza la fecha del último mensaje
  await db.update(onyxConversationsTable)
    .set({ lastMessageAt: new Date() })
    .where(eq(onyxConversationsTable.id, conv.id));

  // Genera título automático para el primer mensaje usando la IA
  if (esPrimerMensaje) {
    try {
      const tituloCompletion = await openai.chat.completions.create({
        model: AI_MODEL,
        max_completion_tokens: 12,
        messages: [
          {
            role: "user",
            content: `Genera un título muy corto (máximo 5 palabras, sin comillas, sin punto al final) para una conversación que empieza con: "${parsed.data.content.slice(0, 200)}"`,
          },
        ],
      });
      const tituloAuto = tituloCompletion.choices[0]?.message?.content?.trim();
      if (tituloAuto) {
        await db.update(onyxConversationsTable)
          .set({ title: tituloAuto })
          .where(eq(onyxConversationsTable.id, conv.id));
      }
    } catch {
      // La generación del título es opcional — ignorar errores
    }
  }

  res.json({
    userMessage: {
      id: mensajeUsuario.id,
      conversationId: mensajeUsuario.conversationId,
      role: mensajeUsuario.role,
      content: mensajeUsuario.content,
      createdAt: mensajeUsuario.createdAt.toISOString(),
    },
    assistantMessage: {
      id: mensajeAsistente.id,
      conversationId: mensajeAsistente.conversationId,
      role: mensajeAsistente.role,
      content: mensajeAsistente.content,
      createdAt: mensajeAsistente.createdAt.toISOString(),
    },
    // Preguntas de seguimiento sugeridas por la IA (vacío si no las generó)
    sugerencias,
  });
});

export default router;
