"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { setMonthlyBudget } from "@/app/actions/budget";
import type { MonthlyBudgetData, UserAllocationSummary } from "@/app/actions/budget";

interface Props {
  data: MonthlyBudgetData;
  userSummaries: UserAllocationSummary[];
}

export function MonthlyBudgetCard({ data, userSummaries }: Props) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [hasanAlloc, setHasanAlloc] = useState(
    data.hasanAlloc > 0 ? String(data.hasanAlloc) : ""
  );
  const [liaAlloc, setLiaAlloc] = useState(
    data.liaAlloc > 0 ? String(data.liaAlloc) : ""
  );
  const [error, setError] = useState<string | null>(null);

  // familyTotal = total pemasukan (otomatis dari server)
  const hasIncome = data.familyTotal > 0;
  const totalAlloc = data.hasanAlloc + data.liaAlloc;
  const unallocated = data.familyTotal - totalAlloc;

  function handleSave() {
    const ha = parseFloat(hasanAlloc) || 0;
    const la = parseFloat(liaAlloc) || 0;
    if (ha < 0 || la < 0) {
      setError("Nominal tidak boleh negatif.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await setMonthlyBudget(data.month, data.year, ha, la);
      if (res.success) {
        setEditing(false);
      } else {
        setError(res.error ?? "Gagal menyimpan.");
      }
    });
  }

  function handleCancel() {
    setHasanAlloc(data.hasanAlloc > 0 ? String(data.hasanAlloc) : "");
    setLiaAlloc(data.liaAlloc > 0 ? String(data.liaAlloc) : "");
    setError(null);
    setEditing(false);
  }

  return (
    <div className="rounded-2xl bg-white border border-cream-200 shadow-sm overflow-hidden mb-8">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-cream-100 bg-gradient-to-r from-maroon-50 to-cream-50">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-left"
        >
          <span className="text-base font-semibold font-heading text-maroon-800">
            💰 Budget Bulanan Keluarga
          </span>
          {hasIncome && (
            <span className="text-xs font-medium text-maroon-600 bg-maroon-50 border border-maroon-100 px-2 py-0.5 rounded-full">
              {formatRupiah(data.familyTotal)}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-warm-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-warm-400" />
          )}
        </button>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-maroon-700 hover:bg-maroon-50 border border-maroon-100 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            {data.hasanAlloc > 0 || data.liaAlloc > 0 ? "Edit Alokasi" : "Set Alokasi"}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-maroon-700 text-white hover:bg-maroon-800 disabled:opacity-50 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Simpan
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-warm-600 hover:bg-cream-100 border border-cream-200 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Batal
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-5">
          {/* Total pemasukan — selalu tampil, read-only */}
          <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <span className="text-emerald-600 text-lg">💵</span>
            <div>
              <p className="text-xs text-emerald-700 font-medium">Total Pemasukan Periode Ini</p>
              <p className="text-base font-bold text-emerald-700 font-heading">
                {hasIncome ? formatRupiah(data.familyTotal) : "Belum ada pemasukan"}
              </p>
            </div>
            <span className="ml-auto text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              otomatis
            </span>
          </div>

          {editing ? (
            /* ── Edit form ── */
            <div className="space-y-4">
              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hasan Alloc */}
                <div>
                  <label className="block text-xs font-medium text-warm-600 mb-1.5">
                    Alokasi Hasan
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-warm-400 font-medium">
                      Rp
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={hasanAlloc}
                      onChange={(e) => setHasanAlloc(e.target.value)}
                      placeholder="4000000"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-cream-300 rounded-xl bg-cream-50 focus:outline-none focus:ring-2 focus:ring-maroon-400 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Lia Alloc */}
                <div>
                  <label className="block text-xs font-medium text-warm-600 mb-1.5">
                    Alokasi Lia
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-warm-400 font-medium">
                      Rp
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={liaAlloc}
                      onChange={(e) => setLiaAlloc(e.target.value)}
                      placeholder="4000000"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-cream-300 rounded-xl bg-cream-50 focus:outline-none focus:ring-2 focus:ring-maroon-400 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Live allocation check vs pemasukan */}
              {hasIncome && (
                <div className="flex items-center gap-2 text-xs">
                  {(() => {
                    const ha = parseFloat(hasanAlloc) || 0;
                    const la = parseFloat(liaAlloc) || 0;
                    const diff = data.familyTotal - ha - la;
                    if (diff === 0)
                      return <span className="text-emerald-600 font-medium">✅ Alokasi pas dengan pemasukan</span>;
                    if (diff > 0)
                      return <span className="text-amber-600 font-medium">⚠️ Sisa belum dialokasikan: {formatRupiah(diff)}</span>;
                    return <span className="text-red-500 font-medium">❌ Alokasi melebihi pemasukan: {formatRupiah(Math.abs(diff))}</span>;
                  })()}
                </div>
              )}
            </div>
          ) : (
            /* ── View mode ── */
            <div className="space-y-4">
              {/* Allocation bars */}
              {(data.hasanAlloc > 0 || data.liaAlloc > 0) ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userSummaries.map((u) => {
                      const spentPct = u.alloc > 0 ? Math.min((u.actualSpent / u.alloc) * 100, 100) : 0;
                      const overSpent = u.actualSpent > u.alloc && u.alloc > 0;
                      return (
                        <div key={u.userId} className="rounded-xl bg-cream-50 border border-cream-200 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-warm-800">{u.name}</span>
                            <span className="text-xs text-warm-500">
                              Alokasi: <span className="font-semibold text-warm-800">{formatRupiah(u.alloc)}</span>
                            </span>
                          </div>

                          <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden mb-2">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${spentPct}%`,
                                backgroundColor: overSpent ? "#EF4444" : spentPct >= 80 ? "#F59E0B" : "#10B981",
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs text-warm-500">
                            <span>
                              Terpakai:{" "}
                              <span className={`font-medium ${overSpent ? "text-red-600" : "text-warm-700"}`}>
                                {formatRupiah(u.actualSpent)}
                              </span>
                            </span>
                            <span>
                              Sisa:{" "}
                              <span className={`font-medium ${overSpent ? "text-red-600" : "text-emerald-600"}`}>
                                {formatRupiah(Math.max(u.alloc - u.actualSpent, 0))}
                              </span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Unallocated note */}
                  {hasIncome && unallocated !== 0 && (
                    <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
                      unallocated > 0
                        ? "bg-amber-50 border-amber-100 text-amber-700"
                        : "bg-red-50 border-red-100 text-red-600"
                    }`}>
                      {unallocated > 0 ? "⚠️" : "❌"}
                      {unallocated > 0
                        ? `${formatRupiah(unallocated)} dari pemasukan belum dialokasikan`
                        : `Alokasi melebihi pemasukan sebesar ${formatRupiah(Math.abs(unallocated))}`}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <p className="text-sm text-warm-400 mb-3">
                    Belum ada alokasi per orang. Klik <strong>Set Alokasi</strong> untuk menetapkan.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
