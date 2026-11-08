import { callGeminiJSON } from "./gemini";

export interface PrepTaskBlueprint {
  title: string;
  category: "SCREENING" | "CODING" | "TECHNICAL_ROUND" | "SYSTEM_DESIGN" | "HR_BEHAVIORAL" | "PROJECT_DEFENSE" | "DOCUMENT_PREP";
  description: string;
  evidenceBasis: "OFFICIAL_STAGE" | "CANDIDATE_REPORTED" | "AI_INFERRED";
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedMinutes: number;
  resourceUrl?: string;
}

export interface PrepResourceBlueprint {
  title: string;
  resourceType: "ARTICLE" | "DOCUMENTATION" | "PRACTICE_SET" | "VIDEO" | "INTERVIEW_EXPERIENCE";
  url: string;
  summary: string;
  isOfficial: boolean;
}

export interface PracticeQuestionBlueprint {
  topic: string;
  question: string;
  questionType: "TECHNICAL" | "APTITUDE" | "BEHAVIORAL" | "PROJECT_EXPLANATION";
  expectedKeyPoints: string[];
  sampleModelAnswer: string;
}

export interface PrepPlanBlueprint {
  title: string;
  estimatedHours: number;
  tasks: PrepTaskBlueprint[];
  resources: PrepResourceBlueprint[];
  practiceQuestions: PracticeQuestionBlueprint[];
}

export async function generateOpportunityPrepPlan(
  opportunityTitle: string,
  organisation: string,
  requiredSkills: string[],
  category: string
): Promise<PrepPlanBlueprint> {
  const fallbackPlan = (): PrepPlanBlueprint => {
    const isTech = category === "INTERNSHIP" || category === "FULL_TIME";
    return {
      title: `${organisation} - ${opportunityTitle} Tactical Preparation Blueprint`,
      estimatedHours: 24,
      tasks: [
        {
          title: "Verify Document Checklist & Format Official Transcript",
          category: "DOCUMENT_PREP",
          description: "Align your résumé bullet points with required skills and format official semester marksheets as requested in the portal guidelines.",
          evidenceBasis: "OFFICIAL_STAGE",
          priority: "HIGH",
          estimatedMinutes: 45,
          resourceUrl: "https://careers.google.com/how-we-hire/",
        },
        {
          title: "Online Assessment (OA): Timed DSA & Problem Solving",
          category: "CODING",
          description: "Practice 75 core LeetCode pattern questions focusing on Array two-pointers, Hash Maps, Binary Search, and Tree traversals with 30-min timer constraints.",
          evidenceBasis: "CANDIDATE_REPORTED",
          priority: "HIGH",
          estimatedMinutes: 180,
          resourceUrl: "https://leetcode.com/explore/interview/card/top-interview-questions-easy/",
        },
        {
          title: `Technical Deep-Dive: Core Proficiency in ${requiredSkills[0] || "Core Stack"}`,
          category: "TECHNICAL_ROUND",
          description: `Review runtime semantics, memory management, and asynchronous patterns in ${requiredSkills.join(", ")}. Be ready to live-code features.`,
          evidenceBasis: "OFFICIAL_STAGE",
          priority: "HIGH",
          estimatedMinutes: 120,
          resourceUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        },
        {
          title: "System Architecture & API Design Discussion",
          category: "SYSTEM_DESIGN",
          description: "Prepare an architectural diagram of one of your featured projects. Explain caching, database schema tradeoffs, and how you handled latency or errors.",
          evidenceBasis: "AI_INFERRED",
          priority: "MEDIUM",
          estimatedMinutes: 90,
          resourceUrl: "https://github.com/donnemartin/system-design-primer",
        },
        {
          title: "STAR-Method Behavioral & Situational Interview Defense",
          category: "HR_BEHAVIORAL",
          description: "Structure 4 stories: A difficult technical bug you solved, a disagreement on architecture, a tight deadline compromise, and an initiative you led.",
          evidenceBasis: "OFFICIAL_STAGE",
          priority: "MEDIUM",
          estimatedMinutes: 60,
          resourceUrl: "https://www.themuse.com/advice/star-interview-method",
        },
      ],
      resources: [
        {
          title: `${organisation} Official Engineering Culture & Interview Guide`,
          resourceType: "DOCUMENTATION",
          url: "https://careers.google.com/how-we-hire/interviewing/",
          summary: "Official guidance straight from the hiring team detailing stages, rubric, and behavioral principles.",
          isOfficial: true,
        },
        {
          title: "NeetCode Roadmap & Curated Algorithm Patterns",
          resourceType: "PRACTICE_SET",
          url: "https://neetcode.io/roadmap",
          summary: "Visual problem roadmap breaking down data structure patterns frequently asked in technical screenings.",
          isOfficial: false,
        },
        {
          title: "High-Frequency System Design Tradeoffs for Entry-Level Engineers",
          resourceType: "ARTICLE",
          url: "https://github.com/donnemartin/system-design-primer",
          summary: "Essential primer covering REST vs WebSockets, SQL vs NoSQL indexes, and caching strategies.",
          isOfficial: false,
        },
      ],
      practiceQuestions: [
        {
          topic: requiredSkills[0] || "Full Stack Architecture",
          question: `In a production application using ${requiredSkills[0] || "modern TypeScript"}, how would you handle optimistic UI updates while ensuring database consistency when network requests fail?`,
          questionType: "TECHNICAL",
          expectedKeyPoints: [
            "Immediate local state mutation for responsive UX",
            "Rollback mechanism / rollback action snapshot on rejection",
            "User-friendly error notification (toast / banner) with retry capability",
            "Idempotency keys on the server to prevent duplicate execution",
          ],
          sampleModelAnswer:
            "I would immediately update the UI state using a snapshot store (like React cache or Zustand optimistic update), while dispatching the async mutation to the API. If the server returns an error, I catch it, revert the state to the previous snapshot, and alert the user with a retryable toast. On the backend, mutations use idempotency keys so network retries never produce duplicate database entries.",
        },
        {
          topic: "Project Architecture Defense",
          question: "Walk me through the most technically challenging bug or performance bottleneck in your primary project. How did you isolate it and what was the root cause?",
          questionType: "PROJECT_EXPLANATION",
          expectedKeyPoints: [
            "Clear metric of the problem (e.g. latency, memory leak, UI lock)",
            "Systematic debugging method (profiler, query logs, unit tests)",
            "Root cause explanation",
            "Long-term fix and regression prevention (test or monitoring)",
          ],
          sampleModelAnswer:
            "In our project, initial page loads suffered an 800ms lag under concurrent requests. Profiling revealed an N+1 query problem in Prisma where child associations were fetched individually. I refactored the query to use Prisma's `include` with indexed foreign keys, reducing query roundtrips from 14 down to 1 single join and slashing load time to under 120ms.",
        },
        {
          topic: "Behavioral: Engineering Teamwork",
          question: "Tell me about a time you had a strong technical disagreement with a teammate or peer. How did you resolve it?",
          questionType: "BEHAVIORAL",
          expectedKeyPoints: [
            "Professional context without blaming",
            "Data-driven or benchmark-backed argument",
            "Willingness to compromise for project goals",
            "Positive outcome and preserved relationship",
          ],
          sampleModelAnswer:
            "During a hackathon sprint, my teammate wanted to implement client-side filtering for search results, while I advocated for server-side pagination with database indexing. Rather than arguing opinions, we ran a quick benchmark with 2,000 mock items on a throttled mobile profile, demonstrating that client memory spiked. We agreed on server-side queries for performance, and paired together to deliver the API in under two hours.",
        },
      ],
    };
  };

  const prompt = `
Generate a tailored preparation blueprint for an opportunity.
Role: ${opportunityTitle} at ${organisation}.
Category: ${category}.
Key Skills: ${requiredSkills.join(", ")}.

Return ONLY valid JSON matching this schema:
{
  "title": string,
  "estimatedHours": number,
  "tasks": [
    {
      "title": string,
      "category": "SCREENING" | "CODING" | "TECHNICAL_ROUND" | "SYSTEM_DESIGN" | "HR_BEHAVIORAL" | "PROJECT_DEFENSE" | "DOCUMENT_PREP",
      "description": string,
      "evidenceBasis": "OFFICIAL_STAGE" | "CANDIDATE_REPORTED" | "AI_INFERRED",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "estimatedMinutes": number,
      "resourceUrl": string
    }
  ],
  "resources": [
    {
      "title": string,
      "resourceType": "ARTICLE" | "DOCUMENTATION" | "PRACTICE_SET" | "VIDEO" | "INTERVIEW_EXPERIENCE",
      "url": string,
      "summary": string,
      "isOfficial": boolean
    }
  ],
  "practiceQuestions": [
    {
      "topic": string,
      "question": string,
      "questionType": "TECHNICAL" | "APTITUDE" | "BEHAVIORAL" | "PROJECT_EXPLANATION",
      "expectedKeyPoints": [string],
      "sampleModelAnswer": string
    }
  ]
}
`;

  const result = await callGeminiJSON(prompt, fallbackPlan);
  return result.data;
}

export async function evaluatePracticeAnswer(
  question: string,
  questionType: string,
  expectedKeyPoints: string[],
  studentAnswer: string
): Promise<{
  aiFeedback: string;
  strengths: string[];
  improvements: string[];
  scoreEstimate: number;
}> {
  const fallbackFeedback = () => {
    const answerLen = studentAnswer.trim().length;
    let score = Math.min(Math.round((answerLen / 250) * 85), 90);
    if (score < 40) score = 45;

    const matchedPoints = expectedKeyPoints.filter((kp) => {
      const words = kp.toLowerCase().split(/\s+/).slice(0, 2);
      return words.some((w) => studentAnswer.toLowerCase().includes(w));
    });

    return {
      aiFeedback:
        answerLen > 100
          ? "Solid structured answer demonstrating practical understanding. Your response touches on key architectural trade-offs."
          : "Your answer outlines the core direction, but lacks specific technical depth, metrics, or defensive edge-case handling.",
      strengths:
        matchedPoints.length > 0
          ? matchedPoints.map((p) => `Addressed: ${p}`)
          : ["Demonstrated direct approach to the scenario", "Clarity in presentation"],
      improvements: [
        "Include concrete metrics or quantifiable outcomes (e.g. latency numbers, bundle sizes).",
        "Explicitly discuss trade-offs or edge-case failures (e.g. network drops, race conditions).",
      ],
      scoreEstimate: score,
    };
  };

  const prompt = `
Evaluate this student's practice interview response:
Question (${questionType}): "${question}"
Expected Key Points: ${JSON.stringify(expectedKeyPoints)}
Student's Answer: "${studentAnswer}"

Return ONLY valid JSON matching this schema:
{
  "aiFeedback": "Constructive 2-3 sentence assessment",
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "improvements": ["Actionable improvement 1", "Actionable improvement 2"],
  "scoreEstimate": number (0-100)
}
`;

  const result = await callGeminiJSON(prompt, fallbackFeedback);
  return result.data;
}
