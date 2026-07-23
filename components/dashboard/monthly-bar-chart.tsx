"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyChartItem } from "@/app/actions/dashboard";

function formatRupiahShort(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value}`;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("IDR", "Rp")
    .trim();
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white border border-cream-200 p-3 shadow-xl text-xs min-w-[160px]">
      <p className="text-warm-800 font-semibold mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-mono text-warm-700">{formatRupiah(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyBarChart({ data }: { data: MonthlyChartItem[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-warm-300 text-sm">
        Belum ada data transaksi
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: -8, bottom: 0 }}
        barCategoryGap="30%"
        barGap={3}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="rgba(0,0,0,0.06)"
        />
        <XAxis
          dataKey="label"
          tick={{ fill: "#6b5f50", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatRupiahShort}
          tick={{ fill: "#8c7f6e", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={72}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 12, color: "#8c7f6e" }}
        />
        <Bar
          dataKey="income"
          name="Pemasukan"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          dataKey="expense"
          name="Pengeluaran"
          fill="#9b1c1c"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
