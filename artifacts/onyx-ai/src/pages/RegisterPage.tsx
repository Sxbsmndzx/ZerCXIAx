import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../lib/supabase";
import { OnyxLogo } from "../components/common/OnyxLogo";
import { AnimatedBackground } from "../components/common/AnimatedBackground";
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
import { useTranslation } from "../hooks/useTranslation";
import { Eye, EyeOff } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Redirect once AuthContext confirms the user is logged in
  const { user } = useAuth();
  useEffect(() => {
    if (user) setLocation("/chat");
  }, [user, setLocation]);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: t("errorTitle"),
        description:
          error.message === "User already registered"
            ? "Este correo ya está registrado. Intenta iniciar sesión."
            : error.message,
      });
      setIsLoading(false);
      return;
    }

    if (data.session) {
      // Supabase created a session immediately (email confirmation disabled).
      // Release spinner — navigation fires via useEffect when AuthContext gets the user.
      setIsLoading(false);
    } else {
      setEmailSent(true);
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <AnimatedBackground />
        <div className="w-full max-w-md space-y-8 relative z-10 text-center">
          <div className="mb-6 flex items-center justify-center">
            <OnyxLogo className="w-24 h-24" />
          </div>
          <div className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-xl shadow-black/20 space-y-4">
            <div className="text-4xl">📧</div>
            <h2 className="text-xl font-bold">Confirma tu correo</h2>
            <p className="text-muted-foreground text-sm">
              Te enviamos un enlace de confirmación a{" "}
              <span className="text-foreground font-medium">{form.getValues("email")}</span>.
              Ábrelo para activar tu cuenta y luego inicia sesión.
            </p>
            <Link href="/" className="text-primary hover:underline text-sm font-medium block mt-4">
              Volver al inicio de sesión →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex items-center justify-center">
            <OnyxLogo className="w-24 h-24" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t("createAccount")}</h1>
          <p className="text-muted-foreground mt-2">{t("joinOnyx")}</p>
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-xl shadow-black/20">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fullName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tu nombre"
                        {...field}
                        disabled={isLoading}
                        className="bg-background/50"
                        autoComplete="name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("emailLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="tu@email.com"
                        type="email"
                        {...field}
                        disabled={isLoading}
                        className="bg-background/50"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("passwordLabel")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={mostrarContrasena ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          {...field}
                          disabled={isLoading}
                          className="bg-background/50 pr-10"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarContrasena(!mostrarContrasena)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {mostrarContrasena
                            ? <EyeOff className="w-4 h-4" />
                            : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {t("creatingAccount")}
                  </span>
                ) : t("createAccount")}
              </Button>
            </form>
          </Form>

          <div className="mt-5 text-center text-xs text-muted-foreground space-y-2">
            <p>
              {t("acceptTerms")}{" "}
              <Link href="/terminos" className="text-primary hover:underline font-medium">
                {t("termsAndConditions")}
              </Link>
            </p>
            <p className="text-sm">
              {t("alreadyAccount")}{" "}
              <Link href="/" className="text-primary hover:underline font-medium">
                {t("signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
