"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { deleteBudget, type BudgetWithStats } from "@/app/actions/budget";
import { BudgetFormDialog } from "./budget-form-dialog";

interface BudgetCardProps {
  budget: BudgetWithStats;
  month: number;
  year: number;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return "#EF4444";
  if (percentage >= 80) return "#F59E0B";
  return "#10B981";
}

export function BudgetCard({ budget, month, year }: BudgetCardProps) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  const pct = Math.min(budget.percentage, 100);
  const progressColor = getProgressColor(budget.percentage);
  const isOver = budget.percentage >= 100;
  const isWarning = budget.percentage >= 80 && budget.percentage < 100;

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteBudget(budget.id);
      if (!res.success) setError(res.error ?? "Gagal menghapus.");
      setDeleteConfirm(false);
    });
  }

  return (
    <div className="rounded-2xl bg-white border border-cream-200 shadow-sm p-5 flex flex-col gap-4 hover:border-cream-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-cream-100"
            style={{ backgroundColor: budget.category.color + "18" }}
          >
            {budget.category.icon}
          </div>
          <div>
            <p className="font-semibold text-warm-800 text-sm leading-tight">
              {budget.category.name}
            </p>
            <p className="text-xs text-warm-400 mt-0.5">
              Limit: {formatRupiah(budget.amount)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setEditOpen(true)}
            className="w-7 h-7 rounded-lg hover:bg-cream-100 flex items-center justify-center text-warm-400 hover:text-gold-600 transition-colors"
            title="Edit anggaran"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-warm-400 hover:text-red-500 transition-colors"
            title="Hapus anggaran"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="w-full h-2 rounded-full bg-cream-100 border border-cream-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: progressColor }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-warm-500">
            Terpakai{" "}
            <span className="font-semibold" style={{ color: progressColor }}>
              {formatRupiah(budget.spent)}
            </span>
          </span>
          <span className="font-bold text-sm" style={{ color: progressColor }}>
            {budget.percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Status pill */}
      <div className={`rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-2 ${
        isOver
          ? "bg-red-50 text-red-600 border border-red-100"
          : isWarning
          ? "bg-amber-50 text-amber-600 border border-amber-100"
          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
      }`}>
        <span>{isOver ? "⚠️" : isWarning ? "⚡" : "✅"}</span>
        <span>
          {isOver
            ? `Melebihi ${formatRupiah(Math.abs(budget.remaining))}`
            : `Sisa ${formatRupiah(budget.remaining)}`}
        </span>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Edit Dialog */}
      <BudgetFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        budget={budget}
        month={month}
        year={year}
      />

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-cream-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-heading text-lg font-bold text-warm-900 mb-2">
              Hapus Anggaran?
            </h3>
            <p className="text-sm text-warm-500 mb-6">
              Anggaran{" "}
              <span className="font-semibold text-warm-800">{budget.category.name}</span>{" "}
              bulan ini akan dihapus.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-cream-200 text-sm text-warm-600 hover:bg-cream-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isPending ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
