import Link from "next/link";
import { formatRupiah, formatDateShort } from "@/lib/format";
import type { RecentTransaction } from "@/app/actions/dashboard";

function UserBadge({ name }: { name: string | null }) {
  if (!name) return null;
  const isHasan = name.toLowerCase().includes("hasan");
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
        isHasan
          ? "bg-blue-50 text-blue-600 border border-blue-100"
          : "bg-purple-50 text-purple-600 border border-purple-100"
      }`}
    >
      {name.split(" ")[0]}
    </span>
  );
}

export function RecentTransactions({
  transactions,
}: {
  transactions: RecentTransaction[];
}) {
  return (
    <div className="rounded-2xl bg-white border border-cream-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-base font-semibold text-warm-800">
          Transaksi Terbaru
        </h2>
        <Link
          href="/transaksi"
          className="text-xs font-medium text-maroon-600 hover:text-maroon-800 transition-colors"
        >
          Lihat Semua →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-cream-100 border border-cream-200 flex items-center justify-center mb-3">
            <span className="text-lg">📋</span>
          </div>
          <p className="text-sm text-warm-400">Belum ada transaksi</p>
          <Link
            href="/transaksi"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-maroon-600 hover:bg-maroon-700 text-xs font-semibold text-white transition-colors shadow-sm"
          >
            + Tambah Transaksi
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-cream-100">
          {transactions.map((trx) => (
            <div key={trx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              {/* Category icon */}
              <div
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base border border-cream-200"
                style={{ backgroundColor: `${trx.category.color}18` }}
              >
                {trx.category.icon}
              </div>

              {/* Description + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-800 truncate">
                  {trx.description || trx.category.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-warm-400">
                    {formatDateShort(trx.date)}
                  </span>
                  <span className="text-warm-300">·</span>
                  <UserBadge name={trx.user.name} />
                </div>
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 text-right">
                <p
                  className={`text-sm font-semibold tabular-nums ${
                    trx.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {trx.type === "INCOME" ? "+" : "-"}
                  {formatRupiah(trx.amount)}
                </p>
                <p className="text-[11px] text-warm-400 mt-0.5">
                  {trx.category.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
