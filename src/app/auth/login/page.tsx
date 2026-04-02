"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowRight, Link2, Palette, BarChart2 } from "lucide-react";
import { toast } from "sonner";

import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { authApi } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FEATURES = [
  { icon: Link2,    text: "Todos os seus links num só lugar" },
  { icon: Palette,  text: "Página personalizada com seu estilo" },
  { icon: BarChart2, text: "Analytics de cliques em tempo real" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email: values.email, password: values.password });
      login({ username: res.data.username, email: res.data.email });
      toast.success("Bem-vindo de volta!");
      router.push("/dashboard/links");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "E-mail ou senha incorretos.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left panel (branding) ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden border-r border-border/50">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background dark:from-[#0D0D0F] dark:via-[#111113] dark:to-[#0A0A0C]" />
        <div className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #D4AF3712 0%, transparent 60%), radial-gradient(circle at 80% 20%, #D4AF3708 0%, transparent 50%)" }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)", backgroundSize: "48px 48px" }}
        />

        {/* Content */}
        <div className="relative z-10">
          <span className="text-2xl font-bold text-gold-gradient" style={{ fontFamily: "var(--font-cinzel)" }}>
            Stylohub
          </span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              O seu link.
              <br />
              <span className="text-gold-gradient">A sua identidade.</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-xs">
              Crie uma página única com todos os seus links e partilhe com o mundo.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-stylo-gold/10 border border-stylo-gold/20 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-stylo-gold" />
                </div>
                <span className="text-muted-foreground text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Mock profile card */}
          <div className="bg-card border border-border rounded-2xl p-4 max-w-[260px] backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-stylo-gold/20 border border-stylo-gold/30 flex items-center justify-center">
                <span className="text-stylo-gold text-xs font-bold">A</span>
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold">@arthurcriador</p>
                <p className="text-muted-foreground/60 text-[10px]">stylohub.io/arthurcriador</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {["Instagram", "YouTube", "Newsletter"].map((label, i) => (
                <div key={label} className="h-7 rounded-lg flex items-center px-3"
                  style={{ background: i === 0 ? "#D4AF3720" : "var(--muted)", border: `1px solid ${i === 0 ? "#D4AF3740" : "var(--border)"}` }}>
                  <span className="text-[10px] font-medium" style={{ color: i === 0 ? "#D4AF37" : "var(--muted-foreground)" }}>{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground/50">247 cliques hoje</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-muted-foreground/40 text-xs">© 2025 Stylohub. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* ── Right panel (form) ────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Mobile glow */}
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
            <h1 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Não tem conta?{" "}
              <Link href="/auth/register" className="text-stylo-gold hover:text-stylo-gold/80 font-medium transition-colors">
                Criar gratuitamente
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Senha
                </Label>
                <Link href="/auth/forgot-password" className="text-xs text-stylo-gold/80 hover:text-stylo-gold transition-colors">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
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
                <><Loader2 className="animate-spin" size={16} />Entrando...</>
              ) : (
                <>Entrar na conta <ArrowRight size={15} /></>
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground/50 text-xs mt-8">
            Ao entrar, você concorda com nossos{" "}
            <Link href="/marketing/terms" className="hover:text-muted-foreground underline transition-colors">
              Termos de Uso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
