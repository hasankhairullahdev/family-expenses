import { getTransactions, TransactionWithRelations } from "@/app/actions/transaction";
import { getCategories } from "@/app/actions/category";
import { TransactionFormDialog } from "@/components/transaction-form-dialog";
import { TransactionItem } from "@/components/transaction-item";
import { formatRupiah, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CategoryFilterDropdown } from "@/components/transaction-filter-category";
import { MonthPicker } from "@/components/transaction-filter-month";
import { SearchBar } from "@/components/transaction-search-bar";

export const dynamic = "force-dynamic";

type SearchParams = {
  type?: string;
  categoryId?: string;
  userId?: string;
  month?: string; // "YYYY-MM"
  search?: string;
};

export default async function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Derive date range from month param
  let dateFrom: string | undefined;
  let dateTo: string | undefined;
  if (params.month) {
    const [year, month] = params.month.split("-").map(Number);
    dateFrom = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    dateTo = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
  }

  const filterType =
    params.type === "INCOME" || params.type === "EXPENSE"
      ? (params.type as TransactionWithRelations["type"])
      : "ALL";

  const [transactions, categories, users] = await Promise.all([
    getTransactions({
      type: filterType,
      categoryId: params.categoryId || undefined,
      userId: params.userId || undefined,
      dateFrom,
      dateTo,
      search: params.search || undefined,
    }),
    getCategories(),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  // Summary calculations
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const saldo = totalIncome - totalExpense;

  // Group transactions by date (YYYY-MM-DD key, sorted desc)
  const grouped: Record<string, typeof transactions> = {};
  for (const trx of transactions) {
    const key = new Date(trx.date).toISOString().split("T")[0];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(trx);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Build URL helper (server-side only, for Link hrefs)
  function buildUrl(overrides: Record<string, string | undefined>) {
    const p: Record<string, string> = {};
    if (params.type) p.type = params.type;
    if (params.categoryId) p.categoryId = params.categoryId;
    if (params.userId) p.userId = params.userId;
    if (params.month) p.month = params.month;
    if (params.search) p.search = params.search;
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === "") delete p[k];
      else p[k] = v;
    });
    const qs = new URLSearchParams(p).toString();
    return `/transaksi${qs ? `?${qs}` : ""}`;
  }

  // Current month default for picker
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const hasActiveFilter =
    !!params.type || !!params.categoryId || !!params.userId || !!params.month || !!params.search;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-warm-900">
            Transaksi
          </h1>
          <p className="text-sm text-warm-400 mt-1">
            Catat dan kelola semua pemasukan &amp; pengeluaran keluarga
          </p>
        </div>
        <TransactionFormDialog allCategories={categories} />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Tipe filter */}
        <div className="flex rounded-lg border border-cream-200 bg-white overflow-hidden shadow-sm">
          {[
            { label: "Semua", value: undefined },
            { label: "Pemasukan", value: "INCOME" },
            { label: "Pengeluaran", value: "EXPENSE" },
          ].map((opt) => {
            const isActive =
              opt.value === undefined ? !params.type : params.type === opt.value;
            return (
              <Link
                key={opt.label}
                href={buildUrl({ type: opt.value })}
                className={`px-3 h-8 text-sm flex items-center transition-colors ${
                  isActive
                    ? "bg-maroon-600 text-white"
                    : "text-warm-500 hover:text-warm-800 hover:bg-cream-50"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>

        {/* User filter */}
        <div className="flex rounded-lg border border-cream-200 bg-white overflow-hidden shadow-sm">
          <Link
            href={buildUrl({ userId: undefined })}
            className={`px-3 h-8 text-sm flex items-center transition-colors ${
              !params.userId
                ? "bg-maroon-600 text-white"
                : "text-warm-500 hover:text-warm-800 hover:bg-cream-50"
            }`}
          >
            Semua
          </Link>
          {users.map((u) => {
            const isHasan = u.name?.toLowerCase().includes("hasan");
            const isActive = params.userId === u.id;
            return (
              <Link
                key={u.id}
                href={buildUrl({ userId: isActive ? undefined : u.id })}
                className={`px-3 h-8 text-sm flex items-center transition-colors ${
                  isActive
                    ? isHasan
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                    : "text-warm-500 hover:text-warm-800 hover:bg-cream-50"
                }`}
              >
                {u.name}
              </Link>
            );
          })}
        </div>

        {/* Category filter — Client Component, reads searchParams itself */}
        <CategoryFilterDropdown
          categories={categories}
          current={params.categoryId}
        />

        {/* Month picker — Client Component, reads searchParams itself */}
        <MonthPicker current={params.month ?? ""} currentMonth={currentMonth} />

        {/* Clear filters */}
        {hasActiveFilter && (
          <Link
            href="/transaksi"
            className="px-3 h-8 text-sm flex items-center rounded-lg border border-cream-200 bg-white text-warm-500 hover:text-warm-800 hover:bg-cream-50 transition-colors shadow-sm"
          >
            ✕ Reset
          </Link>
        )}
      </div>

      {/* Search bar — Client Component, reads searchParams itself */}
      <SearchBar current={params.search ?? ""} />

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 mb-6 mt-2">
        <SummaryCard
          label="Pemasukan"
          amount={totalIncome}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50 border-emerald-100"
        />
        <SummaryCard
          label="Pengeluaran"
          amount={totalExpense}
          colorClass="text-red-600"
          bgClass="bg-red-50 border-red-100"
        />
        <SummaryCard
          label="Saldo"
          amount={saldo}
          colorClass={saldo >= 0 ? "text-emerald-600" : "text-red-600"}
          bgClass={saldo >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}
          prefix={saldo >= 0 ? "+" : ""}
        />
      </div>

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <EmptyState hasFilter={hasActiveFilter} />
      ) : (
        <div className="flex flex-col gap-6">
          {sortedDates.map((dateKey) => (
            <section key={dateKey}>
              {/* Date group header */}
              <div className="sticky top-0 z-10 flex items-center gap-3 py-2 mb-2 bg-background/95 backdrop-blur-sm">
                <span className="text-xs font-semibold text-maroon-600 uppercase tracking-wide">
                  {formatDate(dateKey)}
                </span>
                <div className="flex-1 h-px bg-cream-300" />
                <span className="text-xs text-warm-400 tabular-nums">
                  {grouped[dateKey].length} transaksi
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {grouped[dateKey].map((trx) => (
                  <TransactionItem
                    key={trx.id}
                    transaction={trx}
                    allCategories={categories}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({
  label,
  amount,
  colorClass,
  bgClass,
  prefix = "",
}: {
  label: string;
  amount: number;
  colorClass: string;
  bgClass: string;
  prefix?: string;
}) {
  return (
    <div className={`rounded-xl border p-3 flex flex-col gap-1 ${bgClass}`}>
      <span className="text-xs text-warm-500">{label}</span>
      <span className={`text-sm font-bold tabular-nums truncate ${colorClass}`}>
        {prefix}{formatRupiah(Math.abs(amount))}
      </span>
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="rounded-2xl bg-white border border-dashed border-cream-300 p-12 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-maroon-50 border border-maroon-100 flex items-center justify-center mb-4">
        <span className="text-2xl">📋</span>
      </div>
      <h2 className="font-heading text-base font-semibold text-warm-800 mb-2">
        {hasFilter ? "Tidak ada transaksi" : "Belum ada transaksi"}
      </h2>
      <p className="text-sm text-warm-400 max-w-xs">
        {hasFilter
          ? "Tidak ada transaksi yang sesuai dengan filter aktif. Coba ubah atau reset filter."
          : 'Belum ada catatan transaksi. Klik "+ Tambah Transaksi" untuk mulai mencatat.'}
      </p>
    </div>
  );
}
