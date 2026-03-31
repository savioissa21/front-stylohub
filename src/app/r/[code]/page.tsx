import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function AffiliatePage({ params }: Props) {
  const { code } = await params;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  const res = await fetch(`${backendUrl}/api/public/affiliate/${code}`, {
    cache: "no-store",
  });

  if (res.ok) {
    const { url } = await res.json() as { url: string };
    redirect(url);
  }

  // 404 — code not found
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090B] text-white gap-4">
      <p className="text-lg font-semibold">Link não encontrado</p>
      <a href="/" className="text-sm text-white/50 underline underline-offset-4">
        Voltar ao início
      </a>
    </div>
  );
}
