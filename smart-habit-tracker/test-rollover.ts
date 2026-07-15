import { runDailyRollover } from "./src/lib/rollover";
import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Running rollover...");
  await runDailyRollover();
  console.log("Done");
}

main().catch(console.error).finally(() => prisma.$disconnect());
