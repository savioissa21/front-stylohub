"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsChartProps {
  data: { name: string; value: number }[];
  title: string;
}

export function AnalyticsChart({ data, title }: AnalyticsChartProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm transition-all duration-300">
      <h2 className="text-foreground font-bold mb-6 tracking-tight">{title}</h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-60 text-muted-foreground/30 text-sm">
          Nenhum dado disponível ainda.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              itemStyle={{ color: "#D4AF37", fontWeight: 600 }}
              cursor={{ stroke: "rgba(212,175,55,0.2)", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#D4AF37"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
