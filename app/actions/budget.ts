"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
type TransactionType = "INCOME" | "EXPENSE";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MonthlyBudgetData = {
  id: string | null;
  month: number;
  year: number;
  familyTotal: number;
  hasanAlloc: number;
  liaAlloc: number;
};

export type BudgetWithStats = {
  id: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentage: number;
  userId: string | null;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
};

export type UnbudgetedCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type UserAllocationSummary = {
  userId: string;
  name: string;
  alloc: number;             // alokasi dari MonthlyBudget
  categoryBudgetSum: number; // total anggaran kategori yg sudah di-assign
  actualSpent: number;       // pengeluaran aktual bulan ini
};

export type BudgetPageData = {
  monthlyBudget: MonthlyBudgetData;
  budgets: BudgetWithStats[];          // family-scoped category budgets
  unbudgeted: UnbudgetedCategory[];
  totalBudget: number;
  totalSpent: number;
  userSummaries: UserAllocationSummary[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMonthRange(month: number, year: number) {
  const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const to = new Date(year, month, 0, 23, 59, 59, 999);
  return { from, to };
}

// ── Monthly Budget (global + alokasi) ─────────────────────────────────────────

export async function getMonthlyBudget(
  month: number,
  year: number
): Promise<MonthlyBudgetData> {
  const rec = await prisma.monthlyBudget.findUnique({
    where: { month_year: { month, year } },
  });
  return {
    id: rec?.id ?? null,
    month,
    year,
    familyTotal: rec?.familyTotal ?? 0,
    hasanAlloc: rec?.hasanAlloc ?? 0,
    liaAlloc: rec?.liaAlloc ?? 0,
  };
}

export async function setMonthlyBudget(
  month: number,
  year: number,
  familyTotal: number,
  hasanAlloc: number,
  liaAlloc: number
): Promise<{ success: boolean; error?: string }> {
  if (familyTotal < 0 || hasanAlloc < 0 || liaAlloc < 0)
    return { success: false, error: "Nominal tidak boleh negatif." };

  try {
    await prisma.monthlyBudget.upsert({
      where: { month_year: { month, year } },
      update: { familyTotal, hasanAlloc, liaAlloc },
      create: { month, year, familyTotal, hasanAlloc, liaAlloc },
    });
    revalidatePath("/anggaran");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menyimpan budget." };
  }
}

// ── Budget per kategori (family-scoped) ───────────────────────────────────────

export async function getBudgetPageData(
  month: number,
  year: number
): Promise<BudgetPageData> {
  const { from, to } = getMonthRange(month, year);

  // 1. Monthly budget global
  const monthlyBudget = await getMonthlyBudget(month, year);

  // 2. Category budgets (family-scoped only — userId IS NULL)
  const budgets = await prisma.budget.findMany({
    where: { month, year, userId: null },
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  });

  // 3. Family-wide spending per category
  const spentByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      type: TransactionType.EXPENSE,
      date: { gte: from, lte: to },
    },
    _sum: { amount: true },
  });
  const spentMap = new Map(
    spentByCategory.map((r) => [r.categoryId, r._sum.amount ?? 0])
  );

  // 4. Build budgets with stats
  const budgetsWithStats: BudgetWithStats[] = budgets.map((b) => {
    const spent = spentMap.get(b.categoryId) ?? 0;
    const remaining = b.amount - spent;
    const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    return {
      id: b.id,
      amount: b.amount,
      month: b.month,
      year: b.year,
      spent,
      remaining,
      percentage,
      userId: null,
      category: {
        id: b.category.id,
        name: b.category.name,
        icon: b.category.icon,
        color: b.category.color,
      },
    };
  });

  // 5. Unbudgeted categories
  const budgetedIds = new Set(budgets.map((b) => b.categoryId));
  const unbudgeted = await prisma.category.findMany({
    where: {
      type: TransactionType.EXPENSE,
      id: { notIn: Array.from(budgetedIds) },
    },
    orderBy: { name: "asc" },
  });

  // 6. Per-user summaries (Hasan & Lia)
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Spending per user this month
  const spentByUser = await prisma.transaction.groupBy({
    by: ["userId"],
    where: {
      type: TransactionType.EXPENSE,
      date: { gte: from, lte: to },
    },
    _sum: { amount: true },
  });
  const spentByUserMap = new Map(
    spentByUser.map((r) => [r.userId, r._sum.amount ?? 0])
  );

  // Category budget sum per user (sum of category budgets — proxy for planned spend)
  const categoryBudgetSum = budgetsWithStats.reduce((s, b) => s + b.amount, 0);

  const userSummaries: UserAllocationSummary[] = users.map((u) => {
    // Determine alloc: match by name (case-insensitive)
    const nameLower = (u.name ?? "").toLowerCase();
    const alloc = nameLower.includes("hasan")
      ? monthlyBudget.hasanAlloc
      : nameLower.includes("lia")
      ? monthlyBudget.liaAlloc
      : 0;

    return {
      userId: u.id,
      name: u.name ?? u.id,
      alloc,
      categoryBudgetSum,   // total category budgets (shared reference)
      actualSpent: spentByUserMap.get(u.id) ?? 0,
    };
  });

  const totalBudget = budgetsWithStats.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgetsWithStats.reduce((s, b) => s + b.spent, 0);

  return {
    monthlyBudget,
    budgets: budgetsWithStats,
    unbudgeted,
    totalBudget,
    totalSpent,
    userSummaries,
  };
}

// ── CRUD anggaran per kategori ────────────────────────────────────────────────

export async function setBudget(
  categoryId: string,
  month: number,
  year: number,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  if (!categoryId) return { success: false, error: "Kategori wajib dipilih." };
  if (!amount || amount <= 0)
    return { success: false, error: "Nominal harus lebih dari 0." };

  try {
    const existing = await prisma.budget.findFirst({
      where: { categoryId, month, year, userId: null },
    });
    if (existing) {
      await prisma.budget.update({ where: { id: existing.id }, data: { amount } });
    } else {
      await prisma.budget.create({
        data: { categoryId, month, year, amount, userId: null },
      });
    }
    revalidatePath("/anggaran");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menyimpan anggaran." };
  }
}

export async function deleteBudget(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.budget.delete({ where: { id } });
    revalidatePath("/anggaran");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus anggaran." };
  }
}

// ── User list ─────────────────────────────────────────────────────────────────

export async function getBudgetUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
