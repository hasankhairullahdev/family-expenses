import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import type { DashboardSummary } from "@/app/actions/dashboard";

function pctChange(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((current - prev) / prev) * 100);
}

function TrendBadge({
  current,
  prev,
  invertColor = false,
}: {
  current: number;
  prev: number;
  invertColor?: boolean;
}) {
  const pct = pctChange(current, prev);
  if (pct === null) {
    return (
      <span className="flex items-center gap-1 text-xs text-warm-400">
        <Minus className="w-3 h-3" />
        Belum ada data bulan lalu
      </span>
    );
  }

  const isUp = pct >= 0;
  const isPositive = invertColor ? !isUp : isUp;
  const color = isPositive ? "text-emerald-600" : "text-red-500";
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {Math.abs(pct)}% vs bulan lalu
    </span>
  );
}

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const { totalIncome, totalExpense, balance, prevTotalIncome, prevTotalExpense } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Income */}
      <div className="relative rounded-2xl bg-white border border-cream-200 shadow-sm p-5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-t-2xl" />
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-semibold text-warm-400 uppercase tracking-widest">
            Total Pemasukan
          </p>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <p className="font-heading text-2xl font-bold text-warm-900 mb-2 tabular-nums truncate">
          {formatRupiah(totalIncome)}
        </p>
        <TrendBadge current={totalIncome} prev={prevTotalIncome} />
      </div>

      {/* Expense */}
      <div className="relative rounded-2xl bg-white border border-cream-200 shadow-sm p-5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-maroon-600 to-maroon-400 rounded-t-2xl" />
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-semibold text-warm-400 uppercase tracking-widest">
            Total Pengeluaran
          </p>
          <div className="w-9 h-9 rounded-xl bg-maroon-50 border border-maroon-100 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-maroon-600" />
          </div>
        </div>
        <p className="font-heading text-2xl font-bold text-warm-900 mb-2 tabular-nums truncate">
          {formatRupiah(totalExpense)}
        </p>
        <TrendBadge current={totalExpense} prev={prevTotalExpense} invertColor />
      </div>

      {/* Balance */}
      <div className="relative rounded-2xl bg-gradient-to-br from-maroon-600 to-maroon-800 shadow-lg shadow-maroon-600/20 p-5 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 80% 20%, #D4AF37 0%, transparent 50%)"
          }}
        />
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-semibold text-maroon-200 uppercase tracking-widest">
            Saldo Bersih
          </p>
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-gold-300" />
          </div>
        </div>
        <p
          className={`font-heading text-2xl font-bold mb-2 tabular-nums truncate ${
            balance >= 0 ? "text-gold-300" : "text-red-300"
          }`}
        >
          {balance < 0 ? "-" : ""}{formatRupiah(Math.abs(balance))}
        </p>
        <span className="text-xs text-maroon-200">
          {balance >= 0 ? "✨ Surplus bulan ini" : "⚠️ Defisit bulan ini"}
        </span>
      </div>
    </div>
  );
}
