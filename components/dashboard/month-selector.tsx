"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPeriodRange } from "@/lib/period";

export function MonthSelector({
  month,
  year,
  basePath = "/dashboard",
}: {
  month: number;
  year: number;
  basePath?: string;
}) {
  const router = useRouter();

  function navigate(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    router.push(`${basePath}?month=${m}&year=${y}`);
  }

  const { label } = getPeriodRange(month, year);

  return (
    <div className="flex items-center gap-1 rounded-xl bg-cream-100 border border-cream-200 p-1">
      <button
        onClick={() => navigate(-1)}
        className="w-7 h-7 rounded-lg hover:bg-cream-200 flex items-center justify-center text-warm-500 hover:text-warm-800 transition-colors"
        aria-label="Periode sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="px-3 py-1 min-w-[172px] text-center">
        <span className="text-sm font-semibold text-warm-800">{label}</span>
      </div>

      <button
        onClick={() => navigate(1)}
        className="w-7 h-7 rounded-lg hover:bg-cream-200 flex items-center justify-center text-warm-500 hover:text-warm-800 transition-colors"
        aria-label="Periode berikutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
