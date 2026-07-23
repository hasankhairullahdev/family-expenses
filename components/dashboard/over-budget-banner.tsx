"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import type { OverBudgetItem } from "@/app/actions/dashboard";

export function OverBudgetBanner({ items }: { items: OverBudgetItem[] }) {
  const [dismissed, setDismissed] = useState(false);

  if (items.length === 0 || dismissed) return null;

  return (
    <div className="relative rounded-2xl bg-red-50 border border-red-200 p-4 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-400 rounded-t-2xl" />

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-red-100 hover:bg-red-200 border border-red-200 flex items-center justify-center transition-colors"
        aria-label="Tutup peringatan"
      >
        <X className="w-3.5 h-3.5 text-red-500" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3 pr-8">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700">
            ⚠️ {items.length} Kategori Melebihi Anggaran
          </p>
          <p className="text-xs text-red-500">
            Pengeluaran beberapa kategori sudah melampaui batas yang ditetapkan
          </p>
        </div>
      </div>

      {/* Category list */}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.categoryId}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-red-200"
          >
            <span className="text-sm">{item.categoryIcon}</span>
            <div>
              <p className="text-xs font-semibold text-red-700">{item.categoryName}</p>
              <p className="text-[10px] text-warm-500">
                {formatRupiah(item.spentAmount)} / {formatRupiah(item.budgetAmount)}
                <span className="ml-1 text-orange-600 font-bold">
                  +{item.overByPercent}%
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
