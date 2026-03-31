import type { WidgetConfig } from "@/types/widget";

interface Props {
  config: WidgetConfig;
}

export default function AffiliateLinkWidget({ config }: Props) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN ?? "localhost:3000";
  const shortUrl = `https://${domain}/r/${config.code}`;

  return (
    <a
      href={shortUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 font-semibold text-sm text-white hover:bg-white/10 transition-colors"
    >
      <span>{config.title}</span>
      <span className="text-xs text-white/40 ml-2">↗ Afiliado</span>
    </a>
  );
}
