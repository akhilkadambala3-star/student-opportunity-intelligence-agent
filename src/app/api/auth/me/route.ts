import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAIProviderStatus } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const aiStatus = getAIProviderStatus();

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null, aiStatus });
    }

    return NextResponse.json({
      authenticated: true,
      user,
      aiStatus,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
