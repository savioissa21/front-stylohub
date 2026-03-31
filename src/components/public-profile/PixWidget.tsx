"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { WidgetConfig } from "@/types/widget";

const PIX_KEY_LABELS: Record<string, string> = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  EMAIL: "E-mail",
  TELEFONE: "Telefone",
  ALEATORIA: "Chave aleatória",
};

interface Props {
  config: WidgetConfig;
}

export default function PixWidget({ config }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!config.pixKey) return;
    await navigator.clipboard.writeText(config.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const keyLabel = config.pixKeyType ? PIX_KEY_LABELS[config.pixKeyType] ?? config.pixKeyType : "PIX";

  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
      {config.title && (
        <p className="text-sm font-semibold text-white">{config.title}</p>
      )}
      {config.description && (
        <p className="text-xs text-white/50">{config.description}</p>
      )}

      <div className="flex items-center justify-center">
        <QRCodeSVG value={config.pixKey ?? ""} size={160} />
      </div>

      <div className="space-y-1">
        <p className="text-xs text-white/40 uppercase tracking-wide">{keyLabel}</p>
        <p className="text-sm font-mono text-white/80 break-all">{config.pixKey}</p>
      </div>

      <button
        onClick={handleCopy}
        className="w-full rounded-lg py-2 text-sm font-semibold transition-colors"
        style={{ backgroundColor: copied ? "#22c55e" : "#32BCAD", color: "#fff" }}
      >
        {copied ? "Copiado!" : "Copiar chave PIX"}
      </button>
    </div>
  );
}
