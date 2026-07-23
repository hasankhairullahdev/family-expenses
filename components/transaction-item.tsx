"use client";

import * as React from "react";
type TransactionType = "INCOME" | "EXPENSE";
import { Button } from "@/components/ui/button";
import { TransactionFormDialog } from "@/components/transaction-form-dialog";
import { deleteTransaction, type TransactionWithRelations } from "@/app/actions/transaction";
import { formatRupiah, formatDateShort } from "@/lib/format";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
};

type Props = {
  transaction: TransactionWithRelations;
  allCategories: Category[];
};

export function TransactionItem({ transaction, allCategories }: Props) {
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const isIncome = transaction.type === "INCOME";
  const userName = transaction.user.name ?? "Unknown";
  const isHasan = userName.toLowerCase().includes("hasan");

  async function handleDelete() {
    if (!confirm(`Hapus transaksi "${transaction.description || formatRupiah(transaction.amount)}"?`)) return;
    setDeleteLoading(true);
    try {
      await deleteTransaction(transaction.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus transaksi.");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-cream-200 bg-white px-4 py-3 transition-colors hover:border-cream-300 hover:bg-cream-50 shadow-sm">
      {/* Category icon */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-cream-100"
        style={{ backgroundColor: `${transaction.category.color}18` }}
      >
        {transaction.category.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-warm-800 truncate">
            {transaction.description || transaction.category.name}
          </p>
          <span
            className={cn(
              "inline-flex items-center h-4 px-1.5 rounded-full text-[10px] font-medium shrink-0",
              isHasan
                ? "bg-blue-50 text-blue-600 border border-blue-100"
                : "bg-purple-50 text-purple-600 border border-purple-100"
            )}
          >
            {userName}
          </span>
        </div>
        <p className="text-xs text-warm-400 mt-0.5">
          {transaction.category.name} · {formatDateShort(transaction.date)}
        </p>
      </div>

      {/* Amount */}
      <div className="flex-shrink-0 text-right mr-1">
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            isIncome ? "text-emerald-600" : "text-red-600"
          )}
        >
          {isIncome ? "+" : "−"}
          {formatRupiah(transaction.amount)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        <TransactionFormDialog
          transaction={transaction}
          allCategories={allCategories}
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-warm-400 hover:text-warm-700 hover:bg-cream-100"
              title="Edit transaksi"
            >
              <PencilIcon />
            </Button>
          }
        />
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-warm-400 hover:text-red-600 hover:bg-red-50"
          title="Hapus transaksi"
          disabled={deleteLoading}
          onClick={handleDelete}
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}
