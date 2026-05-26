import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoginUser } from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { OnyxLogo } from "../components/common/OnyxLogo";
import { AnimatedBackground } from "../components/common/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [rememberMe, setRememberMe] = useState(true);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useLoginUser({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user, rememberMe);
        setLocation("/chat");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: t("errorTitle"),
          description: (error as any).data?.error || "Credenciales inválidas.",
        });
      },
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo + header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex items-center justify-center">
            <OnyxLogo size="lg" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t("welcomeBack")}</h1>
          <p className="text-muted-foreground mt-2">{t("loginSubtitle")}</p>
        </div>

        {/* Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-8 shadow-xl shadow-black/20">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                        disabled={loginMutation.isPending}
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
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={loginMutation.isPending}
                        className="bg-background/50"
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me */}
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={loginMutation.isPending}
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm text-muted-foreground cursor-pointer select-none"
                >
                  Mantener sesión iniciada
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {t("loggingIn")}
                  </span>
                ) : t("loginButton")}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/registro" className="text-primary hover:underline font-medium transition-colors">
              {t("createAccount")}
            </Link>
          </div>
          <div className="mt-3 text-center text-xs text-muted-foreground">
            <Link href="/terminos" className="hover:text-primary hover:underline transition-colors">
              {t("termsAndConditions")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
