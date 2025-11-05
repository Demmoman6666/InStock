import { execSync } from "child_process";

console.log("🚀 Running Prisma migration...");
execSync("npm run migrate", { stdio: "inherit" });
console.log("✅ Migration complete.");
