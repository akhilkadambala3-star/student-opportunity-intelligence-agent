import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const outcomeFeedbackSchema = z.object({
  outcome: z.enum(["OFFER", "REJECTED", "WAITLISTED", "WITHDRAWN", "NO_RESPONSE"]),
  feedbackReceived: z.boolean().default(false),
  feedbackSource: z.enum(["EMPLOYER_EMAIL", "PORTAL_MESSAGE", "INTERVIEWER_NOTES", "NONE"]).optional(),
  feedbackText: z.string().optional(),
  statedImprovementAreas: z.array(z.string()).optional(),
  isEvidenceBacked: z.boolean().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = outcomeFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { outcome, feedbackReceived, feedbackSource, feedbackText, statedImprovementAreas, isEvidenceBacked } = parsed.data;

    const application = await prisma.application.findFirst({
      where: { id, userId: user.id },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Map outcome to status
    let mappedStatus = application.currentStatus;
    if (outcome === "OFFER") mappedStatus = "OFFER_RECEIVED";
    else if (outcome === "REJECTED") mappedStatus = "REJECTED";
    else if (outcome === "WITHDRAWN") mappedStatus = "WITHDRAWN";

    // Update application status
    await prisma.application.update({
      where: { id: application.id },
      data: { currentStatus: mappedStatus },
    });

    // Save or update feedback record
    const feedback = await prisma.applicationFeedback.upsert({
      where: { applicationId: application.id },
      update: {
        outcome,
        feedbackReceived,
        feedbackSource: feedbackReceived ? feedbackSource || "EMPLOYER_EMAIL" : "NONE",
        feedbackText: feedbackReceived ? feedbackText || null : null,
        statedImprovementAreas: feedbackReceived && statedImprovementAreas ? JSON.stringify(statedImprovementAreas) : JSON.stringify([]),
        isEvidenceBacked: feedbackReceived && isEvidenceBacked,
        recordedAt: new Date(),
      },
      create: {
        applicationId: application.id,
        outcome,
        feedbackReceived,
        feedbackSource: feedbackReceived ? feedbackSource || "EMPLOYER_EMAIL" : "NONE",
        feedbackText: feedbackReceived ? feedbackText || null : null,
        statedImprovementAreas: feedbackReceived && statedImprovementAreas ? JSON.stringify(statedImprovementAreas) : JSON.stringify([]),
        isEvidenceBacked: feedbackReceived && isEvidenceBacked,
      },
    });

    // Record audit history
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: application.currentStatus,
        toStatus: mappedStatus,
        note: `Outcome recorded: ${outcome}. Feedback received: ${feedbackReceived ? "Yes" : "No"}.`,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Feedback recording error:", error);
    return NextResponse.json({ error: "Failed to record feedback" }, { status: 500 });
  }
}
