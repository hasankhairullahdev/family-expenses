"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
type TransactionType = "INCOME" | "EXPENSE";

export type TransactionFilters = {
  type?: TransactionType | "ALL";
  categoryId?: string;
  userId?: string;
  dateFrom?: string; // ISO date string YYYY-MM-DD
  dateTo?: string;   // ISO date string YYYY-MM-DD
  search?: string;
};

export type TransactionFormData = {
  type: TransactionType;
  amount: number;
  description: string;
  date: string; // ISO date string
  categoryId: string;
};

export type TransactionWithRelations = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  receiptImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  userId: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: TransactionType;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export async function getTransactions(filters?: TransactionFilters): Promise<TransactionWithRelations[]> {
  const where: NonNullable<Parameters<typeof prisma.transaction.findMany>[0]>["where"] = {};

  if (filters?.type && filters.type !== "ALL") {
    where.type = filters.type;
  }
  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters?.userId) {
    where.userId = filters.userId;
  }
  if (filters?.search) {
    where.description = {
      contains: filters.search,
      mode: "insensitive",
    };
  }
  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters?.dateFrom) {
      where.date.gte = new Date(filters.dateFrom);
    }
    if (filters?.dateTo) {
      // include the full day
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      where.date.lte = to;
    }
  }

  return prisma.transaction.findMany({
    where,
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function createTransaction(data: TransactionFormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Tidak terautentikasi.");

  if (!data.amount || data.amount <= 0) {
    throw new Error("Nominal harus lebih dari 0.");
  }
  if (!data.categoryId) {
    throw new Error("Kategori wajib dipilih.");
  }
  if (!data.date) {
    throw new Error("Tanggal wajib diisi.");
  }

  const transaction = await prisma.transaction.create({
    data: {
      type: data.type,
      amount: data.amount,
      description: data.description?.trim() || "",
      date: new Date(data.date),
      categoryId: data.categoryId,
      userId: session.user.id,
    },
  });

  revalidatePath("/transaksi");
  return transaction;
}

export async function updateTransaction(id: string, data: TransactionFormData) {
  if (!data.amount || data.amount <= 0) {
    throw new Error("Nominal harus lebih dari 0.");
  }
  if (!data.categoryId) {
    throw new Error("Kategori wajib dipilih.");
  }
  if (!data.date) {
    throw new Error("Tanggal wajib diisi.");
  }

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) throw new Error("Transaksi tidak ditemukan.");

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      type: data.type,
      amount: data.amount,
      description: data.description?.trim() || "",
      date: new Date(data.date),
      categoryId: data.categoryId,
    },
  });

  revalidatePath("/transaksi");
  return transaction;
}

export async function deleteTransaction(id: string) {
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) throw new Error("Transaksi tidak ditemukan.");

  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/transaksi");
}
