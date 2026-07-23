"use client";

import { useState, useTransition } from "react";
import { setBudget, type BudgetWithStats, type UnbudgetedCategory } from "@/app/actions/budget";
import { formatRupiah } from "@/lib/format";

interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  month: number;
  year: number;
  unbudgetedCategories?: UnbudgetedCategory[];
  budget?: BudgetWithStats;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function BudgetFormDialog({
  open,
  onOpenChange,
  mode,
  month,
  year,
  unbudgetedCategories = [],
  budget,
}: BudgetFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    mode === "edit" ? budget?.category.id ?? "" : ""
  );
  const [amount, setAmount] = useState(
    mode === "edit" ? String(budget?.amount ?? "") : ""
  );
  const [error, setError] = useState("");

  function handleClose() {
    if (isPending) return;
    setError("");
    if (mode === "create") {
      setSelectedCategoryId("");
      setAmount("");
    }
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const categoryId = mode === "edit" ? (budget?.category.id ?? "") : selectedCategoryId;
    // Strip semua titik (separator ribuan id-ID) dan koma, lalu parse
    const numAmount = parseFloat(amount.replace(/\./g, "").replace(/,/g, ""));

    if (!categoryId) {
      setError("Pilih kategori terlebih dahulu.");
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setError("Nominal harus lebih dari 0.");
      return;
    }

    startTransition(async () => {
      const res = await setBudget(categoryId, month, year, numAmount);
      if (res.success) {
        handleClose();
      } else {
        setError(res.error ?? "Gagal menyimpan anggaran.");
      }
    });
  }

  function handleAmountChange(val: string) {
    const numeric = val.replace(/\D/g, "");
    setAmount(numeric ? Number(numeric).toLocaleString("id-ID") : "");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-cream-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl">

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading text-xl font-bold text-warm-900">
              {mode === "create" ? "Set Anggaran" : "Edit Anggaran"}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-maroon-100 text-maroon-700">
              Keluarga
            </span>
          </div>
          <p className="text-xs text-warm-400">
            {MONTH_NAMES[month - 1]} {year}
          </p>
        </div>

        <div className="h-px bg-gradient-to-r from-maroon-600/30 via-gold-400/30 to-transparent mb-4" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Category selector */}
          {mode === "create" ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-warm-600 uppercase tracking-wider">
                Kategori
              </label>
              {unbudgetedCategories.length === 0 ? (
                <p className="text-sm text-warm-400 italic">
                  Semua kategori sudah di-set anggaran.
                </p>
              ) : (
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full rounded-xl bg-cream-50 border border-cream-200 text-warm-800 text-sm px-3 py-2.5 focus:outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-500/20 appearance-none cursor-pointer"
                  required
                >
                  <option value="">-- Pilih kategori --</option>
                  {unbudgetedCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-cream-50 border border-cream-200 px-3 py-2.5">
              <span className="text-xl">{budget?.category.icon}</span>
              <span className="text-sm font-medium text-warm-800">{budget?.category.name}</span>
            </div>
          )}

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-warm-600 uppercase tracking-wider">
              Nominal Anggaran
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-400 font-medium pointer-events-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl bg-cream-50 border border-cream-200 text-warm-900 text-sm pl-9 pr-3 py-2.5 focus:outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-500/20 placeholder:text-warm-300"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-maroon-700 bg-maroon-50 border border-maroon-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-xl border border-cream-200 text-sm text-warm-600 hover:bg-cream-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending || (mode === "create" && unbudgetedCategories.length === 0)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-maroon-600 hover:bg-maroon-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
