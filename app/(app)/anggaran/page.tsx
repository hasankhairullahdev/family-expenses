import { getBudgetPageData } from "@/app/actions/budget";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { BudgetCard } from "@/components/budget-card";
import { BudgetCreateButton } from "@/components/budget-create-button";
import { QuickSetClient } from "@/components/budget-quick-set-client";
import { MonthlyBudgetCard } from "@/components/monthly-budget-card";
import { formatRupiah } from "@/lib/format";
import { Wallet, TrendingDown } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function AnggaranPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const now = new Date();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const year = params.year ? parseInt(params.year) : now.getFullYear();

  const { monthlyBudget, budgets, unbudgeted, totalBudget, totalSpent, userSummaries } =
    await getBudgetPageData(month, year);

  const totalRemaining = totalBudget - totalSpent;
  const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-warm-900">
            Anggaran
          </h1>
          <p className="text-sm text-warm-400 mt-1">
            Pantau batas pengeluaran per kategori
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector month={month} year={year} basePath="/anggaran" />
          <BudgetCreateButton
            unbudgetedCategories={unbudgeted}
            month={month}
            year={year}
          />
        </div>
      </div>

      {/* Monthly Budget Card — global budget + allocation per person */}
      <MonthlyBudgetCard data={monthlyBudget} userSummaries={userSummaries} />

      {/* Summary Cards — category budget overview */}
      {totalBudget > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Total Budget */}
          <div className="rounded-2xl bg-white border border-cream-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-maroon-50 border border-maroon-100 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-maroon-600" />
              </div>
              <span className="text-xs text-warm-500 font-medium uppercase tracking-wider">
                Total Anggaran Kategori
              </span>
            </div>
            <p className="text-xl font-bold text-warm-900 font-heading">
              {formatRupiah(totalBudget)}
            </p>
          </div>

          {/* Total Spent */}
          <div className="rounded-2xl bg-white border border-cream-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-xs text-warm-500 font-medium uppercase tracking-wider">
                Terpakai
              </span>
            </div>
            <p className="text-xl font-bold text-red-600 font-heading">
              {formatRupiah(totalSpent)}
            </p>
          </div>

          {/* Remaining */}
          <div className="rounded-2xl bg-white border border-cream-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  totalRemaining >= 0
                    ? "bg-emerald-50 border border-emerald-100"
                    : "bg-red-50 border border-red-100"
                }`}
              >
                <span className="text-sm">{totalRemaining >= 0 ? "✅" : "⚠️"}</span>
              </div>
              <span className="text-xs text-warm-500 font-medium uppercase tracking-wider">
                {totalRemaining >= 0 ? "Sisa" : "Melebihi"}
              </span>
            </div>
            <p className={`text-xl font-bold font-heading ${
              totalRemaining >= 0 ? "text-emerald-600" : "text-red-600"
            }`}>
              {formatRupiah(Math.abs(totalRemaining))}
            </p>
          </div>
        </div>
      )}

      {/* Overall progress bar */}
      {totalBudget > 0 && (
        <div className="rounded-2xl bg-white border border-cream-200 shadow-sm p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-warm-800">Progress Anggaran Kategori</span>
            <span className={`text-sm font-bold ${
              overallPct >= 100 ? "text-red-600" : overallPct >= 80 ? "text-amber-600" : "text-emerald-600"
            }`}>
              {overallPct.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-cream-100 border border-cream-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(overallPct, 100)}%`,
                backgroundColor:
                  overallPct >= 100 ? "#EF4444" : overallPct >= 80 ? "#F59E0B" : "#10B981",
              }}
            />
          </div>
        </div>
      )}

      {/* Budget Cards Grid */}
      {budgets.length > 0 ? (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-maroon-600/30 to-transparent" />
            <span className="text-xs text-warm-400 uppercase tracking-widest font-medium">
              Anggaran Per Kategori
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-maroon-600/30 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} month={month} year={year} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-cream-200 shadow-sm p-10 flex flex-col items-center justify-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6 text-maroon-600" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-warm-800 mb-2">
            Belum Ada Anggaran Kategori
          </h2>
          <p className="text-sm text-warm-400 max-w-xs">
            Tetapkan batas pengeluaran per kategori agar keuangan keluarga lebih terencana.
          </p>
        </div>
      )}

      {/* Unbudgeted Categories */}
      {unbudgeted.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-cream-300 to-transparent" />
            <span className="text-xs text-warm-400 uppercase tracking-widest font-medium">
              Belum Di-set Anggaran
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-cream-300 to-transparent" />
          </div>
          <div className="flex flex-wrap gap-2">
            {unbudgeted.map((cat) => (
              <QuickSetClient
                key={cat.id}
                category={cat}
                month={month}
                year={year}
                allUnbudgeted={unbudgeted}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
