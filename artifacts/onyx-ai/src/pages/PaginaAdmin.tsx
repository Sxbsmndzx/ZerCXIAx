// PÁGINA DE ADMINISTRACIÓN — REPORTES
// Solo accesible si conoces la URL: /admin/reportes
// Muestra todos los reportes de mensajes enviados por usuarios.
// Puedes marcar reportes como revisados.
import { useEffect, useState } from "react";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { AppLayout } from "../components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, CheckCircle, Clock, RefreshCw } from "lucide-react";

interface Reporte {
  id: number;
  userId: number;
  mensajeId: number | null;
  contenido: string;
  motivo: string;
  revisado: boolean;
  creadoEn: string;
  nombreUsuario: string | null;
  correoUsuario: string | null;
}

export default function PaginaAdmin() {
  const { user } = useAuthGuard();
  const { toast } = useToast();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [marcando, setMarcando] = useState<number | null>(null);

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem("onyx_token");
      const res = await fetch("/api/reportes", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const datos = await res.json();
      setReportes(Array.isArray(datos) ? datos : []);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los reportes." });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (user) cargarReportes();
  }, [user]);

  const marcarRevisado = async (id: number) => {
    setMarcando(id);
    try {
      const token = localStorage.getItem("onyx_token");
      await fetch(`/api/reportes/${id}/revisado`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setReportes((prev) => prev.map((r) => r.id === id ? { ...r, revisado: true } : r));
      toast({ title: "Marcado como revisado" });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo marcar el reporte." });
    } finally {
      setMarcando(null);
    }
  };

  const pendientes = reportes.filter((r) => !r.revisado).length;
  const revisados = reportes.filter((r) => r.revisado).length;

  if (!user) return null;

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 md:px-8 space-y-6">
          {/* Encabezado */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-destructive" />
                <h1 className="text-2xl font-bold">Panel de Reportes</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Reportes enviados por usuarios de ZerCX AI
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={cargarReportes} disabled={cargando} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{reportes.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Total</div>
            </div>
            <div className="bg-card border border-destructive/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{pendientes}</div>
              <div className="text-xs text-muted-foreground mt-1">Pendientes</div>
            </div>
            <div className="bg-card border border-primary/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary">{revisados}</div>
              <div className="text-xs text-muted-foreground mt-1">Revisados</div>
            </div>
          </div>

          {/* Lista de reportes */}
          {cargando ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : reportes.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Flag className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No hay reportes todavía.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportes.map((reporte) => (
                <div
                  key={reporte.id}
                  className={`bg-card border rounded-xl p-5 space-y-3 transition-colors ${
                    reporte.revisado ? "border-border/40 opacity-60" : "border-destructive/30"
                  }`}
                >
                  {/* Cabecera del reporte */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">
                          {reporte.nombreUsuario ?? `Usuario #${reporte.userId}`}
                        </span>
                        <span className="text-xs text-muted-foreground">{reporte.correoUsuario}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(reporte.creadoEn).toLocaleString("es-ES")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {reporte.revisado ? (
                        <Badge variant="outline" className="gap-1 text-primary border-primary/30 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Revisado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-destructive border-destructive/30 text-xs">
                          <Clock className="w-3 h-3" />
                          Pendiente
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Motivo */}
                  <div className="text-xs font-medium text-muted-foreground">
                    Motivo: <span className="text-foreground">{reporte.motivo}</span>
                  </div>

                  {/* Contenido reportado */}
                  <div className="bg-background/50 border border-border/50 rounded-lg p-3 text-sm text-muted-foreground leading-relaxed max-h-32 overflow-y-auto">
                    <span className="text-xs text-muted-foreground/60 block mb-1">Respuesta reportada:</span>
                    {reporte.contenido}
                  </div>

                  {/* Botón marcar revisado */}
                  {!reporte.revisado && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => marcarRevisado(reporte.id)}
                      disabled={marcando === reporte.id}
                      className="gap-2 text-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {marcando === reporte.id ? "Marcando..." : "Marcar como revisado"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
