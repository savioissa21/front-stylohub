"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validations";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, values.newPassword);
      toast.success("Senha redefinida com sucesso!");
      router.push("/auth/login");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Link inválido ou expirado. Solicite um novo.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-destructive/30 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="mx-auto text-destructive mb-4" size={48} strokeWidth={1.5} />
          <h1 className="text-xl font-semibold text-foreground mb-2">Link inválido</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Este link de redefinição é inválido ou expirou.
          </p>
          <Link href="/auth/forgot-password">
            <Button className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold">
              Solicitar novo link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-stylo-gold opacity-5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <span
            className="text-3xl font-bold text-gold-gradient"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Stylohub
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-muted-foreground/40 hover:text-muted-foreground/70 text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Voltar ao login
          </Link>

          <h1 className="text-xl font-semibold text-foreground mb-1">Criar nova senha</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Sua nova senha deve ter no mínimo 8 caracteres.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-muted-foreground text-sm">
                Nova senha
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold pr-10"
                  {...register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-muted-foreground text-sm">
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold pr-10"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold h-11"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              {isLoading ? "Salvando..." : "Redefinir senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
