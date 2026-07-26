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
        <div className="w-full max-w-sm relative z-10">
          {/* Icon badge */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-2xl border border-primary/30 animate-ping opacity-40" />
            </div>
          </div>

          {/* Card */}
          <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl shadow-black/20 text-center space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Revisa tu correo</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enviamos un enlace de activación a
            </p>
            <p className="text-sm font-medium text-foreground bg-muted/50 rounded-lg px-3 py-2 break-all">
              {form.getValues("email")}
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              Ábrelo y luego inicia sesión para acceder a tu cuenta.
            </p>
          </div>

          {/* Footer link */}
          <div className="text-center mt-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver al inicio de sesión
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
