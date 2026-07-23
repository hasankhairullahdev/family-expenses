"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  current: string; // "YYYY-MM" or ""
  currentMonth: string; // today's "YYYY-MM"
};

export function MonthPicker({ current, currentMonth }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function buildUrl(month: string | undefined) {
    const p = new URLSearchParams(searchParams.toString());
    if (month) p.set("month", month);
    else p.delete("month");
    return `/transaksi${p.size ? `?${p}` : ""}`;
  }

  return (
    <input
      type="month"
      value={current}
      max={currentMonth}
      onChange={(e) => router.push(buildUrl(e.target.value || undefined))}
      className="h-8 rounded-lg border border-cream-200 bg-white px-2.5 text-sm text-warm-600 focus:outline-none focus:border-maroon-600 hover:bg-cream-50 transition-colors cursor-pointer"
      placeholder="Bulan"
      title="Filter bulan"
    />
  );
}
