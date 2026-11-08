import { callGeminiJSON } from "./gemini";

export interface StudentProfileForInvestigation {
  displayName?: string | null;
  institution?: string | null;
  degree?: string | null;
  branch?: string | null;
  graduationYear?: number | null;
  cgpa?: number | null;
  location?: string | null;
  workPreference: string;
  skills: {
    name: string;
    proficiency: string;
    isVerified: boolean;
    verificationSource?: string | null;
    evidenceNotes?: string | null;
  }[];
  projects: {
    title: string;
    technologies: string[];
    description: string;
    githubUrl?: string | null;
    liveUrl?: string | null;
  }[];
  experiences: {
    title: string;
    organisation: string;
    experienceType: string;
    description: string;
  }[];
}

export interface OpportunityForInvestigation {
  id: string;
  title: string;
  organisation: string;
  category: string;
  location: string;
  workArrangement: string;
  requiredEducation?: string | null;
  eligibleGradYears?: string[] | null;
  requiredSkills: string[];
  preferredSkills?: string[] | null;
  minCgpa?: number | null;
  experienceYears?: number | null;
  applicationDeadline?: Date | null;
  requirements: {
    requirementText: string;
    category: string;
    isMandatory: boolean;
    sourceSnippet?: string | null;
  }[];
  sources: {
    sourceName: string;
    sourceUrl: string;
    trustLevel: string;
  }[];
}

export interface FindingResult {
  requirementText: string;
  isMandatory: boolean;
  category: string;
  evaluationStatus: "SATISFIED" | "NOT_SATISFIED" | "NEEDS_CONFIRMATION" | "NO_EVIDENCE_FOUND" | "AMBIGUOUS_SOURCE";
  evidenceFound: string | null;
  sourceSnippet: string | null;
  explanation: string;
  recommendedAction: string | null;
}

export interface InvestigationReport {
  overallEligibility: "CONFIRMED_ELIGIBLE" | "APPEARS_ELIGIBLE" | "POTENTIALLY_ELIGIBLE" | "LIKELY_INELIGIBLE" | "INSUFFICIENT_INFORMATION";
  hardRequirementsMet: number;
  totalMandatoryRequirements: number;
  suitabilityScore: number;
  summary: string;
  gapAnalysis: string;
  riskFactors: string[];
  recommendations: string[];
  findings: FindingResult[];
  engineUsed: "GEMINI_LIVE" | "DEMO_DETERMINISTIC";
}

export async function runOpportunityInvestigation(
  student: StudentProfileForInvestigation,
  opportunity: OpportunityForInvestigation
): Promise<InvestigationReport> {
  // Deterministic evaluation of hard requirements
  const findings: FindingResult[] = [];
  const studentSkillNames = student.skills.map((s) => s.name.toLowerCase().trim());
  const projectTechs = student.projects.flatMap((p) => p.technologies.map((t) => t.toLowerCase().trim()));
  const allKnownTechs = new Set([...studentSkillNames, ...projectTechs]);

  let mandatoryCount = 0;
  let mandatoryMet = 0;
  let hasFailedMandatory = false;
  let hasMissingMandatoryEvidence = false;

  // 1. Evaluate Graduation Year if specified
  if (opportunity.eligibleGradYears && opportunity.eligibleGradYears.length > 0) {
    mandatoryCount++;
    const reqText = `Graduation Year: Eligible batches ${opportunity.eligibleGradYears.join(", ")}`;
    if (!student.graduationYear) {
      hasMissingMandatoryEvidence = true;
      findings.push({
        requirementText: reqText,
        isMandatory: true,
        category: "EDUCATION",
        evaluationStatus: "NEEDS_CONFIRMATION",
        evidenceFound: null,
        sourceSnippet: `Eligible batches: ${opportunity.eligibleGradYears.join(", ")}`,
        explanation: "Your graduation year is not specified in your profile. Please confirm your expected year of graduation.",
        recommendedAction: "Update academic profile with your graduation year.",
      });
    } else if (opportunity.eligibleGradYears.includes(String(student.graduationYear))) {
      mandatoryMet++;
      findings.push({
        requirementText: reqText,
        isMandatory: true,
        category: "EDUCATION",
        evaluationStatus: "SATISFIED",
        evidenceFound: `Student graduation year: ${student.graduationYear} (${student.institution || "College"})`,
        sourceSnippet: `Eligible batches: ${opportunity.eligibleGradYears.join(", ")}`,
        explanation: `Your graduation year (${student.graduationYear}) is within the eligible graduating batches.`,
        recommendedAction: null,
      });
    } else {
      hasFailedMandatory = true;
      findings.push({
        requirementText: reqText,
        isMandatory: true,
        category: "EDUCATION",
        evaluationStatus: "NOT_SATISFIED",
        evidenceFound: `Student graduation year: ${student.graduationYear}`,
        sourceSnippet: `Eligible batches: ${opportunity.eligibleGradYears.join(", ")}`,
        explanation: `The listing specifies batches ${opportunity.eligibleGradYears.join(", ")}, but your profile lists ${student.graduationYear}. This is a published hard cutoff.`,
        recommendedAction: "Check with hiring contact if exceptions exist, or focus on roles targeting your graduating batch.",
      });
    }
  }

  // 2. Evaluate CGPA if specified
  if (opportunity.minCgpa !== null && opportunity.minCgpa !== undefined && opportunity.minCgpa > 0) {
    mandatoryCount++;
    const reqText = `Minimum Academic Performance: CGPA >= ${opportunity.minCgpa.toFixed(2)}`;
    if (student.cgpa === null || student.cgpa === undefined) {
      hasMissingMandatoryEvidence = true;
      findings.push({
        requirementText: reqText,
        isMandatory: true,
        category: "CGPA",
        evaluationStatus: "NEEDS_CONFIRMATION",
        evidenceFound: null,
        sourceSnippet: `Minimum CGPA required: ${opportunity.minCgpa}`,
        explanation: "No CGPA is recorded on your profile. The employer has a stated academic cutoff.",
        recommendedAction: "Add your latest semester CGPA or university percentage to confirm eligibility.",
      });
    } else if (student.cgpa >= opportunity.minCgpa) {
      mandatoryMet++;
      findings.push({
        requirementText: reqText,
        isMandatory: true,
        category: "CGPA",
        evaluationStatus: "SATISFIED",
        evidenceFound: `Student CGPA: ${student.cgpa.toFixed(2)}`,
        sourceSnippet: `Minimum CGPA required: ${opportunity.minCgpa}`,
        explanation: `Your CGPA (${student.cgpa.toFixed(2)}) meets or exceeds the minimum required (${opportunity.minCgpa.toFixed(2)}).`,
        recommendedAction: null,
      });
    } else {
      hasFailedMandatory = true;
      findings.push({
        requirementText: reqText,
        isMandatory: true,
        category: "CGPA",
        evaluationStatus: "NOT_SATISFIED",
        evidenceFound: `Student CGPA: ${student.cgpa.toFixed(2)}`,
        sourceSnippet: `Minimum CGPA required: ${opportunity.minCgpa}`,
        explanation: `Your recorded CGPA (${student.cgpa.toFixed(2)}) is below the published minimum of ${opportunity.minCgpa.toFixed(2)}.`,
        recommendedAction: "Check if non-academic projects or referrals allow waiving the threshold, or prioritize listings without strict CGPA filters.",
      });
    }
  }

  // 3. Evaluate Required Skills
  for (const skill of opportunity.requiredSkills) {
    mandatoryCount++;
    const skillLower = skill.toLowerCase().trim();
    const exactSkill = student.skills.find((s) => s.name.toLowerCase().trim() === skillLower);
    const inProjects = student.projects.some((p) =>
      p.technologies.some((t) => t.toLowerCase().trim() === skillLower)
    );

    if (exactSkill && exactSkill.isVerified) {
      mandatoryMet++;
      findings.push({
        requirementText: `Proficiency in ${skill}`,
        isMandatory: true,
        category: "SKILL",
        evaluationStatus: "SATISFIED",
        evidenceFound: `Verified Skill: ${exactSkill.name} (${exactSkill.proficiency})${exactSkill.verificationSource ? ` via ${exactSkill.verificationSource}` : ""}`,
        sourceSnippet: `Required Skills: ${skill}`,
        explanation: `You have independently verified evidence demonstrating ${skill}.`,
        recommendedAction: null,
      });
    } else if (exactSkill && inProjects) {
      mandatoryMet++;
      findings.push({
        requirementText: `Proficiency in ${skill}`,
        isMandatory: true,
        category: "SKILL",
        evaluationStatus: "SATISFIED",
        evidenceFound: `Self-reported skill with concrete project implementation in ${student.projects.filter(p => p.technologies.some(t => t.toLowerCase() === skillLower)).map(p => p.title).join(", ")}`,
        sourceSnippet: `Required Skills: ${skill}`,
        explanation: `You have applied ${skill} in tangible portfolio projects with codebase links.`,
        recommendedAction: "Consider adding test cases or deployment metrics to strengthen this evidence.",
      });
    } else if (exactSkill) {
      findings.push({
        requirementText: `Proficiency in ${skill}`,
        isMandatory: true,
        category: "SKILL",
        evaluationStatus: "NEEDS_CONFIRMATION",
        evidenceFound: `Self-reported skill (${exactSkill.proficiency}), but no linked project evidence found.`,
        sourceSnippet: `Required Skills: ${skill}`,
        explanation: `You have listed ${skill} on your profile, but without code repository or project artifacts, evaluators may consider this unverified.`,
        recommendedAction: `Link a GitHub project or certificate demonstrating ${skill}.`,
      });
    } else if (inProjects) {
      mandatoryMet++;
      findings.push({
        requirementText: `Proficiency in ${skill}`,
        isMandatory: true,
        category: "SKILL",
        evaluationStatus: "SATISFIED",
        evidenceFound: `Applied in project: ${student.projects.find(p => p.technologies.some(t => t.toLowerCase() === skillLower))?.title}`,
        sourceSnippet: `Required Skills: ${skill}`,
        explanation: `Demonstrated through project experience although not listed in primary skills list.`,
        recommendedAction: `Explicitly add ${skill} to your profile skills table.`,
      });
    } else {
      hasMissingMandatoryEvidence = true;
      findings.push({
        requirementText: `Proficiency in ${skill}`,
        isMandatory: true,
        category: "SKILL",
        evaluationStatus: "NO_EVIDENCE_FOUND",
        evidenceFound: null,
        sourceSnippet: `Required Skills: ${skill}`,
        explanation: `No mention of ${skill} was found in your skills, projects, or work experiences. (Note: No evidence found does not mean you cannot learn it).`,
        recommendedAction: `Review our Preparation Center module for ${skill} or complete a targeted project before applying.`,
      });
    }
  }

  // 4. Evaluate Preferred Skills (Non-mandatory)
  if (opportunity.preferredSkills) {
    for (const prefSkill of opportunity.preferredSkills) {
      const prefLower = prefSkill.toLowerCase().trim();
      const hasSkill = allKnownTechs.has(prefLower);
      if (hasSkill) {
        findings.push({
          requirementText: `Preferred: ${prefSkill}`,
          isMandatory: false,
          category: "SKILL",
          evaluationStatus: "SATISFIED",
          evidenceFound: `Present in profile/projects (${prefSkill})`,
          sourceSnippet: `Preferred Skills: ${prefSkill}`,
          explanation: `Bonus qualification: You demonstrate capability in this preferred skill.`,
          recommendedAction: null,
        });
      } else {
        findings.push({
          requirementText: `Preferred: ${prefSkill}`,
          isMandatory: false,
          category: "SKILL",
          evaluationStatus: "NO_EVIDENCE_FOUND",
          evidenceFound: null,
          sourceSnippet: `Preferred Skills: ${prefSkill}`,
          explanation: `This is a nice-to-have skill. Lack of evidence does not disqualify you.`,
          recommendedAction: `Optional: Skim overview docs in Preparation Center.`,
        });
      }
    }
  }

  // Determine overall eligibility strictly based on hard conditions
  let overallEligibility: "CONFIRMED_ELIGIBLE" | "APPEARS_ELIGIBLE" | "POTENTIALLY_ELIGIBLE" | "LIKELY_INELIGIBLE" | "INSUFFICIENT_INFORMATION";
  if (hasFailedMandatory) {
    overallEligibility = "LIKELY_INELIGIBLE";
  } else if (mandatoryCount === 0) {
    overallEligibility = "INSUFFICIENT_INFORMATION";
  } else if (mandatoryMet === mandatoryCount) {
    overallEligibility = "APPEARS_ELIGIBLE";
  } else if (hasMissingMandatoryEvidence) {
    overallEligibility = "POTENTIALLY_ELIGIBLE";
  } else {
    overallEligibility = "POTENTIALLY_ELIGIBLE";
  }

  // Calculate soft suitability score (0-100)
  const satisfiedMandatoryRatio = mandatoryCount > 0 ? mandatoryMet / mandatoryCount : 0.5;
  const preferredTotal = opportunity.preferredSkills?.length || 1;
  const preferredMet = opportunity.preferredSkills?.filter((p) => allKnownTechs.has(p.toLowerCase().trim())).length || 0;
  const preferredRatio = preferredTotal > 0 ? preferredMet / preferredTotal : 0;

  // If hard requirement failed, suitability cannot exceed 40
  let suitabilityScore = Math.round(satisfiedMandatoryRatio * 75 + preferredRatio * 25);
  if (hasFailedMandatory) {
    suitabilityScore = Math.min(suitabilityScore, 35);
  }

  // Build structured summary and gap analysis
  const missingSkills = opportunity.requiredSkills.filter(
    (s) => !allKnownTechs.has(s.toLowerCase().trim())
  );

  const fallbackReport: Omit<InvestigationReport, "findings" | "engineUsed"> = {
    overallEligibility,
    hardRequirementsMet: mandatoryMet,
    totalMandatoryRequirements: mandatoryCount,
    suitabilityScore,
    summary:
      overallEligibility === "APPEARS_ELIGIBLE"
        ? `You appear eligible for ${opportunity.title} at ${opportunity.organisation}. Your academic background and demonstrated technical competencies align with the published requirements.`
        : overallEligibility === "POTENTIALLY_ELIGIBLE"
        ? `You are potentially eligible for ${opportunity.title} at ${opportunity.organisation}, but certain required evidence is missing or needs confirmation before you submit.`
        : overallEligibility === "LIKELY_INELIGIBLE"
        ? `Based on published criteria, you appear unlikely to meet mandatory cutoffs for ${opportunity.title} (such as graduation batch or minimum CGPA).`
        : `Insufficient information exists to conclusively evaluate eligibility for ${opportunity.title}.`,
    gapAnalysis:
      missingSkills.length > 0
        ? `Identified skill gap: The opportunity requires [${missingSkills.join(", ")}], for which no concrete evidence exists in your profile or repositories.`
        : "No critical skill gaps identified. All stated mandatory technical competencies are evidenced.",
    riskFactors: [
      ...(hasFailedMandatory ? ["One or more mandatory cutoffs are not satisfied."] : []),
      ...(missingSkills.length > 0 ? [`Missing portfolio evidence for: ${missingSkills.join(", ")}`] : []),
      "Selection processes evaluate candidates holistically; eligibility does not guarantee an interview or offer.",
    ],
    recommendations: [
      ...(missingSkills.length > 0
        ? [`Prioritize reviewing fundamental concepts for ${missingSkills[0]} in the Preparation Center.`]
        : []),
      "Ensure your uploaded résumé highlights the exact matching projects cited in this investigation.",
      "Track your application status and submission deadline in the Application Tracker.",
    ],
  };

  // Live AI refinement prompt if GEMINI_API_KEY is available
  const prompt = `
You are the Opportunity Intelligence Agent analyzing a student against an opportunity.
Student: ${JSON.stringify({
    degree: student.degree,
    branch: student.branch,
    gradYear: student.graduationYear,
    cgpa: student.cgpa,
    skills: student.skills.map((s) => s.name),
    projects: student.projects.map((p) => ({ title: p.title, techs: p.technologies })),
  })}
Opportunity: ${JSON.stringify({
    title: opportunity.title,
    organisation: opportunity.organisation,
    requiredSkills: opportunity.requiredSkills,
    preferredSkills: opportunity.preferredSkills,
    eligibleGradYears: opportunity.eligibleGradYears,
    minCgpa: opportunity.minCgpa,
  })}
Findings summary: Mandatory met ${mandatoryMet}/${mandatoryCount}. Status: ${overallEligibility}. Missing skills: ${missingSkills.join(", ")}.

Provide a JSON object adhering to this schema:
{
  "summary": "Concise 2-3 sentence evidence-backed overview",
  "gapAnalysis": "Specific gap breakdown referencing actual student profile and opportunity expectations",
  "riskFactors": ["Risk 1", "Risk 2"],
  "recommendations": ["Actionable step 1", "Actionable step 2"]
}
`;

  const aiResult = await callGeminiJSON(prompt, () => fallbackReport);

  return {
    overallEligibility,
    hardRequirementsMet: mandatoryMet,
    totalMandatoryRequirements: mandatoryCount,
    suitabilityScore,
    summary: aiResult.data.summary || fallbackReport.summary,
    gapAnalysis: aiResult.data.gapAnalysis || fallbackReport.gapAnalysis,
    riskFactors: aiResult.data.riskFactors || fallbackReport.riskFactors,
    recommendations: aiResult.data.recommendations || fallbackReport.recommendations,
    findings,
    engineUsed: aiResult.source,
  };
}
