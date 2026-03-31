import type { WidgetConfig } from "@/types/widget";

const PLATFORM_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  KOFI:          { bg: "#29abe0", text: "#ffffff", label: "Ko-fi" },
  BUYMEACOFFEE:  { bg: "#FFDD00", text: "#000000", label: "Buy Me a Coffee" },
  PAYPAL:        { bg: "#0070ba", text: "#ffffff", label: "PayPal" },
  OUTRO:         { bg: "#D4AF37", text: "#000000", label: "Doação" },
};

interface Props {
  config: WidgetConfig;
}

export default function DonationLinkWidget({ config }: Props) {
  const platform = config.platform ?? "OUTRO";
  const style = PLATFORM_COLORS[platform] ?? PLATFORM_COLORS.OUTRO;
  const label = config.title || style.label;

  return (
    <a
      href={config.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 font-semibold text-sm transition-opacity hover:opacity-90"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <span>❤️</span>
      <span>{label}</span>
    </a>
  );
}
