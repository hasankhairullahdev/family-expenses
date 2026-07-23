-- Column "userId" and FK already exist from partial migration
-- Just need to fix the unique index

-- Drop old unique index
DROP INDEX "Budget_categoryId_month_year_key";

-- New unique index: per-user budget
CREATE UNIQUE INDEX "Budget_categoryId_month_year_userId_key"
  ON "Budget"("categoryId", "month", "year", "userId")
  WHERE "userId" IS NOT NULL;

-- New unique index: family budget (userId IS NULL)
CREATE UNIQUE INDEX "Budget_categoryId_month_year_null_key"
  ON "Budget"("categoryId", "month", "year")
  WHERE "userId" IS NULL;
