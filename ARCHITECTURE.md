# System Architecture & Technical Design
## Opportunity Intelligence Agent | Devlympics 2026 | NSUT

This document outlines the technical architecture, domain models, service boundaries, and security safeguards of the Opportunity Intelligence System.

---

## 1. High-Level Architecture Overview

```mermaid
flowchart TD
    subgraph Client["Next.js App Router Client"]
        LP[Landing Page & Demo Entry]
        DB[Personalized Dashboard]
        PF[Student Evidence Profile]
        DV[Document Vault & Review Modal]
        OP[Opportunity Discovery & Filters]
        IW[Investigation Workspace & Audit Table]
        PC[Preparation Centre & Practice Drill]
        AT[Application Tracker: Kanban & Table]
        PI[Progress & Outcome Intelligence]
    end

    subgraph API["Server Route Handlers & Boundaries"]
        AuthAPI["/api/auth (Hash, Sessions, Demo)"]
        ProfileAPI["/api/profile & /api/skills"]
        DocAPI["/api/documents & /api/documents/:id/confirm"]
        OppAPI["/api/opportunities & /api/opportunities/:id"]
        InvAPI["/api/investigation"]
        PrepAPI["/api/preparation & /api/practice"]
        AppAPI["/api/applications & /api/applications/:id/feedback"]
        InsightAPI["/api/insights"]
    end

    subgraph Intelligence["Agent Services & Engines"]
        InvEngine["Investigation Engine\n(Deterministic Hard Cutoffs + Soft Scoring)"]
        ResumeParser["Document Extractor\n(Structured Parsing + Confirmation Gate)"]
        PrepEngine["Preparation Intelligence\n(Stage Dissection + Mock Scoring)"]
        ProgressEngine["Progress Analyst\n(Sample Size Preservation + Outcome Rigor)"]
        AIService["AI Provider Switcher\n(Gemini 1.5 Live <--> Deterministic Engine)"]
    end

    subgraph Data["Persistence & Private Storage"]
        PrismaORM["Prisma ORM 7 + LibSQL Adapter"]
        SQLiteDB[("SQLite Database (dev.db)")]
        PrivateDisk["Private Storage\n(storage/documents/<userId>/)"]
    end

    Client --> API
    API --> Intelligence
    API --> PrismaORM
    DocAPI --> PrivateDisk
    PrismaORM --> SQLiteDB
    Intelligence --> AIService
```

---

## 2. Core Service Boundaries

### A. Authentication & Session Boundary (`src/lib/auth.ts`)
- **Password Security:** Uses `bcryptjs` with salt rounds = 10.
- **Session Tokens:** Cryptographically random 32-byte hex tokens stored in the `Session` table.
- **Cookie Security:** Issued as `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, and `secure: true` in production.
- **Access Control:** `getCurrentUser()` and `requireAuth()` validate session validity and expiration before any user resource is accessed.
- **Demo Mode Isolation:** A dedicated demo student account (`priya.sharma@nsut.ac.in`) allows instant, safe evaluations without exposing private student credentials.

### B. Student Evidence Profile Boundary (`src/app/api/profile`, `src/app/api/skills`, `src/app/api/projects`)
- Separates self-reported skills from verified credentials.
- Binds skills to concrete proof links (GitHub repositories, LeetCode profile, marksheet transcripts).
- Calculates a dynamic profile completeness score based on verified dimensions.

### C. Document Vault & Confirmation Gate (`src/app/api/documents`)
- Files are saved outside public static assets in `storage/documents/<userId>/`.
- Text is extracted and passed to `extractResumeData()`.
- **Strict Rule:** Extracted data is saved with `isConfirmed: false` in an unconfirmed JSON buffer. It only updates the student's profile once the user has reviewed and submitted the **Extraction Review Modal**.

### D. Opportunity Investigation Engine (`src/lib/ai/investigator.ts`)
1. **Retrieve:** Fetches the opportunity, its official sources, and published requirements.
2. **Deterministic Evaluation:**
   - Evaluates graduation batches: `eligibleGradYears.includes(studentGradYear)`.
   - Evaluates academic cutoffs: `studentCgpa >= minCgpa`.
   - Evaluates mandatory skills: Checks verified skills and project repositories.
3. **Evidence Classification:**
   - `SATISFIED`: Clear proof link or confirmed project repository.
   - `NOT_SATISFIED`: Unmet published cutoff (e.g. batch mismatch).
   - `NEEDS_CONFIRMATION`: Self-reported skill without repository evidence.
   - `NO_EVIDENCE_FOUND`: Missing from student profile (explicitly distinguished from failed).
   - `AMBIGUOUS_SOURCE`: Opportunity text is vague.
4. **Overall Status Decision Tree:**
   - Failed mandatory cutoff $\rightarrow$ `LIKELY_INELIGIBLE` (capped score $\le 35$).
   - All mandatory criteria satisfied with verified evidence $\rightarrow$ `APPEARS_ELIGIBLE`.
   - Missing mandatory evidence $\rightarrow$ `POTENTIALLY_ELIGIBLE`.
   - Missing critical data from both sides $\rightarrow$ `INSUFFICIENT_INFORMATION`.

### E. Preparation Intelligence Engine (`src/lib/ai/preparation.ts`)
- Synthesizes opportunity-specific roadmaps based on required tech stacks.
- Labels every stage with its evidence basis:
  - `OFFICIAL_STAGE`: Stated on employer career portal.
  - `CANDIDATE_REPORTED`: Historical candidate experience.
  - `AI_INFERRED`: Logical preparation recommendation.
- Provides interactive mock drills with instant structured evaluation (strengths, improvements, score estimate).

### F. Application & Outcome Intelligence (`src/lib/ai/progress.ts`)
- Manages the complete hiring lifecycle: `SAVED` $\rightarrow$ `PREPARING` $\rightarrow$ `APPLIED` $\rightarrow$ `ASSESSMENT_SCHEDULED` $\rightarrow$ `INTERVIEW_SCHEDULED` $\rightarrow$ `OFFER_RECEIVED` / `REJECTED`.
- Every transition appends an immutable audit log to `ApplicationStatusHistory`.
- Feedback is recorded with source attribution (`EMPLOYER_EMAIL`, `INTERVIEWER_NOTES`, `PORTAL_MESSAGE`).
- If no reason was given, the system records `Unknown` and explicitly warns against speculative assumptions.
- Analytics compute the conversion funnel and preserve sample size ($n=x$).

---

## 3. Database Schema Design (Prisma ORM)

```mermaid
erDiagram
    User ||--o| StudentProfile : "has"
    User ||--o{ Session : "authenticates"
    User ||--o{ Document : "owns"
    User ||--o{ Investigation : "runs"
    User ||--o{ PreparationPlan : "develops"
    User ||--o{ Application : "tracks"
    User ||--o{ PracticeSession : "conducts"
    User ||--o{ Notification : "receives"

    StudentProfile ||--o{ UserSkill : "contains"
    StudentProfile ||--o{ Project : "showcases"
    StudentProfile ||--o{ Experience : "records"
    Skill ||--o{ UserSkill : "cataloged in"

    Opportunity ||--o{ OpportunitySource : "evidenced by"
    Opportunity ||--o{ OpportunityRequirement : "mandates"
    Opportunity ||--o{ Investigation : "evaluated in"
    Opportunity ||--o{ PreparationPlan : "targets"
    Opportunity ||--o{ Application : "applied to"

    Investigation ||--o{ InvestigationFinding : "itemizes"
    PreparationPlan ||--o{ PreparationTask : "contains"
    PreparationPlan ||--o{ PreparationResource : "recommends"
    Application ||--o{ ApplicationStatusHistory : "logs"
    Application ||--o| ApplicationFeedback : "receives"
```

---

## 4. AI Provider & Fallback Strategy

The application implements a provider-independent AI interface (`src/lib/ai/gemini.ts`):
- When `GEMINI_API_KEY` is present and valid, calls Google Gemini 1.5/2.0 with temperature $0.2$ and JSON structured schema validation.
- When `GEMINI_API_KEY` is missing or when a rate limit / network timeout occurs, the system seamlessly transitions to our deterministic rule engine.
- Every investigation report and the top navbar explicitly indicate which engine generated the findings (`GEMINI_LIVE` vs `DEMO_DETERMINISTIC`).

---

## 5. Security & Trust Measures

- **No Frontend AI Calls:** API keys and external model invocations are 100% server-side.
- **Input Sanitization:** Every API endpoint validates payloads via `zod` schemas.
- **Path Traversal Protection:** Stored document file paths are sanitized with timestamps and UUID-style naming.
- **Access Control:** All mutating actions verify `userId` matching the authenticated session.
