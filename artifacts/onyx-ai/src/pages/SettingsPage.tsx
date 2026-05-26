import { useEffect, useState } from "react";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { ThemeSelector } from "../components/settings/ThemeSelector";
import { AccentColorPicker } from "../components/settings/AccentColorPicker";
import { LanguageSelector } from "../components/settings/LanguageSelector";
import { UserAvatarBadge } from "../components/common/UserAvatarBadge";
import { ReportErrorDialog } from "../components/common/ReportErrorDialog";
import { SecurityDialog } from "../components/common/SecurityDialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, Shield, Mic, Database, AlertTriangle, FileText, ChevronRight } from "lucide-react";
import { useLogoutUser, useUpdateSettings, useGetSettings } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "../hooks/useTranslation";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [reportOpen, setReportOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const { t } = useTranslation();
  useAuthGuard();

  // Local state for toggles (prevents flash)
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

  // Sync local state when settings load
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
            <p className="text-muted-foreground text-sm mt-1">Administra tus preferencias de Onyx.</p>
          </div>

          {/* Profile Summary */}
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
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{t("reportError")}</div>
                <div className="text-xs text-muted-foreground">{t("reportErrorDesc")}</div>
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

          {/* Logout */}
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

      <ReportErrorDialog open={reportOpen} onOpenChange={setReportOpen} />
      <SecurityDialog open={securityOpen} onOpenChange={setSecurityOpen} />
    </AppLayout>
  );
}
