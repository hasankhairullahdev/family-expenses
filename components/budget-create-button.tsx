"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { BudgetFormDialog } from "@/components/budget-form-dialog";
import type { UnbudgetedCategory } from "@/app/actions/budget";

interface Props {
  unbudgetedCategories: UnbudgetedCategory[];
  month: number;
  year: number;
}

export function BudgetCreateButton({ unbudgetedCategories, month, year }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={unbudgetedCategories.length === 0}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-maroon-600 hover:bg-maroon-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Set Anggaran</span>
      </button>

      <BudgetFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
        month={month}
        year={year}
        unbudgetedCategories={unbudgetedCategories}
      />
    </>
  );
}
