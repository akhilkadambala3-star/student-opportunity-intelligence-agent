import assert from "node:assert/strict";
import test from "node:test";
import { runOpportunityInvestigation } from "../src/lib/ai/investigator";
import { extractResumeData } from "../src/lib/ai/resume-extractor";
import { generateProgressIntelligence } from "../src/lib/ai/progress";
import { getAIProviderStatus } from "../src/lib/ai/gemini";

// Principle 1: Hard eligibility condition fails -> LIKELY_INELIGIBLE and score <= 35
test("Rule: Failed mandatory eligibility condition cannot be overridden by soft score", async () => {
  const student = {
    displayName: "Priya Sharma",
    institution: "NSUT",
    degree: "B.Tech",
    branch: "CSE",
    graduationYear: 2026,
    cgpa: 8.65,
    location: "Delhi",
    workPreference: "HYBRID",
    skills: [
      { name: "TypeScript", proficiency: "ADVANCED", isVerified: true },
      { name: "React", proficiency: "ADVANCED", isVerified: true },
      { name: "Next.js", proficiency: "ADVANCED", isVerified: true },
      { name: "Python", proficiency: "INTERMEDIATE", isVerified: true },
      { name: "Data Structures & Algorithms", proficiency: "ADVANCED", isVerified: true },
    ],
    projects: [
      {
        title: "Full Stack Platform",
        technologies: ["TypeScript", "Next.js", "Prisma"],
        description: "Enterprise app",
      },
    ],
    experiences: [],
  };

  // Opportunity strictly requiring batch 2024 or 2025 (Priya is 2026)
  const oppWithHardBatchCutoff = {
    id: "opp-batch-fail",
    title: "SDE-1 2024/2025 Immediate Joining",
    organisation: "Amazon",
    category: "FULL_TIME",
    location: "Bengaluru",
    workArrangement: "ONSITE",
    eligibleGradYears: ["2024", "2025"],
    requiredSkills: ["TypeScript", "Data Structures & Algorithms"],
    requirements: [],
    sources: [],
  };

  const report = await runOpportunityInvestigation(student, oppWithHardBatchCutoff);

  assert.equal(
    report.overallEligibility,
    "LIKELY_INELIGIBLE",
    "Candidate with failed mandatory batch cutoff must be LIKELY_INELIGIBLE"
  );
  assert.ok(
    report.suitabilityScore <= 35,
    "Suitability score must be capped when a hard requirement fails"
  );
  const batchFinding = report.findings.find((f) => f.category === "EDUCATION");
  assert.ok(batchFinding, "Must produce a finding for education cutoff");
  assert.equal(batchFinding?.evaluationStatus, "NOT_SATISFIED");
});

// Principle 2: Missing requirement evidence remains NO_EVIDENCE_FOUND, not failed or satisfied
test("Rule: Missing requirement evidence remains NO_EVIDENCE_FOUND", async () => {
  const student = {
    displayName: "Rohan Verma",
    institution: "NSUT",
    graduationYear: 2026,
    cgpa: 8.2,
    workPreference: "ANY",
    skills: [{ name: "Python", proficiency: "INTERMEDIATE", isVerified: true }],
    projects: [],
    experiences: [],
  };

  const oppRequiringDocker = {
    id: "opp-docker",
    title: "Cloud Intern",
    organisation: "Microsoft",
    category: "INTERNSHIP",
    location: "Noida",
    workArrangement: "HYBRID",
    eligibleGradYears: ["2026"],
    requiredSkills: ["Docker", "Python"],
    requirements: [],
    sources: [],
  };

  const report = await runOpportunityInvestigation(student, oppRequiringDocker);

  const dockerFinding = report.findings.find((f) => f.requirementText.includes("Docker"));
  assert.ok(dockerFinding, "Must find Docker requirement");
  assert.equal(
    dockerFinding?.evaluationStatus,
    "NO_EVIDENCE_FOUND",
    "Missing skill must be marked NO_EVIDENCE_FOUND"
  );
  assert.notEqual(
    report.overallEligibility,
    "APPEARS_ELIGIBLE",
    "Cannot appear eligible when mandatory skill has no evidence"
  );
});

// Principle 3: Fully satisfied hard requirements produces APPEARS_ELIGIBLE
test("Rule: When all mandatory cutoffs are evidenced, overall eligibility is APPEARS_ELIGIBLE", async () => {
  const student = {
    displayName: "Priya Sharma",
    institution: "NSUT",
    graduationYear: 2026,
    cgpa: 8.65,
    workPreference: "HYBRID",
    skills: [
      { name: "Data Structures & Algorithms", proficiency: "ADVANCED", isVerified: true },
      { name: "TypeScript", proficiency: "ADVANCED", isVerified: true },
      { name: "Python", proficiency: "INTERMEDIATE", isVerified: true },
    ],
    projects: [
      {
        title: "Distributed Task Scheduler",
        technologies: ["TypeScript", "Python"],
        description: "Concurrent engine",
      },
    ],
    experiences: [],
  };

  const oppGoogle = {
    id: "opp-google",
    title: "SWE Intern",
    organisation: "Google",
    category: "INTERNSHIP",
    location: "Bengaluru",
    workArrangement: "HYBRID",
    eligibleGradYears: ["2026", "2027"],
    minCgpa: 7.5,
    requiredSkills: ["Data Structures & Algorithms", "TypeScript"],
    requirements: [],
    sources: [],
  };

  const report = await runOpportunityInvestigation(student, oppGoogle);

  assert.equal(report.overallEligibility, "APPEARS_ELIGIBLE");
  assert.equal(report.hardRequirementsMet, 4); // grad year, cgpa, DSA, TypeScript
});

// Principle 4: Progress intelligence displays sample sizes and avoids causal claims
test("Rule: Progress intelligence includes explicit sample sizes and avoids unsupported causality", () => {
  const report = generateProgressIntelligence({
    totalApplications: 3,
    byStatus: { SAVED: 1, APPLIED: 1, REJECTED: 1 },
    byCategory: { INTERNSHIP: 3 },
    outcomes: [
      {
        outcome: "REJECTED",
        organisation: "Atlassian",
        targetRole: "Intern",
        feedbackReceived: false,
        statedImprovementAreas: [],
        isEvidenceBacked: false,
      },
    ],
    targetOpportunitiesSkills: [{ skill: "Docker", frequency: 2 }],
    userSkills: ["TypeScript", "React"],
  });

  assert.equal(report.sampleSizeSummary.totalApplications, 3);
  assert.equal(report.sampleSizeSummary.hasSufficientDataForTrends, false);
  assert.ok(
    report.sampleSizeSummary.dataConfidenceNotice.includes("n=3"),
    "Notice must specify sample size n=3"
  );
  assert.ok(
    report.documentedFeedbackThemes.some((t) => t.theme.includes("Unknown")),
    "When employer gave no feedback, reason must be explicitly labeled Unknown"
  );
});

// Principle 5: AI Provider status gracefully handles missing API key
test("Rule: Missing GEMINI_API_KEY activates clearly labeled Demo Engine", () => {
  const status = getAIProviderStatus();
  assert.ok(status.provider, "Provider must be defined");
  if (!process.env.GEMINI_API_KEY) {
    assert.equal(status.provider, "DEMO_DETERMINISTIC");
    assert.ok(status.statusMessage.includes("Demo Mode active"));
  }
});

// Principle 6: Résumé extractor identifies unconfirmed fields
test("Rule: Document extractor returns unconfirmed draft requiring user validation", async () => {
  const sampleResumeText = `
Priya Sharma
NSUT Delhi
B.Tech Computer Science 2026
CGPA: 8.65
Skills: TypeScript, Next.js, Python, Prisma
Projects: Opportunity Intelligence Agent
`;

  const extracted = await extractResumeData(sampleResumeText);
  assert.equal(extracted.graduationYear, 2026);
  assert.ok(extracted.skills.some((s) => s.name === "TypeScript"));
  assert.ok(extracted.uncertainOrMissing.length > 0, "Must highlight uncertain or missing items");
});
