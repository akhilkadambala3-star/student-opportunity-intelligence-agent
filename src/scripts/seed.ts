import { seedDemoData } from "../lib/seed";

async function main() {
  try {
    await seedDemoData();
    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

main();
