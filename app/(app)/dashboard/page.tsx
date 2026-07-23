import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import {
  getDashboardSummary,
  getMonthlyChart,
  getCategoryBreakdown,
  getRecentTransactions,
  getOverBudgetAlerts,
  getUserSummaries,
} from "@/app/actions/dashboard";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { MonthlyBarChart } from "@/components/dashboard/monthly-bar-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { OverBudgetBanner } from "@/components/dashboard/over-budget-banner";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { UserAvatar } from "@/components/user-avatar";
import { UserSummaryCards } from "@/components/dashboard/user-summary-cards";

export const dynamic = "force-dynamic";

// ── Skeleton loaders ──────────────────────────────────────────────────────────

function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div
      className="rounded-xl bg-cream-100 animate-pulse w-full"
      style={{ height }}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type SearchParams = { month?: string; year?: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? "User";

  const params = await searchParams;
  const now = new Date();
  const month = Math.min(
    12,
    Math.max(1, parseInt(params.month ?? String(now.getMonth() + 1), 10)) || now.getMonth() + 1
  );
  const year = parseInt(params.year ?? String(now.getFullYear()), 10) || now.getFullYear();

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam";

  // Parallel data fetch
  const [summary, monthlyChart, categoryBreakdown, recentTransactions, overBudget, userSummaries] =
    await Promise.all([
      getDashboardSummary(month, year),
      getMonthlyChart(6),
      getCategoryBreakdown(month, year, "EXPENSE"),
      getRecentTransactions(5),
      getOverBudgetAlerts(month, year),
      getUserSummaries(month, year),
    ]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-warm-400 mb-0.5">{greeting},</p>
          <h1 className="font-heading text-2xl font-bold text-warm-900">
            {userName} 👋
          </h1>
          <p className="text-xs text-warm-400 mt-1">
            Ringkasan keuangan keluarga
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector month={month} year={year} />
          <UserAvatar name={userName} size="lg" />
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <SummaryCards summary={summary} />

      {/* ── Over Budget Banner ── */}
      <OverBudgetBanner items={overBudget} />

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Monthly bar chart */}
        <div className="lg:col-span-3 rounded-2xl bg-white border border-cream-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-base font-semibold text-warm-800">
                Tren Bulanan
              </h2>
              <p className="text-xs text-warm-400 mt-0.5">
                Pemasukan vs Pengeluaran 6 bulan terakhir
              </p>
            </div>
          </div>
          <Suspense fallback={<ChartSkeleton height={260} />}>
            <MonthlyBarChart data={monthlyChart} />
          </Suspense>
        </div>

        {/* Category pie chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-cream-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-base font-semibold text-warm-800">
                Pengeluaran per Kategori
              </h2>
              <p className="text-xs text-warm-400 mt-0.5">
                Bulan ini
              </p>
            </div>
          </div>
          <Suspense fallback={<ChartSkeleton height={260} />}>
            <CategoryPieChart data={categoryBreakdown} />
          </Suspense>
        </div>
      </div>

      {/* ── Per-User Summary ── */}
      <UserSummaryCards users={userSummaries} />

      {/* ── Recent Transactions ── */}
      <RecentTransactions transactions={recentTransactions} />

      {/* ── Quick stats footer ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickStat
          label="Jumlah Transaksi"
          value={String(summary.transactionCount)}
          unit="transaksi"
        />
        <QuickStat
          label="Rata-rata Pengeluaran"
          value={
            summary.transactionCount > 0
              ? formatShort(summary.totalExpense / summary.transactionCount)
              : "—"
          }
          unit="per transaksi"
        />
        <QuickStat
          label="Terbesar Pengeluaran"
          value={categoryBreakdown[0]?.categoryName ?? "—"}
          unit={
            categoryBreakdown[0]
              ? `${categoryBreakdown[0].percentage}% dari total`
              : "belum ada data"
          }
        />
        <QuickStat
          label="Status Anggaran"
          value={overBudget.length > 0 ? `${overBudget.length} over` : "Aman"}
          unit={overBudget.length > 0 ? "kategori melebihi limit" : "semua dalam batas"}
          highlight={overBudget.length > 0 ? "warning" : "ok"}
        />
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function formatShort(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value}`;
}

function QuickStat({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: "ok" | "warning";
}) {
  return (
    <div className="rounded-xl bg-white border border-cream-200 shadow-sm p-4">
      <p className="text-[11px] text-warm-400 uppercase tracking-wide mb-2">{label}</p>
      <p
        className={`text-base font-bold font-heading truncate ${
          highlight === "ok"
            ? "text-emerald-600"
            : highlight === "warning"
              ? "text-orange-500"
              : "text-warm-800"
        }`}
      >
        {value}
      </p>
      <p className="text-[11px] text-warm-400 mt-0.5 truncate">{unit}</p>
    </div>
  );
}
