"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getPeriodRange, getCurrentPeriod } from "@/lib/period";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  month: number;
  year: number;
};

export function MonthPicker({ month, year }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function buildUrl(m: number, y: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("month", String(m));
    p.set("year", String(y));
    return `/transaksi?${p}`;
  }

  function navigate(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    router.push(buildUrl(d.getMonth() + 1, d.getFullYear()));
  }

  const current = getCurrentPeriod();
  const isCurrentPeriod = month === current.month && year === current.year;
  const { label } = getPeriodRange(month, year);

  return (
    <div className="flex items-center gap-1 rounded-lg border border-cream-200 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => navigate(-1)}
        className="px-2 h-8 text-warm-400 hover:text-warm-800 hover:bg-cream-50 transition-colors"
        aria-label="Periode sebelumnya"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <span className="px-1 text-sm text-warm-600 whitespace-nowrap">{label}</span>
      <button
        onClick={() => navigate(1)}
        disabled={isCurrentPeriod}
        className="px-2 h-8 text-warm-400 hover:text-warm-800 hover:bg-cream-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Periode berikutnya"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
