import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateProgressIntelligence } from "@/lib/ai/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile and applications
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        skills: { include: { skill: true } },
      },
    });

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        opportunity: true,
        feedback: true,
      },
    });

    const userSkills = profile?.skills.map((s) => s.skill.name) || [];

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const outcomes: any[] = [];
    const skillCounts: Record<string, number> = {};

    for (const app of applications) {
      // By status
      byStatus[app.currentStatus] = (byStatus[app.currentStatus] || 0) + 1;

      // By category
      const cat = app.opportunity?.category || "INTERNSHIP";
      byCategory[cat] = (byCategory[cat] || 0) + 1;

      // Outcomes
      if (app.feedback) {
        let improvementAreas: string[] = [];
        try {
          improvementAreas = app.feedback.statedImprovementAreas
            ? JSON.parse(app.feedback.statedImprovementAreas)
            : [];
        } catch {}

        outcomes.push({
          outcome: app.feedback.outcome,
          organisation: app.organisation,
          targetRole: app.targetRole,
          feedbackReceived: app.feedback.feedbackReceived,
          feedbackSource: app.feedback.feedbackSource,
          feedbackText: app.feedback.feedbackText,
          statedImprovementAreas: improvementAreas,
          isEvidenceBacked: app.feedback.isEvidenceBacked,
        });
      }

      // Count skills required by targeted opportunities
      if (app.opportunity?.requiredSkills) {
        try {
          const reqs: string[] = JSON.parse(app.opportunity.requiredSkills);
          for (const r of reqs) {
            skillCounts[r] = (skillCounts[r] || 0) + 1;
          }
        } catch {}
      }
    }

    const targetOpportunitiesSkills = Object.entries(skillCounts)
      .map(([skill, frequency]) => ({ skill, frequency }))
      .sort((a, b) => b.frequency - a.frequency);

    const report = generateProgressIntelligence({
      totalApplications: applications.length,
      byStatus,
      byCategory,
      outcomes,
      targetOpportunitiesSkills,
      userSkills,
    });

    return NextResponse.json({
      report,
      byStatus,
      byCategory,
      totalApplications: applications.length,
    });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json({ error: "Failed to generate progress insights" }, { status: 500 });
  }
}
