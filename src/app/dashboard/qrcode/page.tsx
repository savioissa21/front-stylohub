"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/queries/useProfile";
import { ColorPicker } from "@/components/dashboard/ColorPicker";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://stylohub.app";

export default function QrCodePage() {
  const { data: profile } = useProfile();
  const canvasRef = useRef<HTMLDivElement>(null);

  const username = profile?.username ?? "";
  const profileUrl = `${BASE_URL}/${username}`;

  const [fgColor, setFgColor] = useState(profile?.theme.primaryColor ?? "#D4AF37");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [size, setSize] = useState(280);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode-${username}.png`;
    a.click();
    toast.success("QR Code baixado!");
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">QR Code</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Compartilha o teu link via QR Code — em cartões, stories ou eventos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Preview card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-5">
          {/* QR Code display (SVG for crisp rendering) */}
          <div
            className="rounded-2xl overflow-hidden p-4 shadow-xl"
            style={{ backgroundColor: bgColor }}
          >
            <QRCodeSVG
              value={profileUrl || "https://stylohub.app"}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              imageSettings={{
                src: "/favicon.ico",
                height: 36,
                width: 36,
                excavate: true,
              }}
            />
          </div>

          {/* URL display */}
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 min-w-0 bg-background border border-border rounded-lg px-3 py-2">
              <p className="text-foreground/60 text-xs truncate font-mono">{profileUrl}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="shrink-0 w-9 h-9 rounded-lg bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              title="Copiar link"
            >
              {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
            </button>
          </div>

          {/* Download button (hidden canvas for PNG export) */}
          <div ref={canvasRef} className="hidden">
            <QRCodeCanvas
              value={profileUrl || "https://stylohub.app"}
              size={1024}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              imageSettings={{
                src: "/favicon.ico",
                height: 128,
                width: 128,
                excavate: true,
              }}
            />
          </div>

          <button
            onClick={handleDownload}
            className="w-full h-10 rounded-xl bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold text-sm flex items-center justify-center gap-2 transition-colors btn-gold-glow"
          >
            <Download size={15} />
            Baixar PNG (alta resolução)
          </button>
        </div>

        {/* Settings */}
        <div className="space-y-5">
          {/* Colors */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h2 className="text-foreground font-semibold text-sm">Cores</h2>
            <ColorPicker label="Cor do QR Code" value={fgColor} onChange={setFgColor} />
            <ColorPicker label="Cor do fundo" value={bgColor} onChange={setBgColor} />
          </div>

          {/* Size */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground font-semibold text-sm">Tamanho</h2>
              <span className="text-muted-foreground text-xs font-mono">{size}px</span>
            </div>
            <input
              type="range"
              min={160}
              max={400}
              step={20}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-stylo-gold cursor-pointer"
            />
            <div className="flex justify-between text-muted-foreground/40 text-xs">
              <span>Pequeno</span>
              <span>Grande</span>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-stylo-gold/5 border border-stylo-gold/15 rounded-2xl p-4 space-y-2">
            <p className="text-stylo-gold text-xs font-semibold">Dicas de uso</p>
            <ul className="text-muted-foreground text-xs space-y-1.5">
              <li>• Usa fundo branco para máxima compatibilidade</li>
              <li>• O nível de correção H aguenta até 30% de dano</li>
              <li>• Imprime em pelo menos 3×3 cm para leitura fácil</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
