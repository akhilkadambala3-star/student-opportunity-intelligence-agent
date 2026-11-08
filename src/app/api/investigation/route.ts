import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runOpportunityInvestigation } from "@/lib/ai/investigator";
import { z } from "zod";

export const dynamic = "force-dynamic";

const runInvestigationSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID required"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = runInvestigationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { opportunityId } = parsed.data;

    // Fetch opportunity
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        sources: true,
        requirements: true,
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    // Fetch student profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        skills: { include: { skill: true } },
        projects: true,
        experiences: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Please complete your student profile before launching an investigation." },
        { status: 400 }
      );
    }

    // Parse JSON fields
    let eligibleGradYears: string[] = [];
    try {
      eligibleGradYears = opportunity.eligibleGradYears ? JSON.parse(opportunity.eligibleGradYears) : [];
    } catch {}

    let requiredSkills: string[] = [];
    try {
      requiredSkills = JSON.parse(opportunity.requiredSkills);
    } catch {}

    let preferredSkills: string[] = [];
    try {
      preferredSkills = opportunity.preferredSkills ? JSON.parse(opportunity.preferredSkills) : [];
    } catch {}

    // Prepare student profile payload
    const studentPayload = {
      displayName: profile.displayName,
      institution: profile.institution,
      degree: profile.degree,
      branch: profile.branch,
      graduationYear: profile.graduationYear,
      cgpa: profile.cgpa,
      location: profile.location,
      workPreference: profile.workPreference,
      skills: profile.skills.map((s) => ({
        name: s.skill.name,
        proficiency: s.proficiencyLevel,
        isVerified: s.isVerified,
        verificationSource: s.verificationSource,
        evidenceNotes: s.evidenceNotes,
      })),
      projects: profile.projects.map((p) => {
        let techs: string[] = [];
        try {
          techs = JSON.parse(p.technologies);
        } catch {}
        return {
          title: p.title,
          technologies: techs,
          description: p.description,
          githubUrl: p.githubUrl,
          liveUrl: p.liveUrl,
        };
      }),
      experiences: profile.experiences.map((e) => ({
        title: e.title,
        organisation: e.organisation,
        experienceType: e.experienceType,
        description: e.description,
      })),
    };

    const oppPayload = {
      id: opportunity.id,
      title: opportunity.title,
      organisation: opportunity.organisation,
      category: opportunity.category,
      location: opportunity.location,
      workArrangement: opportunity.workArrangement,
      requiredEducation: opportunity.requiredEducation,
      eligibleGradYears,
      requiredSkills,
      preferredSkills,
      minCgpa: opportunity.minCgpa,
      experienceYears: opportunity.experienceYears,
      applicationDeadline: opportunity.applicationDeadline,
      requirements: opportunity.requirements.map((r) => ({
        requirementText: r.requirementText,
        category: r.category,
        isMandatory: r.isMandatory,
        sourceSnippet: r.sourceSnippet,
      })),
      sources: opportunity.sources.map((s) => ({
        sourceName: s.sourceName,
        sourceUrl: s.sourceUrl,
        trustLevel: s.trustLevel,
      })),
    };

    // Run investigation
    const report = await runOpportunityInvestigation(studentPayload, oppPayload);

    // Persist investigation
    const existing = await prisma.investigation.findUnique({
      where: {
        userId_opportunityId: {
          userId: user.id,
          opportunityId: opportunity.id,
        },
      },
    });

    let investigation;
    if (existing) {
      await prisma.investigationFinding.deleteMany({ where: { investigationId: existing.id } });
      investigation = await prisma.investigation.update({
        where: { id: existing.id },
        data: {
          overallEligibility: report.overallEligibility,
          hardRequirementsMet: report.hardRequirementsMet,
          totalMandatoryRequirements: report.totalMandatoryRequirements,
          suitabilityScore: report.suitabilityScore,
          summary: report.summary,
          gapAnalysis: report.gapAnalysis,
          riskFactors: JSON.stringify(report.riskFactors),
          recommendations: JSON.stringify(report.recommendations),
          lastRunAt: new Date(),
        },
      });
    } else {
      investigation = await prisma.investigation.create({
        data: {
          userId: user.id,
          opportunityId: opportunity.id,
          status: "COMPLETED",
          overallEligibility: report.overallEligibility,
          hardRequirementsMet: report.hardRequirementsMet,
          totalMandatoryRequirements: report.totalMandatoryRequirements,
          suitabilityScore: report.suitabilityScore,
          summary: report.summary,
          gapAnalysis: report.gapAnalysis,
          riskFactors: JSON.stringify(report.riskFactors),
          recommendations: JSON.stringify(report.recommendations),
        },
      });
    }

    // Persist findings
    await prisma.investigationFinding.createMany({
      data: report.findings.map((f) => ({
        investigationId: investigation.id,
        requirementText: f.requirementText,
        isMandatory: f.isMandatory,
        evaluationStatus: f.evaluationStatus,
        evidenceFound: f.evidenceFound,
        sourceSnippet: f.sourceSnippet,
        explanation: f.explanation,
        recommendedAction: f.recommendedAction,
      })),
    });

    const fullInvestigation = await prisma.investigation.findUnique({
      where: { id: investigation.id },
      include: {
        findings: true,
        opportunity: {
          include: { sources: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      investigation: fullInvestigation,
      engineUsed: report.engineUsed,
    });
  } catch (error) {
    console.error("Investigation error:", error);
    return NextResponse.json({ error: "Failed to run investigation" }, { status: 500 });
  }
}
