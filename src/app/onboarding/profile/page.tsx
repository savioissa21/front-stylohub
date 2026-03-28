"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, User } from "lucide-react";
import { toast } from "sonner";

import { profileOnboardingSchema } from "@/lib/validations";
import { creatorApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { z } from "zod";

type ProfileOnboardingValues = z.infer<typeof profileOnboardingSchema>;

export default function OnboardingProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileOnboardingValues>({
    resolver: zodResolver(profileOnboardingSchema),
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida.");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const res = await creatorApi.uploadImage(file, "avatars");
      setAvatarUrl(res.data.url);
      toast.success("Avatar atualizado!");
    } catch {
      toast.error("Erro ao fazer upload do avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (values: ProfileOnboardingValues) => {
    setIsSaving(true);
    try {
      await Promise.all([
        avatarUrl ? creatorApi.updateAvatar(avatarUrl) : Promise.resolve(),
        creatorApi.updateProfileInfo({ displayName: values.displayName, bio: values.bio }),
      ]);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/onboarding/theme");
    } catch {
      toast.error("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-stylo-surface border border-white/10 rounded-2xl p-8">
      <div className="mb-6">
        <span className="text-xs font-semibold text-stylo-gold tracking-widest uppercase">
          Passo 1 de 3
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Configure seu perfil</h1>
        <p className="text-white/50 text-sm mt-1">
          Adicione uma foto e conte um pouco sobre você.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="relative w-24 h-24 rounded-full border-2 border-dashed border-white/20 hover:border-stylo-gold/50 transition-colors flex items-center justify-center overflow-hidden group"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-white/30 group-hover:text-white/50 transition-colors" />
            )}
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isUploadingAvatar ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
            </div>
          </button>
          <p className="text-white/30 text-xs">Clique para fazer upload</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Display name */}
        <div className="space-y-1.5">
          <Label htmlFor="displayName" className="text-white/70 text-sm">
            Nome de exibição
          </Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Seu nome completo ou apelido"
            className="bg-stylo-dark border-white/10 text-white placeholder:text-white/30 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold"
            {...register("displayName")}
          />
          {errors.displayName && (
            <p className="text-red-400 text-xs">{errors.displayName.message}</p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <Label htmlFor="bio" className="text-white/70 text-sm">
            Bio{" "}
            <span className="text-white/30 font-normal">(opcional)</span>
          </Label>
          <textarea
            id="bio"
            rows={3}
            placeholder="Uma frase sobre você ou o que você faz..."
            className="w-full bg-stylo-dark border border-white/10 rounded-md px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-stylo-gold focus:border-stylo-gold resize-none"
            {...register("bio")}
          />
          {errors.bio && (
            <p className="text-red-400 text-xs">{errors.bio.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="w-full btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold h-11"
        >
          {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
          {isSaving ? "Salvando..." : "Continuar"}
        </Button>
      </form>
    </div>
  );
}
