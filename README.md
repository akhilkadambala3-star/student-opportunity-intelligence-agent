# Opportunity Intelligence Agent
> **Discover the right opportunity. Understand your chances. Prepare with purpose.**  
> *Devlympics 2026 | Netaji Subhas University of Technology (NSUT) | Theme: Bridge the Gap*

---

## 🌟 1. Overview & Vision

Students encounter opportunities across numerous corporate portals, government gazettes, scholarship platforms, fellowships, and hackathons. Even when relevant opportunities exist, students struggle to:
- Understand complicated eligibility criteria and hard cutoffs.
- Identify what evidence or documents are missing from their portfolio.
- Distinguish between verified claims, self-reported skills, and AI-inferred possibilities.
- Know how an organisation actually conducts its selection process.
- Learn from real, documented feedback without speculative guesswork.

The **Opportunity Intelligence Agent** serves as the persistent **Bridge**:
- **Side A (The Student):** Actual verified credentials, public repository code, academic cutoffs, and document vault.
- **Side B (The Opportunity):** Published official requirements, eligible graduation batches, selection stages, and deadlines.
- **The Bridge (Our Intelligence Agent):** Conducts independent audits, separates hard mandatory criteria from soft preferences, highlights missing evidence, synthesizes interview roadmaps, and analyzes progress from verified feedback.

---

## 🛡️ 2. Core Product Principles

1. **Evidence Before Assumptions:** Self-reported skills are visibly labeled and never confused with verified code or assessment scores.
2. **Transparent Explanations:** Requirement-by-requirement audit tables replace opaque "black box" match percentages.
3. **Strict Deterministic Hard Rules:** Published eligibility criteria (e.g. graduation year, CGPA, required degrees) are checked deterministically. Soft match scores *never* override failed mandatory cutoffs.
4. **Original Source Provenance:** Every requirement cites its official source portal, retrieval timestamp, and trust level.
5. **Explicit Uncertainty:** Missing information is explicitly marked `NO_EVIDENCE_FOUND` or `NEEDS_CONFIRMATION` instead of being treated as satisfied or failed.
6. **User Confirmation First:** Information extracted from uploaded documents must be reviewed and confirmed by the student before applying to their profile.
7. **No Fabricated Vacancies or Rejection Reasons:** Zero synthetic jobs or invented rejection causes. If an employer did not provide feedback, the cause is reported as `Unknown`.
8. **Privacy by Design:** Uploaded documents are stored privately outside public directories with server-side ownership authorization.

---

## 💻 3. Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling & Theming:** Tailwind CSS v4 with custom semantic design tokens (`--background`, `--foreground`, `--card`, `--border`, `--card-subtle`) supporting **Light, Dark, and System modes** with zero-flash inline detection.
- **Brand Identity:** Custom scalable SVG geometric bridge-nexus mark with dual icon and full wordmark variants ("Bridge the Gap · NSUT").
- **Navigation:** Collapsible SaaS sidebar (`w-64` to `w-20`) with mobile drawer support, unified Lucide icon strokes, and working demo profile card.
- **Database & ORM:** SQLite via Prisma ORM 7 with `@prisma/adapter-libsql`
- **Authentication:** Password hashing via `bcryptjs`, secure HTTP-only cookies, server session validation, and one-click demo login.
- **AI & Reasoning:** Google Gemini 1.5/2.0 (`@google/generative-ai`) with deterministic rule-engine fallback for offline and demo mode.
- **Testing:** Node.js native test runner via `tsx --test` (6 automated test suites)
- **Icons:** Lucide React

---

## 🚀 4. Quickstart & Installation

### Prerequisites
- Node.js `v20.19.0+` or `v25+`
- npm `10+`

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd devlympics
npm install
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
*(Optional)* Add your Gemini API key in `.env` to enable live Google Gemini analysis:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*Note: If no API key is provided, the product seamlessly operates in its fully functional, clearly labeled **Demo Engine** mode.*

### 3. Initialize Database & Seed Demo Data
```bash
# Push Prisma schema to SQLite
npx prisma db push

# Seed realistic demo data (Priya Sharma, NSUT '26 + Curated Opportunities)
npm run seed
```

### 4. Run Automated Test Suite
```bash
npm run test
```
All 6 core verification rule suites will execute and validate:
- Hard cutoff enforcement
- Missing evidence tagging
- Deterministic requirement satisfaction
- Progress intelligence sample size preservation
- AI provider fallback
- Document extraction confirmation

### 5. Launch Server
```bash
# Development mode:
npm run dev

# Or Optimized Production Build:
npm run build
npm run start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎭 5. Hackathon Demo Walkthrough

1. Open **[http://localhost:3000](http://localhost:3000)**.
2. Toggle between **Light**, **Dark**, or **System** mode using the theme button in the top navbar or from **Settings**.
3. Click **"Explore Demo Mode"** or **"Launch Live Demo (Priya Sharma, NSUT '26)"**.
4. You are instantly authenticated into Priya Sharma's workspace:
   - **Dashboard (`/dashboard`):** View the 92% evidence completion gauge, upcoming Google Online Challenge milestone (in 3 days), Microsoft deadline (in 5 days), and the 6-stage application pipeline.
   - **My Profile (`/profile`):** Inspect verified vs self-reported skills. Observe how TypeScript has GitHub proof, while Docker is labeled self-reported.
   - **My Documents (`/documents`):** View the document vault. Upload a résumé or test file to see structured credential extraction and the mandatory **Review & Confirm Modal** before profile updates.
   - **Discover Opportunities (`/opportunities`):** Filter by audit status. Notice how:
     - **Google SWE Intern 2026** is marked **Appears Eligible** (all 4 hard criteria met).
     - **Microsoft Cloud Intern** is marked **Potentially Eligible** (Docker evidence missing).
     - **Amazon SDE-1** is marked **Likely Ineligible** (batch 2024/2025 cutoff excludes Priya).
   - **Investigation Workspace (`/investigation/[id]`):** Open Google or Microsoft to view the **Requirement-by-Requirement Audit Table**, gap analysis, source provenance citations, and exportable report.
   - **Preparation Centre (`/preparation/[id]`):** Explore the roadmap with official vs candidate-reported stage badges. Launch the **Interactive Practice Drill Centre** to submit answers and get instant scoring and AI feedback.
   - **Application Tracker (`/applications`):** Switch between Kanban and Table views. Record an outcome with verified employer feedback.
   - **Progress & Insights (`/insights`):** View the application conversion funnel with explicit sample size notice ($n=5$), target market skill demand, and documented feedback themes.
   - **Settings (`/settings`):** Inspect AI provider status or reset the database baseline with one click.

---

## 🔒 6. Privacy & Document Isolation

- Uploaded files are written directly to `storage/documents/<userId>/<timestamp>_<filename>`.
- Files are completely inaccessible through public static web endpoints.
- Server route handlers verify the session token and user ID before querying or modifying any private resource.

---

## ⚠️ 7. Current Limitations & Roadmap

- **External Live Crawling:** In the hackathon version, live scraping of arbitrary third-party portals is replaced with structured curated sources to prevent anti-bot blocking and terms-of-service violations.
- **Automated Submissions:** The system guides and prepares candidates for official employer portals rather than attempting automated form submission, in accordance with platform integrity rules.
- **Database Engine:** Uses SQLite with LibSQL adapter for zero-friction local and demonstration setup. Can easily migrate to PostgreSQL via Prisma datasource configuration.
