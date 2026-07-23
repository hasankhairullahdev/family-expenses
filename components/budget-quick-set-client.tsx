"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { BudgetFormDialog } from "@/components/budget-form-dialog";
import type { UnbudgetedCategory } from "@/app/actions/budget";

interface Props {
  category: UnbudgetedCategory;
  month: number;
  year: number;
  allUnbudgeted: UnbudgetedCategory[];
}

export function QuickSetClient({ category, month, year, allUnbudgeted }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-cream-200 hover:border-cream-300 hover:bg-cream-50 text-sm text-warm-600 hover:text-warm-900 transition-all group shadow-sm"
      >
        <span>{category.icon}</span>
        <span>{category.name}</span>
        <PlusCircle className="w-3.5 h-3.5 text-maroon-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <BudgetFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
        month={month}
        year={year}
        unbudgetedCategories={allUnbudgeted}
      />
    </>
  );
}
