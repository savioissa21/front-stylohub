"use client";

import { Lock, Crown, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useProfile } from "@/hooks/queries/useProfile";
import { useAnalytics } from "@/hooks/queries/useAnalytics";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ label, value, icon, description }: StatCardProps) {
  return (
    <div className="bg-stylo-surface border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/50 text-sm">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-stylo-gold/10 flex items-center justify-center text-stylo-gold">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {description && <p className="text-white/30 text-xs mt-1">{description}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: profile } = useProfile();
  const { data: analytics, isLoading } = useAnalytics();
  const isPro = profile?.plan === "PRO";

  if (!isPro) {
    return (
      <div className="p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Acompanhe o desempenho da sua página.
          </p>
        </div>

        {/* Locked overlay card */}
        <div className="relative bg-stylo-surface border border-stylo-gold/20 rounded-2xl p-10 text-center overflow-hidden">
          {/* Blurred mock bars */}
          <div className="absolute inset-0 flex items-end gap-2 px-8 pb-8 opacity-20 blur-sm pointer-events-none">
            {[60, 80, 45, 90, 55, 70, 85].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-stylo-gold rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full bg-stylo-gold/20 border border-stylo-gold/30 flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-stylo-gold" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Analytics disponível no PRO</h2>
            <p className="text-white/50 text-sm max-w-sm mx-auto mb-6">
              Veja quantas pessoas visitaram sua página, em quais links elas clicaram e sua taxa
              de conversão — em tempo real.
            </p>
            <Link href="/dashboard/billing">
              <Button className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold px-8">
                <Crown size={15} className="mr-2" />
                Fazer upgrade para PRO
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-stylo-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const ctrFormatted = analytics
    ? `${(analytics.clickThroughRate * 100).toFixed(1)}%`
    : "0%";

  // Build chart data from clicksPerWidget + profile widgets
  const chartData = analytics
    ? Object.entries(analytics.clicksPerWidget).map(([widgetId, clicks]) => {
        const widget = profile?.widgets.find((w) => w.id === widgetId);
        return {
          name: widget?.config.title ?? widgetId.slice(0, 6),
          cliques: clicks,
        };
      })
    : [];

  return (
    <div className="p-4 sm:p-6 max-w-3xl space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-0.5">Desempenho da sua página.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Visualizações totais"
          value={analytics?.totalViews?.toLocaleString("pt-BR") ?? 0}
          icon={<Eye size={16} />}
          description="Visitas à sua página"
        />
        <StatCard
          label="Cliques totais"
          value={analytics?.totalClicks?.toLocaleString("pt-BR") ?? 0}
          icon={<MousePointerClick size={16} />}
          description="Em todos os links"
        />
        <StatCard
          label="Taxa de clique (CTR)"
          value={ctrFormatted}
          icon={<TrendingUp size={16} />}
          description="Cliques / visualizações"
        />
      </div>

      {/* Bar chart */}
      <div className="bg-stylo-surface border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-6">Cliques por link</h2>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-white/30 text-sm">
            Nenhum dado disponível ainda.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181B",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                cursor={{ fill: "rgba(212,175,55,0.06)" }}
              />
              <Bar dataKey="cliques" fill="#D4AF37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
