-- CreateTable: MonthlyBudget — global family budget + per-person allocation
CREATE TABLE "MonthlyBudget" (
    "id"          TEXT NOT NULL,
    "month"       INTEGER NOT NULL,
    "year"        INTEGER NOT NULL,
    "familyTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hasanAlloc"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "liaAlloc"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyBudget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique per month+year
CREATE UNIQUE INDEX "MonthlyBudget_month_year_key" ON "MonthlyBudget"("month", "year");
