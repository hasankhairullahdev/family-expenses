import { getLaporanData } from "@/app/actions/dashboard";
import { getCurrentPeriod } from "@/lib/period";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { formatRupiah } from "@/lib/format";
import type { LaporanCategoryRow } from "@/app/actions/dashboard";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function LaporanPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activePeriod = getCurrentPeriod();
  const month = params.month ? parseInt(params.month) : activePeriod.month;
  const year = params.year ? parseInt(params.year) : activePeriod.year;

  const { periodLabel, totalIncome, totalExpense, expenseByCategory, incomeByCategory } =
    await getLaporanData(month, year);

  const saldo = totalIncome - totalExpense;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-warm-900">Laporan</h1>
          <p className="text-sm text-warm-400 mt-1">Ringkasan keuangan per kategori</p>
        </div>
        <MonthSelector month={month} year={year} basePath="/laporan" />
      </div>

      {/* Period label */}
      <p className="text-xs text-warm-400 mb-5 font-medium">Periode: {periodLabel}</p>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="rounded-2xl bg-white border border-cream-200 shadow-sm p-4">
          <p className="text-[10px] text-warm-400 uppercase tracking-wider mb-1">Pemasukan</p>
          <p className="text-lg font-bold text-emerald-600 font-heading">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-cream-200 shadow-sm p-4">
          <p className="text-[10px] text-warm-400 uppercase tracking-wider mb-1">Pengeluaran</p>
          <p className="text-lg font-bold text-red-600 font-heading">{formatRupiah(totalExpense)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-cream-200 shadow-sm p-4">
          <p className="text-[10px] text-warm-400 uppercase tracking-wider mb-1">Saldo</p>
          <p className={`text-lg font-bold font-heading ${saldo >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {saldo >= 0 ? "+" : ""}{formatRupiah(Math.abs(saldo))}
          </p>
        </div>
      </div>

      {/* Expense by category */}
      <CategorySection
        title="Pengeluaran per Kategori"
        rows={expenseByCategory}
        total={totalExpense}
        emptyMsg="Belum ada pengeluaran periode ini"
        accentColor="text-red-600"
        barColor="#EF4444"
      />

      {/* Income by category */}
      <CategorySection
        title="Pemasukan per Kategori"
        rows={incomeByCategory}
        total={totalIncome}
        emptyMsg="Belum ada pemasukan periode ini"
        accentColor="text-emerald-600"
        barColor="#10B981"
      />
    </div>
  );
}

function CategorySection({
  title,
  rows,
  total,
  emptyMsg,
  accentColor,
  barColor,
}: {
  title: string;
  rows: LaporanCategoryRow[];
  total: number;
  emptyMsg: string;
  accentColor: string;
  barColor: string;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className={`font-heading text-sm font-semibold ${accentColor}`}>{title}</span>
        <div className="flex-1 h-px bg-cream-200" />
        <span className="text-xs text-warm-400">{formatRupiah(total)}</span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-cream-200 p-6 text-center text-sm text-warm-400">
          {emptyMsg}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-cream-200 shadow-sm overflow-hidden">
          {rows.map((row, idx) => (
            <div
              key={row.categoryId}
              className={`flex items-center gap-3 px-4 py-3 ${idx !== rows.length - 1 ? "border-b border-cream-100" : ""}`}
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 border border-cream-100"
                style={{ backgroundColor: `${row.categoryColor}18` }}
              >
                {row.categoryIcon}
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-warm-800 truncate">{row.categoryName}</span>
                  <span className="text-xs text-warm-400 ml-2 shrink-0">{row.transactionCount}x</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-cream-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${row.percentage}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>

              {/* Amount + pct */}
              <div className="text-right shrink-0 ml-2">
                <p className="text-sm font-semibold text-warm-800">{formatRupiah(row.totalAmount)}</p>
                <p className="text-[10px] text-warm-400">{row.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
