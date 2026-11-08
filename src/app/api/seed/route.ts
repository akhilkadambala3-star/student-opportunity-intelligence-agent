import { NextResponse } from "next/server";
import { seedDemoData } from "@/lib/seed";

export async function POST() {
  try {
    await seedDemoData();
    return NextResponse.json({
      success: true,
      message: "Database successfully populated with realistic demo opportunities and student profile.",
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: "Failed to seed demo data" }, { status: 500 });
  }
}
