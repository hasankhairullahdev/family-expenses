import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const cols = await prisma.$queryRawUnsafe(
    `SELECT column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_name = 'Budget' ORDER BY ordinal_position`
  );
  console.log("COLUMNS:", JSON.stringify(cols, null, 2));

  const idxs = await prisma.$queryRawUnsafe(
    `SELECT indexname FROM pg_indexes WHERE tablename = 'Budget'`
  );
  console.log("INDEXES:", JSON.stringify(idxs, null, 2));

  const fks = await prisma.$queryRawUnsafe(
    `SELECT constraint_name FROM information_schema.table_constraints
     WHERE table_name = 'Budget' AND constraint_type = 'FOREIGN KEY'`
  );
  console.log("FK CONSTRAINTS:", JSON.stringify(fks, null, 2));

  await prisma.$disconnect();
}
main().catch(console.error);
