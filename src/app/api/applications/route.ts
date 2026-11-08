import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createApplicationSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID required"),
  initialStatus: z.enum([
    "INTERESTED",
    "SAVED",
    "PREPARING",
    "APPLIED",
    "ASSESSMENT_SCHEDULED",
    "INTERVIEW_SCHEDULED",
    "AWAITING_RESULT",
    "OFFER_RECEIVED",
    "REJECTED",
    "WITHDRAWN",
  ]).default("SAVED"),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        opportunity: true,
        statusHistory: { orderBy: { changedAt: "desc" } },
        feedback: true,
        tasks: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { opportunityId, initialStatus, notes } = parsed.data;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const application = await prisma.application.upsert({
      where: {
        userId_opportunityId: {
          userId: user.id,
          opportunityId,
        },
      },
      update: {
        currentStatus: initialStatus,
        notes: notes || undefined,
      },
      create: {
        userId: user.id,
        opportunityId,
        currentStatus: initialStatus,
        targetRole: opportunity.title,
        organisation: opportunity.organisation,
        deadline: opportunity.applicationDeadline,
        notes: notes || `Saved from discovery workspace.`,
        appliedDate: initialStatus === "APPLIED" ? new Date() : null,
      },
      include: {
        opportunity: true,
        statusHistory: true,
      },
    });

    // Record status history
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: null,
        toStatus: initialStatus,
        note: `Application entry initialized with status: ${initialStatus}`,
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
  }
}
