import { useRef, useState } from "react";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { AppLayout } from "../components/layout/AppLayout";
import { useUpdateUserProfile, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserAvatarBadge } from "../components/common/UserAvatarBadge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { User, Mail, Calendar, Camera, Trash2, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

export default function ProfilePage() {
  const { user } = useAuthGuard();
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "" },
  });

  const updateMutation = useUpdateUserProfile({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        updateUser(data);
        toast({ title: "Perfil actualizado", description: "Tus datos han sido guardados." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el perfil." });
      },
    },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Error", description: "Solo se permiten imágenes." });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Error", description: "La imagen debe ser menor a 2MB." });
      return;
    }

    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const avatarUrl = event.target?.result as string;
        const token = localStorage.getItem("onyx_token") || sessionStorage.getItem("onyx_token");
        const res = await fetch("/api/auth/me/avatar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ avatarUrl }),
        });

        if (res.ok) {
          const data = await res.json();
          queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
          updateUser(data);
          toast({ title: "Foto actualizada", description: "Tu foto de perfil ha sido guardada." });
        } else {
          const err = await res.json();
          toast({ variant: "destructive", title: "Error", description: err.error || "No se pudo subir la foto." });
        }
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Error al procesar la imagen." });
      setUploadingAvatar(false);
    }
    // Reset input
    e.target.value = "";
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      const token = localStorage.getItem("onyx_token") || sessionStorage.getItem("onyx_token");
      const res = await fetch("/api/auth/me/avatar", {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        toast({ title: "Foto eliminada" });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la foto." });
    }
    setUploadingAvatar(false);
  };

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateMutation.mutate({ data: values });
  };

  if (!user) return null;

  const hasAvatar = !!(user as any).avatarUrl;

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 md:px-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
            <p className="text-muted-foreground text-sm mt-1">Administra tu información personal.</p>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 p-6 bg-card border border-border rounded-xl">
            <div className="relative group">
              <UserAvatarBadge user={user} className="w-24 h-24 text-2xl border-2 border-primary/20" />
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <div className="text-center">
              <h2 className="font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mt-1">
                Plan {user.plan}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <Camera className="w-3.5 h-3.5" />
                {hasAvatar ? "Cambiar foto" : "Subir foto"}
              </Button>
              {hasAvatar && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </Button>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Información personal</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} disabled={updateMutation.isPending} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Correo electrónico</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" value={user.email} disabled />
                  </div>
                  <p className="text-xs text-muted-foreground">El correo no se puede cambiar.</p>
                </div>

                <div className="space-y-2">
                  <FormLabel>Miembro desde</FormLabel>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" value={format(new Date(user.createdAt), "d 'de' MMMM, yyyy", { locale: es })} disabled />
                  </div>
                </div>

                <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto">
                  {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
