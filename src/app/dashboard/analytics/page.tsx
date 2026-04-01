"use client";

import { Lock, Crown, Eye, MousePointerClick, TrendingUp, ArrowUpRight } from "lucide-react";
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
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
}

function StatCard({ label, value, icon, description, trend }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-stylo-gold/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-stylo-gold/10 flex items-center justify-center text-stylo-gold shadow-sm">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {description && <p className="text-muted-foreground/40 text-[10px] mt-1 uppercase font-bold tracking-wide">{description}</p>}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-500 dark:text-green-400 text-[11px] font-bold bg-green-500/10 px-2.5 py-1 rounded-full mb-1 border border-green-500/10">
            <ArrowUpRight size={12} />
            {trend}
          </div>
        )}
      </div>
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
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground/60 text-sm mt-0.5 font-medium">
            Acompanhe o desempenho da sua página.
          </p>
        </div>

        {/* Locked overlay card */}
        <div className="relative bg-card border border-stylo-gold/20 rounded-2xl p-10 text-center overflow-hidden shadow-xl">
          {/* Blurred mock bars */}
          <div className="absolute inset-0 flex items-end gap-2 px-8 pb-8 opacity-[0.03] dark:opacity-20 blur-sm pointer-events-none">
            {[60, 80, 45, 90, 55, 70, 85].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-stylo-gold rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full bg-stylo-gold/15 border border-stylo-gold/30 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Lock size={24} className="text-stylo-gold" />
            </div>
            <h2 className="text-foreground text-xl font-bold mb-2 tracking-tight">Analytics disponível no PRO</h2>
            <p className="text-muted-foreground/70 text-sm max-w-sm mx-auto mb-6 font-medium">
              Veja quantas pessoas visitaram sua página, em quais links elas clicaram e sua taxa
              de conversão — em tempo real.
            </p>
            <Link href="/dashboard/billing">
              <Button className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-bold px-8 rounded-xl h-11 transition-all active:scale-[0.98]">
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

  // Mock daily data for the area chart
  const dailyData = [
    { name: "Seg", value: 120 },
    { name: "Ter", value: 150 },
    { name: "Qua", value: 450 },
    { name: "Qui", value: 380 },
    { name: "Sex", value: 520 },
    { name: "Sáb", value: 710 },
    { name: "Dom", value: 680 },
  ];

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
    <div className="p-4 sm:p-6 max-w-3xl space-y-5 sm:space-y-6 transition-all duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
        <p className="text-muted-foreground/60 text-sm mt-0.5 font-medium">Desempenho da sua página.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Visualizações"
          value={analytics?.totalViews?.toLocaleString("pt-BR") ?? 0}
          icon={<Eye size={16} />}
          description="Visitas à sua página"
          trend="+12%"
        />
        <StatCard
          label="Cliques"
          value={analytics?.totalClicks?.toLocaleString("pt-BR") ?? 0}
          icon={<MousePointerClick size={16} />}
          description="Em todos os links"
          trend="+8%"
        />
        <StatCard
          label="CTR Médio"
          value={ctrFormatted}
          icon={<TrendingUp size={16} />}
          description="Taxa de conversão"
          trend="+5%"
        />
      </div>

      {/* Evolution Chart */}
      <AnalyticsChart data={dailyData} title="Evolução de Visualizações" />

      {/* Bar chart - Cliques por link */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-foreground font-bold mb-6 tracking-tight">Cliques por link</h2>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground/30 text-sm">
            Nenhum dado disponível ainda.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "currentColor", fontSize: 11, fontWeight: 600 }}
                className="text-muted-foreground/50"
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fill: "currentColor", fontSize: 11, fontWeight: 600 }}
                className="text-muted-foreground/50"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ fontWeight: 700, color: "var(--foreground)", marginBottom: "4px" }}
                cursor={{ fill: "var(--stylo-gold)", opacity: 0.05 }}
              />
              <Bar dataKey="cliques" fill="#D4AF37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
