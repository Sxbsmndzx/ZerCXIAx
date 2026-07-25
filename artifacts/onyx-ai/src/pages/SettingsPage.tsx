import { useEffect, useState } from "react";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { ThemeSelector } from "../components/settings/ThemeSelector";
import { AccentColorPicker } from "../components/settings/AccentColorPicker";
import { LanguageSelector } from "../components/settings/LanguageSelector";
import { UserAvatarBadge } from "../components/common/UserAvatarBadge";
import { SecurityDialog } from "../components/common/SecurityDialog";
import { ReportErrorDialog } from "../components/common/ReportErrorDialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LogOut, Shield, Mic, Database, FileText, ChevronRight, Crown, AlertTriangle } from "lucide-react";
import { useLogoutUser, useUpdateSettings, useGetSettings } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "../hooks/useTranslation";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [reportOpen, setReportOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const { t } = useTranslation();
  useAuthGuard();

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [dataEnabled, setDataEnabled] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const logoutMutation = useLogoutUser({
    mutation: {
      onSuccess: () => { logout(); setLocation("/"); },
    },
  });

  const { data: settings } = useGetSettings({
    query: { enabled: !!user, queryKey: ["/api/settings"] },
  });

  useEffect(() => {
    if (settings && !settingsLoaded) {
      setVoiceEnabled(settings.voiceModeEnabled ?? false);
      setDataEnabled(settings.dataTrainingEnabled ?? true);
      setSettingsLoaded(true);
    }
  }, [settings, settingsLoaded]);

  const updateSettingsMutation = useUpdateSettings();

  const handleVoiceToggle = (checked: boolean) => {
    setVoiceEnabled(checked);
    updateSettingsMutation.mutate({ data: { voiceModeEnabled: checked } });
  };

  const handleDataToggle = (checked: boolean) => {
    setDataEnabled(checked);
    updateSettingsMutation.mutate({ data: { dataTrainingEnabled: checked } });
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 md:px-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("configuration")}</h1>
            <p className="text-muted-foreground text-sm mt-1">Administra tus preferencias de ZerCX AI.</p>
          </div>

          {/* Resumen de perfil */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <UserAvatarBadge user={user} className="w-14 h-14 text-base border-2 border-primary/20 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground truncate">{user.name}</h2>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mt-1">
                Plan {user.plan}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLocation("/perfil")} className="flex-shrink-0">
              {t("editProfile")}
            </Button>
          </div>

          {/* Aspecto */}
          <section className="space-y-5">
            <h3 className="text-base font-semibold border-b border-border pb-2">{t("appearance")}</h3>
            <ThemeSelector />
            <AccentColorPicker />
          </section>

          {/* General */}
          <section className="space-y-5">
            <h3 className="text-base font-semibold border-b border-border pb-2">{t("general")}</h3>
            <LanguageSelector />

            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex-1 min-w-0">
                <Label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <Mic className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  {t("voiceMode")}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5 ml-6">{t("voiceModeDesc")}</p>
              </div>
              <Switch
                checked={voiceEnabled}
                onCheckedChange={handleVoiceToggle}
                disabled={updateSettingsMutation.isPending || !settingsLoaded}
              />
            </div>
          </section>

          {/* Plan Premium */}
          <section className="space-y-3">
            <h3 className="text-base font-semibold border-b border-border pb-2">Plan</h3>
            <button
              onClick={() => setPremiumOpen(true)}
              className="w-full flex items-center gap-3 p-4 rounded-xl border transition-colors text-left relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)/0.08) 0%, hsl(45 100% 60% / 0.08) 100%)",
                borderColor: "hsl(45 100% 60% / 0.4)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none opacity-30"
                style={{ background: "hsl(45 100% 60%)" }}
              />
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(45 100% 60% / 0.2), hsl(40 100% 50% / 0.3))" }}
              >
                <Crown className="w-4 h-4" style={{ color: "hsl(45 100% 60%)" }} />
              </div>
              <div className="flex-1 min-w-0 relative">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Plan Premium</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                    style={{
                      background: "hsl(45 100% 60% / 0.15)",
                      color: "hsl(45 100% 60%)",
                      border: "1px solid hsl(45 100% 60% / 0.3)",
                    }}
                  >
                    Próximamente
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Respuestas más rápidas, sin límites y funciones exclusivas
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 relative" />
            </button>
          </section>

          {/* Privacidad */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold border-b border-border pb-2">{t("privacy")}</h3>
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex-1 min-w-0">
                <Label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <Database className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  {t("trainingData")}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5 ml-6">{t("trainingDataDesc")}</p>
              </div>
              <Switch
                checked={dataEnabled}
                onCheckedChange={handleDataToggle}
                disabled={updateSettingsMutation.isPending || !settingsLoaded}
              />
            </div>
          </section>

          {/* Seguridad */}
          <section className="space-y-3">
            <h3 className="text-base font-semibold border-b border-border pb-2">{t("security")}</h3>
            <button
              onClick={() => setSecurityOpen(true)}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{t("changePassword")}</div>
                <div className="text-xs text-muted-foreground">{t("securityDesc")}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          </section>

          {/* Soporte */}
          <section className="space-y-3">
            <h3 className="text-base font-semibold border-b border-border pb-2">{t("support")}</h3>

            <button
              onClick={() => setReportOpen(true)}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-destructive/5 hover:border-destructive/30 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{t("reportError")}</div>
                <div className="text-xs text-muted-foreground">Envíanos un reporte por correo</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>

            <Link href="/terminos">
              <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary/50 transition-colors text-left">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{t("termsAndConditions")}</div>
                  <div className="text-xs text-muted-foreground">{t("termsDesc")}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            </Link>
          </section>

          {/* Cerrar sesión */}
          <div className="pb-8">
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4" />
              {logoutMutation.isPending ? t("loggingOut") : t("logout")}
            </Button>
          </div>
        </div>
      </div>

      <SecurityDialog open={securityOpen} onOpenChange={setSecurityOpen} />
      <ReportErrorDialog open={reportOpen} onOpenChange={setReportOpen} />

      {/* Diálogo Plan Premium */}
      <Dialog open={premiumOpen} onOpenChange={setPremiumOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Crown className="w-5 h-5" style={{ color: "hsl(45 100% 60%)" }} />
              Plan Premium
            </DialogTitle>
            <DialogDescription>
              Estamos preparando algo increíble para ti.
            </DialogDescription>
          </DialogHeader>

          <div
            className="rounded-2xl p-6 text-center space-y-3 my-2"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)/0.08), hsl(45 100% 60% / 0.1))",
              border: "1px solid hsl(45 100% 60% / 0.3)",
            }}
          >
            <div className="text-4xl font-black tracking-tight" style={{ color: "hsl(45 100% 60%)" }}>
              Próximamente
            </div>
            <div
              className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full"
              style={{
                background: "hsl(45 100% 60% / 0.15)",
                color: "hsl(45 100% 60%)",
                border: "1px solid hsl(45 100% 60% / 0.4)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Coming Soon
            </div>
          </div>

          <div className="space-y-2.5 py-1">
            {[
              { emoji: "⚡", titulo: "Respuestas ultra-rápidas", desc: "Prioridad máxima en el servidor" },
              { emoji: "♾️", titulo: "Sin límites de mensajes", desc: "Chatea todo lo que quieras" },
              { emoji: "🧠", titulo: "Modelos más avanzados", desc: "Acceso a los mejores modelos de IA" },
              { emoji: "📁", titulo: "Subir archivos y imágenes", desc: "Comparte documentos con la IA" },
              { emoji: "🎨", titulo: "Temas exclusivos", desc: "Personalización avanzada de la interfaz" },
            ].map((item) => (
              <div key={item.titulo} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
                <span className="text-base flex-shrink-0">{item.emoji}</span>
                <div>
                  <div className="text-sm font-medium text-foreground">{item.titulo}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground pt-1">
            Actualmente en Plan <span className="font-semibold text-foreground capitalize">{user?.plan ?? "free"}</span>.
            El Plan Premium llegará muy pronto — ¡mantente atento!
          </p>

          <Button onClick={() => setPremiumOpen(false)} className="w-full">
            Entendido
          </Button>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
