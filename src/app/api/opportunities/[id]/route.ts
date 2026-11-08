import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        sources: true,
        requirements: true,
        investigations: user
          ? {
              where: { userId: user.id },
              include: { findings: true },
            }
          : false,
        preparationPlans: user
          ? {
              where: { userId: user.id },
              include: { tasks: true, resources: true },
            }
          : false,
        applications: user
          ? {
              where: { userId: user.id },
              include: { statusHistory: true, feedback: true },
            }
          : false,
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    return NextResponse.json({
      opportunity,
      userInvestigation: opportunity.investigations?.[0] || null,
      userPreparationPlan: opportunity.preparationPlans?.[0] || null,
      userApplication: opportunity.applications?.[0] || null,
    });
  } catch (error) {
    console.error("Error fetching opportunity detail:", error);
    return NextResponse.json({ error: "Failed to fetch opportunity" }, { status: 500 });
  }
}
