import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

async function main() {
  console.log("🌱 Starting seed...");

  // ── Users ──────────────────────────────────────────────────────────────────
  const hashedPasswordHasan = await bcrypt.hash("hasan123", 12);
  const hashedPasswordLia = await bcrypt.hash("lia123", 12);

  const hasan = await prisma.user.upsert({
    where: { email: "hasan@family.local" },
    update: {},
    create: {
      name: "Hasan",
      email: "hasan@family.local",
      password: hashedPasswordHasan,
    },
  });

  const lia = await prisma.user.upsert({
    where: { email: "lia@family.local" },
    update: {},
    create: {
      name: "Lia",
      email: "lia@family.local",
      password: hashedPasswordLia,
    },
  });

  console.log(`✅ Users seeded: ${hasan.name}, ${lia.name}`);

  // ── Expense Categories ─────────────────────────────────────────────────────
  const expenseCategories = [
    { name: "Makanan", icon: "🍽️", color: "#E53E3E" },
    { name: "Transport", icon: "🚗", color: "#DD6B20" },
    { name: "Belanja", icon: "🛍️", color: "#D69E2E" },
    { name: "Kesehatan", icon: "🏥", color: "#38A169" },
    { name: "Hiburan", icon: "🎬", color: "#3182CE" },
    { name: "Tagihan", icon: "⚡", color: "#805AD5" },
    { name: "Pendidikan", icon: "📚", color: "#00B5D8" },
    { name: "Lainnya", icon: "📦", color: "#718096" },
  ];

  for (const cat of expenseCategories) {
    await prisma.category.upsert({
      where: {
        // We use a compound check by name+type since there's no unique on name alone
        id: `default-expense-${cat.name.toLowerCase()}`,
      },
      update: {},
      create: {
        id: `default-expense-${cat.name.toLowerCase()}`,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: TransactionType.EXPENSE,
        isDefault: true,
      },
    });
  }

  console.log(`✅ Expense categories seeded: ${expenseCategories.length}`);

  // ── Income Categories ──────────────────────────────────────────────────────
  const incomeCategories = [
    { name: "Gaji", icon: "💼", color: "#38A169" },
    { name: "Freelance", icon: "💻", color: "#3182CE" },
    { name: "Bonus", icon: "🎁", color: "#D4AF37" },
    { name: "Lainnya", icon: "💵", color: "#718096" },
  ];

  for (const cat of incomeCategories) {
    await prisma.category.upsert({
      where: {
        id: `default-income-${cat.name.toLowerCase()}`,
      },
      update: {},
      create: {
        id: `default-income-${cat.name.toLowerCase()}`,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: TransactionType.INCOME,
        isDefault: true,
      },
    });
  }

  console.log(`✅ Income categories seeded: ${incomeCategories.length}`);
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
