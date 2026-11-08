export interface ApplicationProgressInput {
  totalApplications: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  outcomes: {
    outcome: string;
    organisation: string;
    targetRole: string;
    feedbackReceived: boolean;
    feedbackSource?: string | null;
    feedbackText?: string | null;
    statedImprovementAreas: string[];
    isEvidenceBacked: boolean;
  }[];
  targetOpportunitiesSkills: { skill: string; frequency: number }[];
  userSkills: string[];
}

export interface ProgressIntelligenceReport {
  sampleSizeSummary: {
    totalApplications: number;
    completedCycles: number;
    interviewStageCount: number;
    offersCount: number;
    rejectedCount: number;
    hasSufficientDataForTrends: boolean;
    dataConfidenceNotice: string;
  };
  conversionFunnel: {
    stage: string;
    count: number;
    percentage: number;
  }[];
  skillGapFrequency: {
    skill: string;
    marketDemandCount: number;
    isInUserProfile: boolean;
    status: "CONFIRMED" | "GAP" | "GROWING";
  }[];
  documentedFeedbackThemes: {
    theme: string;
    reportedInCount: number;
    evidenceSource: string;
    actionableFix: string;
  }[];
  evidenceBackedImprovementPlan: {
    category: "PROJECT_DEVELOPMENT" | "SKILL_REFINEMENT" | "DOCUMENT_CLARITY" | "INTERVIEW_EXECUTION";
    title: string;
    rationale: string;
    groundedIn: string;
  }[];
}

export function generateProgressIntelligence(input: ApplicationProgressInput): ProgressIntelligenceReport {
  const { totalApplications, byStatus, outcomes, targetOpportunitiesSkills, userSkills } = input;

  const interviewStageCount =
    (byStatus["INTERVIEW_SCHEDULED"] || 0) +
    (byStatus["AWAITING_RESULT"] || 0) +
    (byStatus["OFFER_RECEIVED"] || 0);

  const offersCount = byStatus["OFFER_RECEIVED"] || outcomes.filter((o) => o.outcome === "OFFER").length;
  const rejectedCount = byStatus["REJECTED"] || outcomes.filter((o) => o.outcome === "REJECTED").length;
  const completedCycles = outcomes.length;

  const hasSufficientDataForTrends = totalApplications >= 5;
  const dataConfidenceNotice =
    totalApplications === 0
      ? "No applications tracked yet. Insights will update as you record applications."
      : totalApplications < 5
      ? `Sample size is limited (n=${totalApplications}). Statistics indicate initial milestones rather than statistical causality.`
      : `Data represents n=${totalApplications} tracked applications across your job search cycle.`;

  // Funnel calculations
  const appliedCount = totalApplications;
  const assessmentCount = (byStatus["ASSESSMENT_SCHEDULED"] || 0) + interviewStageCount;
  const conversionFunnel = [
    {
      stage: "Saved / Interested",
      count: totalApplications,
      percentage: 100,
    },
    {
      stage: "Applied",
      count: Math.max(appliedCount - (byStatus["SAVED"] || 0), 0),
      percentage: totalApplications > 0 ? Math.round(((appliedCount - (byStatus["SAVED"] || 0)) / totalApplications) * 100) : 0,
    },
    {
      stage: "Assessments",
      count: assessmentCount,
      percentage: totalApplications > 0 ? Math.round((assessmentCount / totalApplications) * 100) : 0,
    },
    {
      stage: "Interviews",
      count: interviewStageCount,
      percentage: totalApplications > 0 ? Math.round((interviewStageCount / totalApplications) * 100) : 0,
    },
    {
      stage: "Offers Received",
      count: offersCount,
      percentage: totalApplications > 0 ? Math.round((offersCount / totalApplications) * 100) : 0,
    },
  ];

  // Skill market demand vs user skills
  const userSkillLower = new Set(userSkills.map((s) => s.toLowerCase().trim()));
  const skillGapFrequency = targetOpportunitiesSkills.map((item) => {
    const hasSkill = userSkillLower.has(item.skill.toLowerCase().trim());
    return {
      skill: item.skill,
      marketDemandCount: item.frequency,
      isInUserProfile: hasSkill,
      status: hasSkill ? ("CONFIRMED" as const) : ("GAP" as const),
    };
  });

  // Documented feedback themes strictly from recorded evidence
  const documentedFeedbackThemes: ProgressIntelligenceReport["documentedFeedbackThemes"] = [];
  const feedbackItems = outcomes.filter((o) => o.feedbackReceived && o.statedImprovementAreas.length > 0);

  if (feedbackItems.length > 0) {
    const themeCounts: Record<string, { count: number; source: string }> = {};
    for (const item of feedbackItems) {
      for (const area of item.statedImprovementAreas) {
        if (!themeCounts[area]) {
          themeCounts[area] = { count: 0, source: item.feedbackSource || "Recruiter Feedback" };
        }
        themeCounts[area].count++;
      }
    }

    for (const [theme, info] of Object.entries(themeCounts)) {
      documentedFeedbackThemes.push({
        theme,
        reportedInCount: info.count,
        evidenceSource: `${info.source} (recorded on verified feedback)`,
        actionableFix: `Focus on dedicated practice for '${theme}' via the Preparation Center roadmap.`,
      });
    }
  } else {
    documentedFeedbackThemes.push({
      theme: "Unknown Rejection Cause (No Feedback Disclosed by Employer)",
      reportedInCount: rejectedCount,
      evidenceSource: "Official application outcome without explanatory rubric",
      actionableFix:
        "Do not assume a specific shortcoming. In competitive cycles, candidate volume often exceeds slots. Prioritize evidence-backed requirements for upcoming rounds.",
    });
  }

  // Evidence-backed personal improvement plan
  const evidenceBackedImprovementPlan: ProgressIntelligenceReport["evidenceBackedImprovementPlan"] = [];

  // 1. Skill gaps
  const topGaps = skillGapFrequency.filter((s) => s.status === "GAP").slice(0, 2);
  for (const gap of topGaps) {
    evidenceBackedImprovementPlan.push({
      category: "SKILL_REFINEMENT",
      title: `Build Verified Competency in ${gap.skill}`,
      rationale: `${gap.skill} is required by ${gap.marketDemandCount} of your target opportunities but lacks verified evidence in your profile.`,
      groundedIn: `Target opportunity requirements analysis across n=${totalApplications} listings`,
    });
  }

  // 2. Project proof
  if (topGaps.length > 0) {
    evidenceBackedImprovementPlan.push({
      category: "PROJECT_DEVELOPMENT",
      title: `Ship a Production Project Showcasing ${topGaps[0].skill}`,
      rationale: "Replacing self-reported claims with public GitHub code and live deployments turns 'Needs Confirmation' findings into 'Satisfied'.",
      groundedIn: "Investigation Engine rule: Projects with live links upgrade evidence credibility",
    });
  }

  // 3. Interview execution
  if (interviewStageCount > 0 && offersCount === 0) {
    evidenceBackedImprovementPlan.push({
      category: "INTERVIEW_EXECUTION",
      title: "Complete Mock Technical & Behavioral Drill Sessions",
      rationale: "You have advanced past initial resume screening. Polishing live problem explanation and trade-off defense bridges the final conversion gap.",
      groundedIn: `Conversion funnel data: Reached interview rounds in ${interviewStageCount} application(s)`,
    });
  }

  return {
    sampleSizeSummary: {
      totalApplications,
      completedCycles,
      interviewStageCount,
      offersCount,
      rejectedCount,
      hasSufficientDataForTrends,
      dataConfidenceNotice,
    },
    conversionFunnel,
    skillGapFrequency,
    documentedFeedbackThemes,
    evidenceBackedImprovementPlan,
  };
}
