"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

export type CategoryFormData = {
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
};

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

export async function createCategory(data: CategoryFormData) {
  if (!data.name || data.name.trim().length < 2) {
    throw new Error("Nama kategori minimal 2 karakter.");
  }

  const category = await prisma.category.create({
    data: {
      name: data.name.trim(),
      icon: data.icon || "💰",
      color: data.color || "#9B1C1C",
      type: data.type,
      isDefault: false,
    },
  });

  revalidatePath("/kategori");
  return category;
}

export async function updateCategory(id: string, data: CategoryFormData) {
  if (!data.name || data.name.trim().length < 2) {
    throw new Error("Nama kategori minimal 2 karakter.");
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new Error("Kategori tidak ditemukan.");
  if (existing.isDefault) throw new Error("Kategori default tidak dapat diubah.");

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: data.name.trim(),
      icon: data.icon || "💰",
      color: data.color || "#9B1C1C",
      type: data.type,
    },
  });

  revalidatePath("/kategori");
  return category;
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { transactions: true, budgets: true } },
    },
  });

  if (!existing) throw new Error("Kategori tidak ditemukan.");
  if (existing.isDefault) throw new Error("Kategori default tidak dapat dihapus.");
  if (existing._count.transactions > 0) {
    throw new Error(
      `Kategori ini dipakai di ${existing._count.transactions} transaksi dan tidak dapat dihapus.`
    );
  }
  if (existing._count.budgets > 0) {
    // Hapus budget dulu (cascade manual), lalu hapus kategori
    await prisma.budget.deleteMany({ where: { categoryId: id } });
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/kategori");
  revalidatePath("/anggaran");
}
