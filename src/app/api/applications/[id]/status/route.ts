import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateStatusSchema = z.object({
  status: z.enum([
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
    "CLOSED_EXPIRED",
  ]),
  note: z.string().optional(),
  assessmentDate: z.string().optional(),
  interviewDate: z.string().optional(),
});

export async function PATCH(
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
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { status, note, assessmentDate, interviewDate } = parsed.data;

    const application = await prisma.application.findFirst({
      where: { id, userId: user.id },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const previousStatus = application.currentStatus;

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        currentStatus: status,
        appliedDate: status === "APPLIED" && !application.appliedDate ? new Date() : application.appliedDate,
        assessmentDate: assessmentDate ? new Date(assessmentDate) : application.assessmentDate,
        interviewDate: interviewDate ? new Date(interviewDate) : application.interviewDate,
      },
    });

    // Record audit history
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: previousStatus,
        toStatus: status,
        note: note || `Status updated from ${previousStatus} to ${status}`,
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
