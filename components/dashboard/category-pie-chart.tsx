"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CategoryBreakdownItem } from "@/app/actions/dashboard";

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
}: {
  active?: boolean;
  payload?: Array<{ payload: CategoryBreakdownItem }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl bg-white border border-cream-200 p-3 shadow-xl text-xs min-w-[160px]">
      <p className="text-warm-800 font-semibold mb-1">
        {item.categoryIcon} {item.categoryName}
      </p>
      <p className="text-warm-600">{formatRupiah(item.amount)}</p>
      <p className="text-warm-400">{item.percentage}% dari total</p>
    </div>
  );
}

export function CategoryPieChart({ data }: { data: CategoryBreakdownItem[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-warm-300 text-sm">
        Belum ada pengeluaran bulan ini
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="amount"
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.categoryColor} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2 px-2">
        {data.map((item) => (
          <div key={item.categoryId} className="flex items-center gap-2 min-w-0">
            <span
              className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.categoryColor }}
            />
            <span className="text-xs text-warm-500 truncate">
              {item.categoryIcon} {item.categoryName}
            </span>
            <span className="ml-auto flex-shrink-0 text-xs font-medium text-warm-700">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
