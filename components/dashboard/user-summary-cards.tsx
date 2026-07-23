"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import type { UserDashboardSummary } from "@/app/actions/dashboard";

interface Props {
  users: UserDashboardSummary[];
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors: Record<string, string> = {
    H: "bg-maroon-100 text-maroon-700 border-maroon-200",
    L: "bg-gold-100 text-gold-700 border-gold-200",
  };
  const key = initials[0] ?? "H";
  const colorClass = colors[key] ?? "bg-cream-200 text-warm-700 border-cream-300";

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 ${colorClass}`}>
      {initials}
    </div>
  );
}

function UserCard({ u }: { u: UserDashboardSummary }) {
  const [expanded, setExpanded] = useState(false);

  const hasAlloc = u.alloc > 0;
  const spentPct = hasAlloc ? Math.min((u.totalExpense / u.alloc) * 100, 100) : 0;
  const isOver = hasAlloc && u.totalExpense > u.alloc;
  const progressColor = isOver ? "#EF4444" : spentPct >= 80 ? "#F59E0B" : "#10B981";

  const showExpand = u.allCategories.length > 3;
  const displayedCategories = expanded ? u.allCategories : u.topCategories;

  return (
    <div className="rounded-2xl bg-white border border-cream-200 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar name={u.name} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-warm-900 font-heading">{u.name}</p>
          {hasAlloc ? (
            <p className="text-xs text-warm-400">
              Alokasi: <span className="font-medium text-warm-600">{formatRupiah(u.alloc)}</span>
            </p>
          ) : (
            <p className="text-xs text-warm-300 italic">Alokasi belum di-set</p>
          )}
        </div>
      </div>

      {/* Income / Expense row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5">
          <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium mb-0.5">Pemasukan</p>
          <p className="text-sm font-bold text-emerald-700">{formatRupiah(u.totalIncome)}</p>
        </div>
        <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
          <p className="text-[10px] text-red-500 uppercase tracking-wider font-medium mb-0.5">Pengeluaran</p>
          <p className="text-sm font-bold text-red-600">{formatRupiah(u.totalExpense)}</p>
        </div>
      </div>

      {/* Alloc progress bar */}
      {hasAlloc && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-warm-500">{isOver ? "⚠️ Melebihi alokasi" : "Sisa alokasi"}</span>
            <span className="font-semibold" style={{ color: progressColor }}>
              {spentPct.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-cream-100 border border-cream-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${spentPct}%`, backgroundColor: progressColor }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-warm-400 mt-1">
            <span>Terpakai {formatRupiah(u.totalExpense)}</span>
            <span className="font-medium" style={{ color: progressColor }}>
              {isOver
                ? `Lebih ${formatRupiah(u.totalExpense - u.alloc)}`
                : `Sisa ${formatRupiah(u.remaining)}`}
            </span>
          </div>
        </div>
      )}

      {/* Categories */}
      {u.allCategories.length > 0 && (
        <div>
          <p className="text-[10px] text-warm-400 uppercase tracking-wider font-medium mb-2">
            {expanded ? "Semua Kategori" : "Top Kategori"}
          </p>
          <div className="flex flex-col gap-1.5">
            {displayedCategories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm w-5 text-center">{cat.categoryIcon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-warm-700 truncate">{cat.categoryName}</span>
                    <span className="text-xs font-medium text-warm-600 ml-2 shrink-0">
                      {formatRupiah(cat.amount)}
                    </span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-cream-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.categoryColor }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-warm-400 w-7 text-right shrink-0">
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>

          {/* Expand/collapse button */}
          {showExpand && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-warm-400 hover:text-maroon-600 transition-colors py-1"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Sembunyikan
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Lihat semua {u.allCategories.length} kategori
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {u.allCategories.length === 0 && (
        <p className="text-xs text-warm-300 italic text-center py-2">Belum ada transaksi periode ini</p>
      )}
    </div>
  );
}

export function UserSummaryCards({ users }: Props) {
  if (users.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-maroon-600/30 to-transparent" />
        <span className="text-xs text-warm-400 uppercase tracking-widest font-medium">Laporan Per Anggota</span>
        <div className="h-px flex-1 bg-gradient-to-l from-maroon-600/30 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {users.map((u) => (
          <UserCard key={u.userId} u={u} />
        ))}
      </div>
    </div>
  );
}
