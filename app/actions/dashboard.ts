"use server";

import { prisma } from "@/lib/prisma";
import { getPeriodRange, getPrevPeriod } from "@/lib/period";
type TransactionType = "INCOME" | "EXPENSE";

// ── Types ────────────────────────────────────────────────────────────────────

export type DashboardSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  prevTotalIncome: number;
  prevTotalExpense: number;
  periodLabel: string;
};

export type MonthlyChartItem = {
  month: number;
  year: number;
  label: string;
  income: number;
  expense: number;
};

export type CategoryBreakdownItem = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  percentage: number;
};

export type RecentTransaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  category: { name: string; icon: string; color: string };
  user: { id: string; name: string | null };
};

export type OverBudgetItem = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  budgetAmount: number;
  spentAmount: number;
  overByPercent: number;
};

export type CategorySpend = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  percentage: number;
};

export type UserDashboardSummary = {
  userId: string;
  name: string;
  alloc: number;
  totalExpense: number;
  totalIncome: number;
  remaining: number;
  topCategories: CategorySpend[];     // top 3
  allCategories: CategorySpend[];     // semua kategori
};

export type LaporanCategoryRow = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
};

export type LaporanData = {
  periodLabel: string;
  totalIncome: number;
  totalExpense: number;
  expenseByCategory: LaporanCategoryRow[];
  incomeByCategory: LaporanCategoryRow[];
};

// ── Server Actions ────────────────────────────────────────────────────────────

export async function getDashboardSummary(
  month: number,
  year: number
): Promise<DashboardSummary> {
  const { from, to, label: periodLabel } = getPeriodRange(month, year);
  const { from: prevFrom, to: prevTo } = getPrevPeriod(month, year);

  const [current, previous] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { date: { gte: from, lte: to } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: { date: { gte: prevFrom, lte: prevTo } },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome =
    current.find((r) => r.type === "INCOME")?._sum.amount ?? 0;
  const totalExpense =
    current.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0;
  const transactionCount = current.reduce((s, r) => s + r._count._all, 0);

  const prevTotalIncome =
    previous.find((r) => r.type === "INCOME")?._sum.amount ?? 0;
  const prevTotalExpense =
    previous.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0;

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount,
    prevTotalIncome,
    prevTotalExpense,
    periodLabel,
  };
}

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Ags", "Sep", "Okt", "Nov", "Des",
];

export async function getMonthlyChart(
  months: number = 6
): Promise<MonthlyChartItem[]> {
  const { getCurrentPeriod } = await import("@/lib/period");
  const current = getCurrentPeriod();
  const results: MonthlyChartItem[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(current.year, current.month - 1 - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const { from, to } = getPeriodRange(m, y);

    const rows = await prisma.transaction.groupBy({
      by: ["type"],
      where: { date: { gte: from, lte: to } },
      _sum: { amount: true },
    });

    results.push({
      month: m,
      year: y,
      label: `${MONTH_NAMES_SHORT[m - 1]} '${String(y).slice(2)}`,
      income: rows.find((r) => r.type === "INCOME")?._sum.amount ?? 0,
      expense: rows.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0,
    });
  }

  return results;
}

export async function getCategoryBreakdown(
  month: number,
  year: number,
  type: "EXPENSE" | "INCOME" = "EXPENSE"
): Promise<CategoryBreakdownItem[]> {
  const { from, to } = getPeriodRange(month, year);

  const rows = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { type, date: { gte: from, lte: to } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  if (rows.length === 0) return [];

  const total = rows.reduce((s, r) => s + (r._sum.amount ?? 0), 0);

  const categories = await prisma.category.findMany({
    where: { id: { in: rows.map((r) => r.categoryId) } },
    select: { id: true, name: true, icon: true, color: true },
  });

  const catMap = new Map(categories.map((c) => [c.id, c]));

  return rows.map((r) => {
    const cat = catMap.get(r.categoryId);
    const amount = r._sum.amount ?? 0;
    return {
      categoryId: r.categoryId,
      categoryName: cat?.name ?? "Lainnya",
      categoryIcon: cat?.icon ?? "💰",
      categoryColor: cat?.color ?? "#9B1C1C",
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    };
  });
}

export async function getRecentTransactions(
  limit: number = 5
): Promise<RecentTransaction[]> {
  const rows = await prisma.transaction.findMany({
    take: limit,
    orderBy: { date: "desc" },
    include: {
      category: { select: { name: true, icon: true, color: true } },
      user: { select: { id: true, name: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    amount: r.amount,
    description: r.description,
    date: r.date,
    category: r.category,
    user: r.user,
  }));
}

export async function getOverBudgetAlerts(
  month: number,
  year: number
): Promise<OverBudgetItem[]> {
  const { from, to } = getPeriodRange(month, year);

  const budgets = await prisma.budget.findMany({
    where: { month, year },
    include: { category: { select: { name: true, icon: true } } },
  });

  if (budgets.length === 0) return [];

  const spending = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      type: "EXPENSE",
      date: { gte: from, lte: to },
      categoryId: { in: budgets.map((b) => b.categoryId) },
    },
    _sum: { amount: true },
  });

  const spendMap = new Map(
    spending.map((s) => [s.categoryId, s._sum.amount ?? 0])
  );

  return budgets
    .filter((b) => (spendMap.get(b.categoryId) ?? 0) > b.amount)
    .map((b) => {
      const spent = spendMap.get(b.categoryId) ?? 0;
      return {
        categoryId: b.categoryId,
        categoryName: b.category.name,
        categoryIcon: b.category.icon,
        budgetAmount: b.amount,
        spentAmount: spent,
        overByPercent: Math.round(((spent - b.amount) / b.amount) * 100),
      };
    });
}

export async function getUserSummaries(
  month: number,
  year: number
): Promise<UserDashboardSummary[]> {
  const { from, to } = getPeriodRange(month, year);

  // All users
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Monthly budget for alloc lookup
  const monthlyBudget = await prisma.monthlyBudget.findUnique({
    where: { month_year: { month, year } },
  });

  // Per-user spending grouped by type
  const spendingByUser = await prisma.transaction.groupBy({
    by: ["userId", "type"],
    where: { date: { gte: from, lte: to } },
    _sum: { amount: true },
  });

  // Per-user spending grouped by category (for top categories)
  const categorySpendByUser = await prisma.transaction.groupBy({
    by: ["userId", "categoryId"],
    where: { type: "EXPENSE", date: { gte: from, lte: to } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  // Fetch all relevant categories
  const allCatIds = [...new Set(categorySpendByUser.map((r) => r.categoryId))];
  const categories = await prisma.category.findMany({
    where: { id: { in: allCatIds } },
    select: { id: true, name: true, icon: true, color: true },
  });
  const catMap = new Map(categories.map((c) => [c.id, c]));

  return users.map((u) => {
    // Alloc: match by name
    const nameLower = (u.name ?? "").toLowerCase();
    const alloc = nameLower.includes("hasan")
      ? (monthlyBudget?.hasanAlloc ?? 0)
      : nameLower.includes("lia")
      ? (monthlyBudget?.liaAlloc ?? 0)
      : 0;

    const totalExpense =
      spendingByUser.find((r) => r.userId === u.id && r.type === "EXPENSE")
        ?._sum.amount ?? 0;
    const totalIncome =
      spendingByUser.find((r) => r.userId === u.id && r.type === "INCOME")
        ?._sum.amount ?? 0;

    const userCatSpend = categorySpendByUser.filter((r) => r.userId === u.id);

    const allCategories: CategorySpend[] = userCatSpend.map((r) => {
      const cat = catMap.get(r.categoryId);
      const amount = r._sum.amount ?? 0;
      return {
        categoryId: r.categoryId,
        categoryName: cat?.name ?? "Lainnya",
        categoryIcon: cat?.icon ?? "💰",
        categoryColor: cat?.color ?? "#9B1C1C",
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      };
    });

    return {
      userId: u.id,
      name: u.name ?? u.id,
      alloc,
      totalExpense,
      totalIncome,
      remaining: alloc > 0 ? alloc - totalExpense : 0,
      topCategories: allCategories.slice(0, 3),
      allCategories,
    };
  });
}

export async function getLaporanData(
  month: number,
  year: number
): Promise<LaporanData> {
  const { from, to, label: periodLabel } = getPeriodRange(month, year);

  // Total income & expense
  const totals = await prisma.transaction.groupBy({
    by: ["type"],
    where: { date: { gte: from, lte: to } },
    _sum: { amount: true },
    _count: { _all: true },
  });
  const totalIncome = totals.find((r) => r.type === "INCOME")?._sum.amount ?? 0;
  const totalExpense = totals.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0;

  // Spending per category
  const [expenseRows, incomeRows] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { type: "EXPENSE", date: { gte: from, lte: to } },
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { type: "INCOME", date: { gte: from, lte: to } },
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
  ]);

  const allCatIds = [
    ...new Set([...expenseRows, ...incomeRows].map((r) => r.categoryId)),
  ];
  const categories = await prisma.category.findMany({
    where: { id: { in: allCatIds } },
    select: { id: true, name: true, icon: true, color: true },
  });
  const catMap = new Map(categories.map((c) => [c.id, c]));

  function mapRows(
    rows: typeof expenseRows,
    total: number
  ): LaporanCategoryRow[] {
    return rows.map((r) => {
      const cat = catMap.get(r.categoryId);
      const amount = r._sum.amount ?? 0;
      return {
        categoryId: r.categoryId,
        categoryName: cat?.name ?? "Lainnya",
        categoryIcon: cat?.icon ?? "💰",
        categoryColor: cat?.color ?? "#9B1C1C",
        totalAmount: amount,
        transactionCount: r._count._all,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      };
    });
  }

  return {
    periodLabel,
    totalIncome,
    totalExpense,
    expenseByCategory: mapRows(expenseRows, totalExpense),
    incomeByCategory: mapRows(incomeRows, totalIncome),
  };
}
