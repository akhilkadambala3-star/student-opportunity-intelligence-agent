import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, DEMO_USER_EMAIL } from "@/lib/auth";

export async function POST() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Demo user not seeded yet. Please run seeding." },
        { status: 404 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      message: "Logged in as Demo Student (Priya Sharma)",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isDemo: user.isDemo,
      },
    });
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
