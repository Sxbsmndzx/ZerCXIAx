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
import { User, Mail, Calendar } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  avatarInitials: z.string().max(2, "Máximo 2 caracteres").optional(),
});

export default function ProfilePage() {
  const { user } = useAuthGuard();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      avatarInitials: user?.avatarInitials || "",
    },
  });

  const updateMutation = useUpdateUserProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        toast({
          title: "Perfil actualizado",
          description: "Tus datos han sido guardados correctamente.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar el perfil.",
        });
      },
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateMutation.mutate({ data: values });
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto px-4 py-8 md:px-12 lg:px-24">
        <div className="max-w-2xl mx-auto space-y-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Mi perfil</h1>
            <p className="text-muted-foreground">Administra tu información personal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Avatar panel */}
            <div className="md:col-span-1 flex flex-col items-center space-y-4">
              <UserAvatarBadge user={user} className="w-32 h-32 text-4xl border-4 border-primary/20" />
              <div className="text-center">
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                  Plan {user.plan}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                className="pl-10"
                                {...field}
                                disabled={updateMutation.isPending}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="avatarInitials"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Iniciales del avatar</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej. JD"
                              maxLength={2}
                              className="uppercase"
                              {...field}
                              disabled={updateMutation.isPending}
                            />
                          </FormControl>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Máximo 2 letras — se muestran en tu avatar si no tienes foto
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </form>
                </Form>
              </div>

              {/* Account info */}
              <div className="space-y-3">
                <h3 className="text-base font-medium border-b border-border pb-2">
                  Información de la cuenta
                </h3>
                <div className="bg-secondary/30 rounded-lg p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Correo electrónico</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Miembro desde</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(user.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
