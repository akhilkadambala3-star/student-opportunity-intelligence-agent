import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const workArrangement = searchParams.get("workArrangement");
    const eligibilityFilter = searchParams.get("eligibility");

    // Fetch user profile if logged in
    let studentProfile: any = null;
    const studentSkills = new Set<string>();
    let studentGradYear: number | null = null;
    let studentCgpa: number | null = null;

    if (user) {
      studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        include: {
          skills: { include: { skill: true } },
          projects: true,
        },
      });

      if (studentProfile) {
        studentGradYear = studentProfile.graduationYear;
        studentCgpa = studentProfile.cgpa;
        studentProfile.skills.forEach((s: any) => studentSkills.add(s.skill.name.toLowerCase().trim()));
        studentProfile.projects.forEach((p: any) => {
          try {
            const techs = JSON.parse(p.technologies);
            if (Array.isArray(techs)) {
              techs.forEach((t: string) => studentSkills.add(t.toLowerCase().trim()));
            }
          } catch {}
        });
      }
    }

    // Query opportunities
    const opportunities = await prisma.opportunity.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { title: { contains: query } },
                  { organisation: { contains: query } },
                  { roleDescription: { contains: query } },
                  { requiredSkills: { contains: query } },
                ],
              }
            : {},
          category && category !== "ALL" ? { category } : {},
          workArrangement && workArrangement !== "ALL" ? { workArrangement } : {},
        ],
      },
      include: {
        sources: true,
        requirements: true,
        investigations: user ? { where: { userId: user.id } } : false,
      },
      orderBy: { applicationDeadline: "asc" },
    });

    // Compute personalized eligibility analysis for each opportunity
    const enriched = opportunities.map((opp) => {
      let eligibilityState: "CONFIRMED_ELIGIBLE" | "APPEARS_ELIGIBLE" | "POTENTIALLY_ELIGIBLE" | "LIKELY_INELIGIBLE" | "INSUFFICIENT_INFORMATION" = "INSUFFICIENT_INFORMATION";
      let matchRationale = "Sign in or complete profile to evaluate personalized eligibility.";
      let hardConditionsMet = 0;
      let totalHardConditions = 0;

      if (studentProfile) {
        let failedMandatory = false;
        let needsConfirmation = false;
        const reasons: string[] = [];

        // Check graduation year
        if (opp.eligibleGradYears) {
          try {
            const years: string[] = JSON.parse(opp.eligibleGradYears);
            if (years.length > 0) {
              totalHardConditions++;
              if (!studentGradYear) {
                needsConfirmation = true;
                reasons.push("Graduation year unknown in profile");
              } else if (years.includes(String(studentGradYear))) {
                hardConditionsMet++;
                reasons.push(`Graduation year (${studentGradYear}) eligible`);
              } else {
                failedMandatory = true;
                reasons.push(`Requires graduating batch ${years.join("/")}; your profile lists ${studentGradYear}`);
              }
            }
          } catch {}
        }

        // Check CGPA
        if (opp.minCgpa !== null && opp.minCgpa > 0) {
          totalHardConditions++;
          if (studentCgpa === null || studentCgpa === undefined) {
            needsConfirmation = true;
            reasons.push(`Minimum CGPA of ${opp.minCgpa} required; yours is not recorded`);
          } else if (studentCgpa >= opp.minCgpa) {
            hardConditionsMet++;
            reasons.push(`CGPA (${studentCgpa}) meets cutoff (${opp.minCgpa})`);
          } else {
            failedMandatory = true;
            reasons.push(`CGPA (${studentCgpa}) below minimum ${opp.minCgpa}`);
          }
        }

        // Check required skills
        let requiredSkillsList: string[] = [];
        try {
          requiredSkillsList = JSON.parse(opp.requiredSkills);
        } catch {}

        let matchedSkillsCount = 0;
        const missingReqSkills: string[] = [];
        for (const skill of requiredSkillsList) {
          totalHardConditions++;
          if (studentSkills.has(skill.toLowerCase().trim())) {
            matchedSkillsCount++;
            hardConditionsMet++;
          } else {
            missingReqSkills.push(skill);
          }
        }

        if (failedMandatory) {
          eligibilityState = "LIKELY_INELIGIBLE";
          matchRationale = reasons.filter((r) => r.includes("below") || r.includes("Requires graduating")).join("; ");
        } else if (missingReqSkills.length > 0 || needsConfirmation) {
          eligibilityState = "POTENTIALLY_ELIGIBLE";
          matchRationale = missingReqSkills.length > 0
            ? `Missing evidence for: ${missingReqSkills.join(", ")}`
            : "Requires confirmation of academic details";
        } else {
          eligibilityState = "APPEARS_ELIGIBLE";
          matchRationale = `All ${totalHardConditions} hard criteria and skills verified`;
        }
      }

      return {
        ...opp,
        eligibilityState,
        matchRationale,
        hardConditionsMet,
        totalHardConditions,
        existingInvestigation: opp.investigations && opp.investigations.length > 0 ? opp.investigations[0] : null,
      };
    });

    // Filter by eligibility if requested
    const filtered = eligibilityFilter && eligibilityFilter !== "ALL"
      ? enriched.filter((e) => e.eligibilityState === eligibilityFilter)
      : enriched;

    return NextResponse.json({
      opportunities: filtered,
      totalCount: filtered.length,
    });
  } catch (error) {
    console.error("Opportunities search error:", error);
    return NextResponse.json({ error: "Failed to search opportunities" }, { status: 500 });
  }
}
