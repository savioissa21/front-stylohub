"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(values.email);
      setSentEmail(values.email);
      setSent(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Erro ao enviar e-mail. Tente novamente.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
          {sent ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="text-stylo-gold" size={56} strokeWidth={1.5} />
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">Verifique seu e-mail</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Enviamos um link de redefinição para{" "}
                <span className="text-foreground font-medium">{sentEmail}</span>. Verifique também
                sua caixa de spam.
              </p>
              <Link
                href="/auth/login"
                className="mt-6 inline-flex items-center gap-2 text-stylo-gold hover:underline text-sm"
              >
                <ArrowLeft size={14} />
                Voltar ao login
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-muted-foreground/40 hover:text-muted-foreground/70 text-sm mb-6 transition-colors"
              >
                <ArrowLeft size={14} />
                Voltar
              </Link>
              <h1 className="text-xl font-semibold text-foreground mb-1">Esqueceu sua senha?</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Digite seu e-mail e enviaremos um link para criar uma nova senha.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-muted-foreground text-sm">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold h-11"
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                  {isLoading ? "Enviando..." : "Enviar link de redefinição"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
