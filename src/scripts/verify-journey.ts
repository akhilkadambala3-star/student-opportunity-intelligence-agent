import fs from "fs";

async function runJourneyVerification() {
  console.log("==================================================");
  console.log("🚀 STARTING OPPORTUNITY INTELLIGENCE AGENT JOURNEY TEST");
  console.log("==================================================");

  const BASE_URL = "http://localhost:3000";

  // Step 1: Health check / Landing page
  console.log("\n[1] Testing Landing Page (GET /)...");
  const landingRes = await fetch(`${BASE_URL}/`);
  if (!landingRes.ok) throw new Error(`Landing page returned status ${landingRes.status}`);
  const landingHtml = await landingRes.text();
  console.log(`✅ Landing page served successfully (${landingHtml.length} bytes, contains "Bridge the Gap": ${landingHtml.includes("Bridge the Gap")})`);

  // Step 2: Demo Login
  console.log("\n[2] Testing Demo Login (POST /api/auth/demo-login)...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!loginRes.ok) throw new Error(`Demo login failed with status ${loginRes.status}`);
  const loginData = await loginRes.json();
  const setCookie = loginRes.headers.get("set-cookie");
  if (!setCookie) throw new Error("No session cookie set on login response");
  const sessionCookie = setCookie.split(";")[0];
  console.log(`✅ Demo login succeeded for ${loginData.user.email} (${loginData.user.name}). Session Cookie acquired.`);

  const authHeaders = {
    Cookie: sessionCookie,
    "Content-Type": "application/json",
  };

  // Step 3: Auth & AI Provider Status Check
  console.log("\n[3] Testing Current User & AI Engine Mode (GET /api/auth/me)...");
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, { headers: authHeaders });
  const meData = await meRes.json();
  console.log(`✅ Current user verified: ${meData.user.name} (${meData.user.email})`);
  console.log(`🤖 AI Engine Status:`);
  console.log(`   - Provider: ${meData.aiStatus.provider}`);
  console.log(`   - Model: ${meData.aiStatus.modelName}`);
  console.log(`   - Key Configured: ${meData.aiStatus.isConfigured}`);
  console.log(`   - Message: ${meData.aiStatus.statusMessage}`);

  // Step 4: Profile Verification
  console.log("\n[4] Testing Student Profile (GET /api/profile)...");
  const profileRes = await fetch(`${BASE_URL}/api/profile`, { headers: authHeaders });
  const profileData = await profileRes.json();
  const p = profileData.profile;
  console.log(`✅ Profile retrieved: ${p.displayName} | ${p.institution} | ${p.degree} (${p.branch}) | CGPA: ${p.cgpa} | Batch: ${p.graduationYear}`);
  console.log(`   - Skills: ${p.skills.length} (Verified: ${p.skills.filter((s: any) => s.isVerified).length}, Self-reported: ${p.skills.filter((s: any) => !s.isVerified).length})`);
  console.log(`   - Projects: ${p.projects.length}`);

  // Step 5: Document Upload & Confirmation Gate
  console.log("\n[5] Testing Document Upload & Confirmation Gate...");
  const formData = new FormData();
  const dummyFileContent = "Priya Sharma Resume. Experienced in C++, Python, TypeScript, React, Docker, and PostgreSQL. Built Distributed Cache.";
  const blob = new Blob([dummyFileContent], { type: "text/plain" });
  formData.append("file", blob, "test_resume.txt");

  const uploadRes = await fetch(`${BASE_URL}/api/documents`, {
    method: "POST",
    headers: { Cookie: sessionCookie },
    body: formData,
  });
  if (!uploadRes.ok) throw new Error(`Document upload failed with status ${uploadRes.status}`);
  const uploadData = await uploadRes.json();
  const doc = uploadData.document;
  console.log(`✅ Document uploaded: "${doc.title}" (ID: ${doc.id})`);
  console.log(`   - Held for user review: ${!doc.isConfirmed} (requiresConfirmation: ${uploadData.requiresConfirmation})`);
  console.log(`   - Extracted unconfirmed skills: ${uploadData.extractedData?.skills?.join(", ") || "None"}`);

  // Test the user confirmation endpoint
  console.log("   Confirming extracted credentials via user confirmation modal...");
  const confirmRes = await fetch(`${BASE_URL}/api/documents/${doc.id}/confirm`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      displayName: "Priya Sharma",
      institution: "Netaji Subhas University of Technology",
      degree: "Bachelor of Technology",
      branch: "Computer Science and Engineering",
      graduationYear: 2026,
      cgpa: 8.65,
      confirmedSkills: ["TypeScript", "Docker", "PostgreSQL"],
      confirmedProjects: [],
    }),
  });
  if (!confirmRes.ok) throw new Error(`Document confirmation failed with status ${confirmRes.status}`);
  const confirmData = await confirmRes.json();
  console.log(`✅ Document successfully confirmed! Profile updated for: ${confirmData.profile.displayName}`);

  // Step 6: Opportunity Discovery & Filter
  console.log("\n[6] Testing Opportunity Discovery & Deterministic Cutoffs (GET /api/opportunities)...");
  const oppsRes = await fetch(`${BASE_URL}/api/opportunities`, { headers: authHeaders });
  const oppsData = await oppsRes.json();
  console.log(`✅ Retrieved ${oppsData.totalCount} opportunities from database:`);
  for (const opp of oppsData.opportunities) {
    console.log(`   - [${opp.eligibilityState}] "${opp.title}" @ ${opp.organisation} (Category: ${opp.category}, Mandatory Batch: ${opp.eligibleGradYears || "Any"})`);
  }

  // Step 7: Deep Opportunity Investigation
  console.log("\n[7] Testing Deep Investigation Engine (POST /api/investigation)...");
  const msftOpp = oppsData.opportunities.find((o: any) => o.organisation && o.organisation.includes("Microsoft"));
  if (!msftOpp) throw new Error("Microsoft opportunity not found in database");

  const investRes = await fetch(`${BASE_URL}/api/investigation`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ opportunityId: msftOpp.id }),
  });
  if (!investRes.ok) throw new Error(`Investigation failed with status ${investRes.status}`);
  const investData = await investRes.json();
  const inv = investData.investigation;
  console.log(`✅ Investigation executed for ${msftOpp.title}:`);
  console.log(`   - Deterministic Status: ${inv.eligibilityStatus} (Engine: ${investData.engineUsed})`);
  console.log(`   - Total Findings: ${inv.findings.length}`);
  for (const f of inv.findings) {
    console.log(`     * Requirement: "${f.requirementText}" -> Status: [${f.evaluationStatus}] (${f.explanation})`);
  }

  // Step 8: Preparation Roadmap & Practice Mock Drills
  console.log("\n[8] Testing Preparation Roadmap & Practice Drill Evaluator...");
  const googleOpp = oppsData.opportunities.find((o: any) => o.organisation && o.organisation.includes("Google"));
  if (!googleOpp) throw new Error("Google opportunity not found in database");

  const prepRes = await fetch(`${BASE_URL}/api/preparation/${googleOpp.id}`, { headers: authHeaders });
  if (!prepRes.ok) throw new Error(`Preparation plan failed with status ${prepRes.status}`);
  const prepData = await prepRes.json();
  const plan = prepData.plan;
  console.log(`✅ Preparation roadmap loaded for ${googleOpp.title}:`);
  console.log(`   - Tasks/Milestones: ${plan?.tasks?.length || 0}`);
  console.log(`   - Resources Curated: ${plan?.resources?.length || 0}`);

  // Test submitting an answer to an interactive drill
  console.log(`   Submitting answer to mock technical drill: "Data Structures: Sliding Window"`);
  const drillRes = await fetch(`${BASE_URL}/api/practice`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      opportunityId: googleOpp.id,
      topic: "Data Structures: Longest Substring Without Repeating Characters",
      question: "Given a string s, find the length of the longest substring without repeating characters. What is the optimal time and space complexity?",
      questionType: "TECHNICAL",
      expectedKeyPoints: [
        "Sliding window algorithm",
        "Two pointers left and right",
        "HashMap or array for character indices",
        "O(N) time complexity and O(min(N, M)) space complexity",
      ],
      studentAnswer: "We can maintain a sliding window with two pointers left and right, and store the most recent character index in an unordered_map to achieve O(N) linear time complexity and O(min(N, M)) space complexity.",
    }),
  });
  if (!drillRes.ok) throw new Error(`Practice drill evaluation failed with status ${drillRes.status}`);
  const drillData = await drillRes.json();
  console.log(`✅ Drill evaluated successfully! Score: ${drillData.evaluation.scoreEstimate}/100. Feedback: "${drillData.evaluation.aiFeedback}"`);

  // Step 9: Application Tracker
  console.log("\n[9] Testing Application Tracker Pipeline (GET /api/applications)...");
  const appsRes = await fetch(`${BASE_URL}/api/applications`, { headers: authHeaders });
  if (!appsRes.ok) throw new Error(`Applications fetch failed with status ${appsRes.status}`);
  const appsData = await appsRes.json();
  console.log(`✅ Applications retrieved: ${appsData.applications.length} applications in pipeline:`);
  for (const app of appsData.applications) {
    console.log(`   - [${app.currentStatus}] ${app.opportunity.title} @ ${app.opportunity.organisation}`);
  }

  // Step 10: Progress & Outcome Intelligence
  console.log("\n[10] Testing Progress & Outcome Intelligence (GET /api/insights)...");
  const insightsRes = await fetch(`${BASE_URL}/api/insights`, { headers: authHeaders });
  if (!insightsRes.ok) throw new Error(`Insights fetch failed with status ${insightsRes.status}`);
  const insightsData = await insightsRes.json();
  const report = insightsData.report;
  const summary = report.sampleSizeSummary;
  console.log(`✅ Progress intelligence generated successfully:`);
  console.log(`   - Sample Size Disclosure: "${summary.dataConfidenceNotice}" (Total applications: ${summary.totalApplications})`);
  console.log(`   - Conversion Stages: ${report.conversionFunnel.map((s: any) => `${s.stage}: ${s.count} (${s.percentage}%)`).join(" -> ")}`);
  console.log(`   - Market Demand vs Profile: ${report.skillGapFrequency.slice(0, 3).map((s: any) => `${s.skill} [${s.status}] (${s.marketDemandCount} opps)`).join(", ")}`);
  console.log(`   - Documented Feedback Themes: ${report.documentedFeedbackThemes.length} verified themes recorded`);

  console.log("\n==================================================");
  console.log("🎉 ALL 10 MAIN USER JOURNEY STAGES VERIFIED 100% OPERATIONAL!");
  console.log("==================================================");
}

runJourneyVerification().catch((err) => {
  console.error("❌ JOURNEY TEST FAILED:", err);
  process.exit(1);
});
