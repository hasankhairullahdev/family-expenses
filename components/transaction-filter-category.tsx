"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionType } from "@prisma/client";

type Category = {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
};

type Props = {
  categories: Category[];
  current: string | undefined;
};

export function CategoryFilterDropdown({ categories, current }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function buildUrl(categoryId: string | undefined) {
    const p = new URLSearchParams(searchParams.toString());
    if (categoryId) p.set("categoryId", categoryId);
    else p.delete("categoryId");
    return `/transaksi${p.size ? `?${p}` : ""}`;
  }

  return (
    <select
      value={current ?? ""}
      onChange={(e) => router.push(buildUrl(e.target.value || undefined))}
      className="h-8 rounded-lg border border-cream-200 bg-white px-2.5 text-sm text-warm-600 focus:outline-none focus:border-maroon-600 hover:bg-cream-50 transition-colors cursor-pointer"
    >
      <option value="">Semua Kategori</option>
      <optgroup label="Pengeluaran">
        {categories
          .filter((c) => c.type === "EXPENSE")
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
      </optgroup>
      <optgroup label="Pemasukan">
        {categories
          .filter((c) => c.type === "INCOME")
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
      </optgroup>
    </select>
  );
}
