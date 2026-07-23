import { getCategories } from "@/app/actions/category";
import { CategoryFormDialog } from "@/components/category-form-dialog";
import { CategoryCard } from "@/components/category-card";

export const dynamic = "force-dynamic";

export default async function KategoriPage() {
  const categories = await getCategories();

  const expenses = categories.filter((c) => c.type === "EXPENSE");
  const incomes = categories.filter((c) => c.type === "INCOME");

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-surface-50">
            Kategori
          </h1>
          <p className="text-sm text-surface-100/40 mt-1">
            Kelola kategori transaksi — default maupun custom buatanmu
          </p>
        </div>
        <CategoryFormDialog />
      </div>

      {/* Pengeluaran section */}
      <section className="mb-10">
        <SectionHeader
          label="Pengeluaran"
          count={expenses.length}
          color="text-red-400"
        />
        {expenses.length === 0 ? (
          <EmptyState label="pengeluaran" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {expenses.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* Pemasukan section */}
      <section>
        <SectionHeader
          label="Pemasukan"
          count={incomes.length}
          color="text-emerald-400"
        />
        {incomes.length === 0 ? (
          <EmptyState label="pemasukan" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {incomes.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className={`font-heading text-base font-semibold ${color}`}>
        {label}
      </span>
      <span className="text-xs text-surface-100/40 tabular-nums">
        {count} kategori
      </span>
      {/* decorative maroon line */}
      <div className="flex-1 h-px bg-maroon-700/40" />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/8 bg-surface-900/40 p-6 text-center text-sm text-surface-100/30">
      Belum ada kategori {label} custom. Klik "+ Tambah Kategori" untuk membuat.
    </div>
  );
}
