import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Apenas letras, números e underscore"),
  email: z.string().email("E-mail inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      "Deve conter ao menos uma maiúscula, uma minúscula e um número"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        "Deve conter ao menos uma maiúscula, uma minúscula e um número"
      ),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const updateThemeSchema = z.object({
  bgType: z.enum(["SOLID_COLOR", "GRADIENT", "IMAGE"]),
  bgValue: z.string().min(1),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor hexadecimal inválida"),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor hexadecimal inválida"),
  buttonStyle: z.enum(["ROUNDED", "SQUARED", "PILL", "OUTLINE", "HARD_SHADOW"]),
  isCustom: z.boolean(),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor hexadecimal inválida"),
  shadowStyle: z.enum(["NONE", "SOFT", "GLOW", "HARD"]),
});

export const addLinkWidgetSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(100),
  url: z
    .string()
    .url("URL inválida")
    .refine((u) => /^https?:\/\//i.test(u), "URL deve começar com http:// ou https://"),
});

export const addVideoWidgetSchema = z.object({
  videoId: z.string().min(1, "ID do vídeo obrigatório"),
  autoPlay: z.boolean().optional(),
  showControls: z.boolean().optional(),
});

export const profileOnboardingSchema = z.object({
  displayName: z.string().min(1, "Nome obrigatório").max(80),
  bio: z.string().max(160, "Máximo 160 caracteres").optional(),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type UpdateThemeFormValues = z.infer<typeof updateThemeSchema>;
export type AddLinkWidgetFormValues = z.infer<typeof addLinkWidgetSchema>;
