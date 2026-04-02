"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AtSign, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

import { registerSchema, type RegisterFormValues } from "@/lib/validations";
import { authApi } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PERKS = [
  "Página de links personalizada em minutos",
  "Analytics de cliques incluído no plano grátis",
  "Domínio próprio no plano PRO",
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: searchParams.get("username") ?? "",
    },
  });

  const usernameValue = watch("username") ?? "";

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({
        email: values.email,
        password: values.password,
        username: values.username,
      });
      login({ username: res.data.username, email: res.data.email });
      toast.success("Conta criada com sucesso!");
      router.push("/onboarding/profile");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Erro ao criar conta. Tente novamente.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left panel (branding) ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden border-r border-border/50">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background dark:from-[#0D0D0F] dark:via-[#111113] dark:to-[#0A0A0C]" />
        <div className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #D4AF3712 0%, transparent 60%), radial-gradient(circle at 80% 20%, #D4AF3708 0%, transparent 50%)" }}
        />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)", backgroundSize: "48px 48px" }}
        />

        <div className="relative z-10">
          <span className="text-2xl font-bold text-gold-gradient" style={{ fontFamily: "var(--font-cinzel)" }}>
            Stylohub
          </span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-stylo-gold text-xs font-semibold uppercase tracking-widest mb-3">Grátis para sempre</p>
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Cria a tua página
              <br />
              <span className="text-gold-gradient">em 2 minutos.</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-xs">
              Sem cartão de crédito. Sem complicações. Começa grátis e faz upgrade quando quiseres.
            </p>
          </div>

          <div className="space-y-3">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-stylo-gold/20 border border-stylo-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={10} className="text-stylo-gold" />
                </div>
                <span className="text-muted-foreground text-sm leading-snug">{perk}</span>
              </div>
            ))}
          </div>

          {/* URL preview */}
          <div className="bg-card border border-border rounded-2xl p-5 max-w-[280px] shadow-sm">
            <p className="text-muted-foreground/60 text-xs mb-2 uppercase tracking-widest">O teu link vai ser</p>
            <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5 border border-border">
              <span className="text-muted-foreground/70 text-sm">stylohub.io/</span>
              <span className="text-stylo-gold font-semibold text-sm">
                {usernameValue || "seunome"}
              </span>
            </div>
            <p className="text-muted-foreground/40 text-xs mt-2">Atualiza em tempo real enquanto escreves</p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-muted-foreground/40 text-xs">© 2025 Stylohub. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* ── Right panel (form) ────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-stylo-gold opacity-[0.06] blur-[80px]" />
        </div>

        <div className="w-full max-w-sm relative">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <span className="text-2xl font-bold text-gold-gradient" style={{ fontFamily: "var(--font-cinzel)" }}>
              Stylohub
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Criar conta grátis</h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Já tem conta?{" "}
              <Link href="/auth/login" className="text-stylo-gold hover:text-stylo-gold/80 font-medium transition-colors">
                Entrar
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Nome de usuário
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stylo-gold/70">
                  <AtSign size={14} />
                </span>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="seunome"
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold/60 h-11 rounded-xl pl-9"
                  {...register("username")}
                />
              </div>
              {errors.username ? (
                <p className="text-red-500 text-xs">{errors.username.message}</p>
              ) : (
                <p className="text-muted-foreground/50 text-xs">
                  stylohub.io/
                  <span className="text-stylo-gold/60 font-medium">{usernameValue || "seunome"}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold/60 h-11 rounded-xl"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold/60 h-11 rounded-xl pr-11"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold h-11 rounded-xl text-sm mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={16} />Criando conta...</>
              ) : (
                <>Criar conta grátis <ArrowRight size={15} /></>
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground/50 text-xs mt-8">
            Ao criar uma conta, você concorda com nossos{" "}
            <Link href="/marketing/terms" className="hover:text-muted-foreground underline transition-colors">
              Termos de Uso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
