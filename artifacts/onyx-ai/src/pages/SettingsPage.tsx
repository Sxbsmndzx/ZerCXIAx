import { useAuthGuard } from "../hooks/useAuthGuard";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { ThemeSelector } from "../components/settings/ThemeSelector";
import { AccentColorPicker } from "../components/settings/AccentColorPicker";
import { LanguageSelector } from "../components/settings/LanguageSelector";
import { UserAvatarBadge } from "../components/common/UserAvatarBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, Shield, Mic, Database } from "lucide-react";
import { useLogoutUser, useUpdateSettings, useGetSettings } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  useAuthGuard();

  const logoutMutation = useLogoutUser({
    mutation: {
      onSuccess: () => {
        logout();
        setLocation("/");
      }
    }
  });

  const { data: settings } = useGetSettings({
    query: {
      enabled: !!user,
      queryKey: ["/api/settings"]
    }
  });

  const updateSettingsMutation = useUpdateSettings();

  const handleVoiceToggle = (checked: boolean) => {
    updateSettingsMutation.mutate({ data: { voiceModeEnabled: checked } });
  };

  const handleDataToggle = (checked: boolean) => {
    updateSettingsMutation.mutate({ data: { dataTrainingEnabled: checked } });
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto px-4 py-8 md:px-12 lg:px-24">
        <div className="max-w-2xl mx-auto space-y-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Configuración</h1>
            <p className="text-muted-foreground">Administra tus preferencias y la apariencia de Onyx.</p>
          </div>

          {/* Profile Summary */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
            <UserAvatarBadge user={user} className="w-16 h-16 text-lg border-2 border-primary/20" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-1 flex gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Plan {user.plan}
                </span>
              </div>
            </div>
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={() => setLocation("/perfil")}>
                Editar perfil
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {/* Aspecto */}
            <section className="space-y-6">
              <h3 className="text-lg font-medium border-b border-border pb-2">Aspecto</h3>
              <ThemeSelector />
              <AccentColorPicker />
            </section>

            {/* General */}
            <section className="space-y-6">
              <h3 className="text-lg font-medium border-b border-border pb-2">General</h3>
              <LanguageSelector />
              
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-muted-foreground" />
                    Modo de voz
                  </Label>
                  <p className="text-xs text-muted-foreground">Activar entrada por voz en el chat</p>
                </div>
                <Switch 
                  checked={settings?.voiceModeEnabled} 
                  onCheckedChange={handleVoiceToggle}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>
            </section>

            {/* Privacidad y Datos */}
            <section className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-medium border-b border-border pb-2">Privacidad y Datos</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    Controles de datos
                  </Label>
                  <p className="text-sm text-muted-foreground">Permitir que tus datos se usen para mejorar el modelo</p>
                </div>
                <Switch 
                  checked={settings?.dataTrainingEnabled}
                  onCheckedChange={handleDataToggle}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    Seguridad
                  </Label>
                  <p className="text-sm text-muted-foreground">Administra tus opciones de seguridad y dispositivos</p>
                </div>
                <Button variant="outline" size="sm">Administrar</Button>
              </div>
            </section>
          </div>

          <div className="pt-8 border-t border-border/50">
            <Button 
              variant="destructive" 
              className="w-full sm:w-auto gap-2"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4" />
              {logoutMutation.isPending ? "Cerrando sesión..." : "Cerrar sesión"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
