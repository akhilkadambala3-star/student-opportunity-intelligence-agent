import { prisma } from "./db";
import { hashPassword } from "./auth";

export async function seedDemoData() {
  console.log("Starting seed of demo data...");

  // 1. Create or update Demo Student (Priya Sharma, NSUT)
  const demoEmail = "priya.sharma@nsut.ac.in";
  let user = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!user) {
    const passwordHash = await hashPassword("DemoStudent2026!");
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash,
        name: "Priya Sharma",
        role: "STUDENT",
        isDemo: true,
      },
    });
  }

  // Ensure preference
  await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: { demoModeActive: true },
    create: {
      userId: user.id,
      demoModeActive: true,
      emailNotifications: true,
      deadlineAlertDays: 3,
    },
  });

  // Ensure Student Profile
  const profile = await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: {
      displayName: "Priya Sharma",
      institution: "Netaji Subhas University of Technology (NSUT), Delhi",
      degree: "B.Tech",
      branch: "Computer Science & Engineering",
      currentSemester: 6,
      graduationYear: 2026,
      cgpa: 8.65,
      location: "New Delhi, India",
      preferredLocations: JSON.stringify(["New Delhi", "Bengaluru", "Remote"]),
      workPreference: "HYBRID",
      targetRoles: JSON.stringify(["Software Engineer Intern", "Full Stack Developer", "Systems Engineer"]),
      targetIndustries: JSON.stringify(["FinTech", "Enterprise Software", "AI Platforms"]),
      targetOpportunities: JSON.stringify(["INTERNSHIP", "FULL_TIME", "FELLOWSHIP"]),
      minStipend: 45000,
      availabilityStart: new Date("2026-05-15"),
      timeCommitment: "Full-time (40 hrs/wk)",
      bio: "Pre-final year CSE student at NSUT with a passion for high-throughput distributed systems, Next.js web applications, and database optimization.",
      headline: "B.Tech CSE @ NSUT '26 | Full Stack & Systems Builder | Hackathon Finalist",
      profileCompletion: 92,
    },
    create: {
      userId: user.id,
      displayName: "Priya Sharma",
      institution: "Netaji Subhas University of Technology (NSUT), Delhi",
      degree: "B.Tech",
      branch: "Computer Science & Engineering",
      currentSemester: 6,
      graduationYear: 2026,
      cgpa: 8.65,
      location: "New Delhi, India",
      preferredLocations: JSON.stringify(["New Delhi", "Bengaluru", "Remote"]),
      workPreference: "HYBRID",
      targetRoles: JSON.stringify(["Software Engineer Intern", "Full Stack Developer", "Systems Engineer"]),
      targetIndustries: JSON.stringify(["FinTech", "Enterprise Software", "AI Platforms"]),
      targetOpportunities: JSON.stringify(["INTERNSHIP", "FULL_TIME", "FELLOWSHIP"]),
      minStipend: 45000,
      availabilityStart: new Date("2026-05-15"),
      timeCommitment: "Full-time (40 hrs/wk)",
      bio: "Pre-final year CSE student at NSUT with a passion for high-throughput distributed systems, Next.js web applications, and database optimization.",
      headline: "B.Tech CSE @ NSUT '26 | Full Stack & Systems Builder | Hackathon Finalist",
      profileCompletion: 92,
    },
  });

  // Skills
  const skillsList = [
    { name: "TypeScript", category: "Programming Languages", level: "ADVANCED", verified: true, source: "GitHub: 15+ Public Repos", notes: "Primary language for frontend and server-side runtimes." },
    { name: "React", category: "Web Development", level: "ADVANCED", verified: true, source: "Production Hackathon Deployment", notes: "React 19 Server Components, Custom Hooks, Performance Profiling." },
    { name: "Next.js", category: "Web Development", level: "ADVANCED", verified: true, source: "Devlympics 2026 Project", notes: "App Router, Server Actions, Route Handlers, Turbopack." },
    { name: "Data Structures & Algorithms", category: "Computer Science Fundamentals", level: "ADVANCED", verified: true, source: "LeetCode 450+ solved (Knight Rating)", notes: "Graphs, Dynamic Programming, Segment Trees." },
    { name: "Python", category: "Programming Languages", level: "INTERMEDIATE", verified: true, source: "Academic Coursework & Kaggle", notes: "Pandas, NumPy, scripting, FastAPI microservices." },
    { name: "SQL & Relational Databases", category: "Databases", level: "ADVANCED", verified: true, source: "Project Schema Design", notes: "Complex query optimization, indexing strategies, SQLite, PostgreSQL." },
    { name: "Prisma ORM", category: "Backend & ORM", level: "ADVANCED", verified: true, source: "Enterprise Course Project", notes: "Schema migrations, relations, transactions." },
    { name: "Docker", category: "DevOps & Cloud", level: "BEGINNER", verified: false, source: "Self-Reported", notes: "Basic containerization; no orchestration or multi-stage production builds yet." },
    { name: "GraphQL", category: "Web Development", level: "BEGINNER", verified: false, source: "Self-Reported", notes: "Completed introductory tutorial; no live production deployment." },
  ];

  for (const s of skillsList) {
    const skillRecord = await prisma.skill.upsert({
      where: { name: s.name },
      update: { category: s.category },
      create: { name: s.name, category: s.category },
    });

    await prisma.userSkill.upsert({
      where: {
        profileId_skillId: {
          profileId: profile.id,
          skillId: skillRecord.id,
        },
      },
      update: {
        proficiencyLevel: s.level,
        isVerified: s.verified,
        verificationSource: s.source,
        evidenceNotes: s.notes,
      },
      create: {
        profileId: profile.id,
        skillId: skillRecord.id,
        proficiencyLevel: s.level,
        isVerified: s.verified,
        verificationSource: s.source,
        evidenceNotes: s.notes,
      },
    });
  }

  // Projects
  await prisma.project.deleteMany({ where: { profileId: profile.id } });
  await prisma.project.createMany({
    data: [
      {
        profileId: profile.id,
        title: "Opportunity Intelligence Agent (Devlympics 2026)",
        description: "Full-stack evidence-grounded agent for student opportunity evaluation, gap analysis, and roadmap synthesis.",
        problemSolved: "Students struggle to bridge the gap between their actual qualifications and complex employer requirements.",
        technologies: JSON.stringify(["TypeScript", "Next.js", "Prisma", "SQLite", "Tailwind CSS"]),
        personalContribution: "Architected the deterministic eligibility engine, database schema, and interactive UI workspace.",
        githubUrl: "https://github.com/priyasharma/opportunity-intelligence-agent",
        liveUrl: "https://opportunity-intelligence.dev",
        evidenceNotes: "Live interactive project with complete Git history and unit tests.",
        isOngoing: true,
      },
      {
        profileId: profile.id,
        title: "Distributed Task Scheduler & Cache",
        description: "A concurrent in-memory job scheduler with lease locks, retry queues, and persistent write-ahead logs.",
        problemSolved: "Prevented duplicate processing during worker node crashes.",
        technologies: JSON.stringify(["TypeScript", "Node.js", "SQL & Relational Databases"]),
        personalContribution: "Designed fault-tolerant consensus and heartbeat mechanism using round-robin distribution.",
        githubUrl: "https://github.com/priyasharma/distributed-task-scheduler",
        evidenceNotes: "Benchmark results showing 12,000 req/sec under load tests included in repo.",
        isOngoing: false,
      },
    ],
  });

  // Experiences
  await prisma.experience.deleteMany({ where: { profileId: profile.id } });
  await prisma.experience.create({
    data: {
      profileId: profile.id,
      title: "Frontend Engineering Intern",
      organisation: "Innovaccer Technology Labs",
      experienceType: "INTERNSHIP",
      description: "Spearheaded the redesign of clinical workflow dashboards in React and TypeScript, cutting component re-render times by 42%.",
      technologies: JSON.stringify(["TypeScript", "React", "Next.js", "Tailwind CSS"]),
      evidenceNotes: "Internship Certificate #INV-2025-081 verified by college placement cell.",
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-07-31"),
      isCurrent: false,
      location: "Noida, India (Hybrid)",
    },
  });

  // Documents
  await prisma.document.deleteMany({ where: { userId: user.id } });
  await prisma.document.create({
    data: {
      userId: user.id,
      title: "Priya_Sharma_Resume_2026.pdf",
      fileName: "priya_sharma_resume.pdf",
      filePath: "storage/documents/demo_priya_resume.pdf",
      fileType: "RESUME",
      fileSize: 184320,
      mimeType: "application/pdf",
      extractedText: "Priya Sharma\nNSUT Delhi B.Tech Computer Science 2026\nCGPA: 8.65\nSkills: TypeScript, React, Next.js, Node.js, Python, DSA, SQL, Prisma\nProjects: Opportunity Intelligence Agent, Distributed Task Scheduler\nExperience: Frontend Engineering Intern @ Innovaccer",
      isConfirmed: true,
      extractedDataJson: JSON.stringify({
        displayName: "Priya Sharma",
        institution: "NSUT Delhi",
        graduationYear: 2026,
        cgpa: 8.65,
      }),
    },
  });

  // 2. Curated Sample Opportunities (Demonstrating distinct eligibility states!)
  // Opportunity A: Google Software Engineering Intern 2026 (APPEARS ELIGIBLE)
  const oppGoogle = await prisma.opportunity.upsert({
    where: { id: "demo-opp-google-swe-2026" },
    update: {},
    create: {
      id: "demo-opp-google-swe-2026",
      title: "Software Engineering Intern (Summer 2026)",
      organisation: "Google India",
      organisationLogo: "https://www.google.com/favicon.ico",
      category: "INTERNSHIP",
      roleDescription: "Join Google engineering teams in Bengaluru or Hyderabad to build products impacting billions of users. You will work alongside experienced software engineers to solve algorithmic challenges, scale backend microservices, and deliver intuitive web experiences.",
      originalUrl: "https://www.google.com/about/careers/applications/jobs/results/swe-intern-2026",
      officialOrgUrl: "https://careers.google.com",
      sourceType: "OFFICIAL_CAREER_PORTAL",
      sourceVerificationStatus: "OFFICIAL_VERIFIED",
      location: "Bengaluru / Hyderabad, India",
      workArrangement: "HYBRID",
      requiredEducation: "Currently enrolled in a Bachelor's or Master's degree in Computer Science or related technical field.",
      eligibleGradYears: JSON.stringify(["2026", "2027"]),
      requiredSkills: JSON.stringify(["Data Structures & Algorithms", "TypeScript", "Python"]),
      preferredSkills: JSON.stringify(["Next.js", "Docker", "Distributed Systems"]),
      minCgpa: 7.5,
      experienceYears: 0,
      stipendOrComp: "₹1,10,000 / month + Relocation Support",
      duration: "10-12 Weeks (May - July 2026)",
      startDate: "May 2026",
      applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      requiredDocuments: JSON.stringify(["Resume / CV", "Official College Marks Card"]),
      applicationInstructions: "Apply directly through the Google Careers portal. Ensure your transcript reflects up to your current semester.",
      status: "ACTIVE",
      isDemo: true,
      confidenceNotes: "Verified directly from Google Student Careers listings. Requirements confirmed with recruiting guidelines.",
    },
  });

  // Sources for Google
  await prisma.opportunitySource.deleteMany({ where: { opportunityId: oppGoogle.id } });
  await prisma.opportunitySource.create({
    data: {
      opportunityId: oppGoogle.id,
      sourceName: "Google Careers Official Portal",
      sourceUrl: "https://careers.google.com/jobs/results/swe-intern-2026",
      sourceType: "OFFICIAL_CAREER_PAGE",
      trustLevel: "OFFICIAL_VERIFIED",
      extractedSnippet: "Eligible candidates must be graduating in 2026 or 2027 with a degree in Computer Science, Information Technology, or equivalent.",
      isAvailable: true,
    },
  });

  // Requirements for Google
  await prisma.opportunityRequirement.deleteMany({ where: { opportunityId: oppGoogle.id } });
  await prisma.opportunityRequirement.createMany({
    data: [
      {
        opportunityId: oppGoogle.id,
        requirementText: "Enrolled in B.Tech/B.E. graduating in 2026 or 2027",
        category: "EDUCATION",
        isMandatory: true,
        sourceSnippet: "Must be currently enrolled in an accredited undergraduate program graduating 2026/2027",
      },
      {
        opportunityId: oppGoogle.id,
        requirementText: "Minimum Cumulative Grade Point Average (CGPA) of 7.50 / 10.00",
        category: "CGPA",
        isMandatory: true,
        sourceSnippet: "Consistent academic record with CGPA >= 7.5",
      },
      {
        opportunityId: oppGoogle.id,
        requirementText: "Strong foundation in Data Structures & Algorithms",
        category: "SKILL",
        isMandatory: true,
        sourceSnippet: "Proficiency in algorithmic problem solving and time/space complexity analysis",
      },
      {
        opportunityId: oppGoogle.id,
        requirementText: "Working experience in one or more languages: TypeScript, Python, C++, or Java",
        category: "SKILL",
        isMandatory: true,
        sourceSnippet: "Experience with modern programming languages for software development",
      },
      {
        opportunityId: oppGoogle.id,
        requirementText: "Experience with modern web frameworks or distributed systems",
        category: "SKILL",
        isMandatory: false,
        sourceSnippet: "Preferred: familiarity with modern React/Next.js frameworks and containerized tooling",
      },
    ],
  });

  // Opportunity B: Microsoft Cloud Engineering Intern (POTENTIALLY ELIGIBLE / MISSING EVIDENCE)
  const oppMicrosoft = await prisma.opportunity.upsert({
    where: { id: "demo-opp-microsoft-cloud-2026" },
    update: {},
    create: {
      id: "demo-opp-microsoft-cloud-2026",
      title: "Cloud Software Engineer Intern",
      organisation: "Microsoft India R&D",
      organisationLogo: "https://www.microsoft.com/favicon.ico",
      category: "INTERNSHIP",
      roleDescription: "Architect resilient cloud microservices for Azure core infrastructure. Build high-performance backend pipelines, monitor cloud telemetry, and implement automated orchestration workflows.",
      originalUrl: "https://careers.microsoft.com/us/en/job/1789230/Internship-Opportunities-for-Students",
      officialOrgUrl: "https://careers.microsoft.com",
      sourceType: "OFFICIAL_CAREER_PORTAL",
      sourceVerificationStatus: "OFFICIAL_VERIFIED",
      location: "Hyderabad / Noida, India",
      workArrangement: "HYBRID",
      requiredEducation: "B.Tech or M.Tech in CS/IT/ECE graduating in 2026.",
      eligibleGradYears: JSON.stringify(["2026"]),
      requiredSkills: JSON.stringify(["Docker", "TypeScript", "SQL & Relational Databases"]),
      preferredSkills: JSON.stringify(["Kubernetes", "GraphQL", "C#"]),
      minCgpa: 8.0,
      experienceYears: 0,
      stipendOrComp: "₹1,25,000 / month",
      duration: "8 Weeks (June - July 2026)",
      startDate: "June 2026",
      applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now!
      requiredDocuments: JSON.stringify(["Resume", "College Bonafide Certificate"]),
      applicationInstructions: "Submit your updated portfolio and GitHub profile link.",
      status: "ACTIVE",
      isDemo: true,
      confidenceNotes: "Docker requirement is mandatory per job description, but Priya's profile lists Docker as self-reported without verified project code.",
    },
  });

  // Requirements for Microsoft
  await prisma.opportunityRequirement.deleteMany({ where: { opportunityId: oppMicrosoft.id } });
  await prisma.opportunityRequirement.createMany({
    data: [
      {
        opportunityId: oppMicrosoft.id,
        requirementText: "Graduation year 2026 strictly required",
        category: "EDUCATION",
        isMandatory: true,
        sourceSnippet: "Only candidates completing their degree in summer 2026 are eligible",
      },
      {
        opportunityId: oppMicrosoft.id,
        requirementText: "Hands-on containerization experience with Docker",
        category: "SKILL",
        isMandatory: true,
        sourceSnippet: "Must have practical experience containerizing services with Docker and writing Dockerfiles",
      },
      {
        opportunityId: oppMicrosoft.id,
        requirementText: "Strong proficiency in backend TypeScript or Systems programming",
        category: "SKILL",
        isMandatory: true,
        sourceSnippet: "Demonstrated backend systems code in TypeScript, C#, or Go",
      },
      {
        opportunityId: oppMicrosoft.id,
        requirementText: "CGPA above 8.0",
        category: "CGPA",
        isMandatory: true,
        sourceSnippet: "Minimum academic threshold of 8.0 CGPA",
      },
    ],
  });

  // Opportunity C: Amazon SDE-1 Full-Time 2024-2025 (UNMET MANDATORY CONDITION)
  const oppAmazon = await prisma.opportunity.upsert({
    where: { id: "demo-opp-amazon-sde1-2025" },
    update: {},
    create: {
      id: "demo-opp-amazon-sde1-2025",
      title: "Software Development Engineer I (Full-Time)",
      organisation: "Amazon",
      organisationLogo: "https://www.amazon.com/favicon.ico",
      category: "FULL_TIME",
      roleDescription: "Full-time SDE role on Amazon Payments platform. Candidates must have already graduated or be graduating by Dec 2024 / June 2025 for immediate onboarding.",
      originalUrl: "https://amazon.jobs/en/jobs/2591024/software-development-engineer-i",
      officialOrgUrl: "https://amazon.jobs",
      sourceType: "OFFICIAL_CAREER_PORTAL",
      sourceVerificationStatus: "OFFICIAL_VERIFIED",
      location: "Bengaluru, India",
      workArrangement: "ONSITE",
      requiredEducation: "B.Tech in CS/IT completed in 2024 or 2025.",
      eligibleGradYears: JSON.stringify(["2024", "2025"]), // Priya is 2026 -> Hard Unmet!
      requiredSkills: JSON.stringify(["Java", "Data Structures & Algorithms", "Distributed Systems"]),
      preferredSkills: JSON.stringify(["AWS", "NoSQL"]),
      minCgpa: 7.0,
      experienceYears: 1,
      stipendOrComp: "₹28,00,000 / year + RSUs",
      duration: "Permanent Full-Time",
      startDate: "Immediate",
      applicationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      requiredDocuments: JSON.stringify(["Degree Certificate", "Final Transcripts"]),
      applicationInstructions: "Immediate joining required upon background check completion.",
      status: "ACTIVE",
      isDemo: true,
      confidenceNotes: "Mandatory graduation year cutoff: Priya is batch of 2026 and cannot fulfill immediate 2025 joining.",
    },
  });

  // Requirements for Amazon
  await prisma.opportunityRequirement.deleteMany({ where: { opportunityId: oppAmazon.id } });
  await prisma.opportunityRequirement.createMany({
    data: [
      {
        opportunityId: oppAmazon.id,
        requirementText: "Graduation year must be 2024 or 2025 for immediate onboarding",
        category: "EDUCATION",
        isMandatory: true,
        sourceSnippet: "Only candidates who have completed degree in 2024 or graduating by May 2025 are eligible for immediate start",
      },
      {
        opportunityId: oppAmazon.id,
        requirementText: "Proficiency in Object-Oriented design and DSA",
        category: "SKILL",
        isMandatory: true,
        sourceSnippet: "Deep understanding of object oriented programming, algorithms, and complexity analysis",
      },
    ],
  });

  // Opportunity D: DRDO Junior Research Fellowship (Govt Portal)
  const oppDRDO = await prisma.opportunity.upsert({
    where: { id: "demo-opp-drdo-fellowship-2026" },
    update: {},
    create: {
      id: "demo-opp-drdo-fellowship-2026",
      title: "Junior Research Fellowship (JRF) in Artificial Intelligence",
      organisation: "Defence Research & Development Organisation (DRDO)",
      organisationLogo: "https://www.drdo.gov.in/favicon.ico",
      category: "FELLOWSHIP",
      roleDescription: "Research fellowship at Centre for Artificial Intelligence and Robotics (CAIR), DRDO Bengaluru. Focus on autonomous cyber defense and secure protocol verification.",
      originalUrl: "https://www.drdo.gov.in/careers/jrf-cair-advt-2026",
      officialOrgUrl: "https://www.drdo.gov.in",
      sourceType: "GOVT_PORTAL",
      sourceVerificationStatus: "OFFICIAL_VERIFIED",
      location: "Bengaluru, India",
      workArrangement: "ONSITE",
      requiredEducation: "First Class B.Tech in CSE/IT with valid GATE score or UGC-NET.",
      eligibleGradYears: JSON.stringify(["2025", "2026"]),
      requiredSkills: JSON.stringify(["Python", "Machine Learning", "Data Structures & Algorithms"]),
      preferredSkills: JSON.stringify(["C++", "Cybersecurity"]),
      minCgpa: 8.0,
      experienceYears: 0,
      stipendOrComp: "₹37,000 / month + HRA as per Govt norms",
      duration: "2 Years",
      startDate: "August 2026",
      applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      requiredDocuments: JSON.stringify(["Indian Nationality Certificate", "GATE Score Card", "Degree Marks Cards"]),
      applicationInstructions: "Download standard format form, attach self-attested copies, and submit via official recruitment portal.",
      status: "ACTIVE",
      isDemo: true,
      confidenceNotes: "Official Government of India Gazette notification verified. GATE score required.",
    },
  });

  // Requirements for DRDO
  await prisma.opportunityRequirement.deleteMany({ where: { opportunityId: oppDRDO.id } });
  await prisma.opportunityRequirement.createMany({
    data: [
      {
        opportunityId: oppDRDO.id,
        requirementText: "First Class B.Tech with valid GATE scorecard",
        category: "EDUCATION",
        isMandatory: true,
        sourceSnippet: "First division in qualifying degree with valid GATE qualification",
      },
      {
        opportunityId: oppDRDO.id,
        requirementText: "Indian Citizenship",
        category: "CITIZENSHIP",
        isMandatory: true,
        sourceSnippet: "Only Indian Nationals are eligible to apply",
      },
      {
        opportunityId: oppDRDO.id,
        requirementText: "Minimum 8.0 CGPA or 70% aggregate",
        category: "CGPA",
        isMandatory: true,
        sourceSnippet: "Minimum 70% marks or equivalent CGPA 8.0",
      },
    ],
  });

  // 3. Pre-run Investigation for Google (APPEARS ELIGIBLE)
  await prisma.investigation.deleteMany({ where: { userId: user.id } });
  const invGoogle = await prisma.investigation.create({
    data: {
      userId: user.id,
      opportunityId: oppGoogle.id,
      status: "COMPLETED",
      overallEligibility: "APPEARS_ELIGIBLE",
      hardRequirementsMet: 4,
      totalMandatoryRequirements: 4,
      suitabilityScore: 94,
      summary: "You satisfy all 4 published mandatory criteria for Google Software Engineering Intern 2026. Your graduation batch (2026), university degree (B.Tech CSE @ NSUT), academic performance (8.65 CGPA vs 7.50 cutoff), and verified DSA credentials align squarely with the hiring rubric.",
      gapAnalysis: "No critical skill gaps identified. To strengthen your candidacy during technical screening, review System Design fundamentals and ensure your portfolio projects emphasize high-throughput metrics.",
      riskFactors: JSON.stringify([
        "High applicant volume: Google receives over 100,000 applications annually; early submission before the deadline is strongly recommended.",
        "Coding round tests timed algorithmic efficiency (O(N) vs O(N^2)) under strict test case suites.",
      ]),
      recommendations: JSON.stringify([
        "Submit application through Google Careers before the 14-day deadline countdown expires.",
        "Complete the 5 tailored practice modules in the Preparation Center.",
        "Highlight the Distributed Task Scheduler project on your one-page resume.",
      ]),
    },
  });

  // Investigation findings for Google
  await prisma.investigationFinding.createMany({
    data: [
      {
        investigationId: invGoogle.id,
        requirementText: "Enrolled in B.Tech/B.E. graduating in 2026 or 2027",
        isMandatory: true,
        evaluationStatus: "SATISFIED",
        evidenceFound: "Profile confirms: B.Tech CSE @ NSUT, expected graduation June 2026",
        sourceSnippet: "Must be currently enrolled in an accredited undergraduate program graduating 2026/2027",
        explanation: "Your graduation year (2026) matches the official eligible batch criteria.",
        recommendedAction: null,
      },
      {
        investigationId: invGoogle.id,
        requirementText: "Minimum Cumulative Grade Point Average (CGPA) of 7.50 / 10.00",
        isMandatory: true,
        evaluationStatus: "SATISFIED",
        evidenceFound: "Profile & uploaded transcript confirm: 8.65 CGPA (Semester 6)",
        sourceSnippet: "Consistent academic record with CGPA >= 7.5",
        explanation: "Your current CGPA (8.65) surpasses the minimum threshold by +1.15 points.",
        recommendedAction: null,
      },
      {
        investigationId: invGoogle.id,
        requirementText: "Strong foundation in Data Structures & Algorithms",
        isMandatory: true,
        evaluationStatus: "SATISFIED",
        evidenceFound: "Verified Skill: 450+ LeetCode problems solved, Knight rank",
        sourceSnippet: "Proficiency in algorithmic problem solving and time/space complexity analysis",
        explanation: "Demonstrated competitive programming and algorithm design track record.",
        recommendedAction: null,
      },
      {
        investigationId: invGoogle.id,
        requirementText: "Working experience in one or more languages: TypeScript, Python, C++, or Java",
        isMandatory: true,
        evaluationStatus: "SATISFIED",
        evidenceFound: "Verified Skills: TypeScript (Advanced), Python (Intermediate) across multiple repositories",
        sourceSnippet: "Experience with modern programming languages for software development",
        explanation: "Dual language competency demonstrated in public codebases.",
        recommendedAction: null,
      },
      {
        investigationId: invGoogle.id,
        requirementText: "Experience with modern web frameworks or distributed systems",
        isMandatory: false,
        evaluationStatus: "SATISFIED",
        evidenceFound: "Project evidence: Distributed Task Scheduler & Next.js App Router applications",
        sourceSnippet: "Preferred: familiarity with modern React/Next.js frameworks and containerized tooling",
        explanation: "Satisfies preferred qualification criteria with verifiable project URLs.",
        recommendedAction: null,
      },
    ],
  });

  // Pre-run Investigation for Microsoft (POTENTIALLY ELIGIBLE / MISSING EVIDENCE)
  const invMicrosoft = await prisma.investigation.create({
    data: {
      userId: user.id,
      opportunityId: oppMicrosoft.id,
      status: "COMPLETED",
      overallEligibility: "POTENTIALLY_ELIGIBLE",
      hardRequirementsMet: 3,
      totalMandatoryRequirements: 4,
      suitabilityScore: 72,
      summary: "You meet graduation year (2026), CGPA (8.65 vs 8.00), and TypeScript requirements for Microsoft Cloud Engineer Intern. However, Docker containerization is a published mandatory requirement where your profile only contains self-reported claims without verifiable repository code.",
      gapAnalysis: "Required Skill Gap: Docker is listed with self-reported beginner status. No Dockerfile or container orchestration configuration exists in your linked GitHub projects.",
      riskFactors: JSON.stringify([
        "Automated ATS screening filters may flag missing containerization credentials.",
        "Interview technical round will ask about multi-container networking and resource limits.",
      ]),
      recommendations: JSON.stringify([
        "Add a Dockerfile and docker-compose.yml to your Opportunity Intelligence repository before applying.",
        "Complete the 60-minute Docker containerization drill in the Preparation Center.",
      ]),
    },
  });

  await prisma.investigationFinding.createMany({
    data: [
      {
        investigationId: invMicrosoft.id,
        requirementText: "Graduation year 2026 strictly required",
        isMandatory: true,
        evaluationStatus: "SATISFIED",
        evidenceFound: "B.Tech CSE @ NSUT graduating 2026",
        sourceSnippet: "Only candidates completing their degree in summer 2026 are eligible",
        explanation: "Eligible graduating batch satisfied.",
        recommendedAction: null,
      },
      {
        investigationId: invMicrosoft.id,
        requirementText: "Hands-on containerization experience with Docker",
        isMandatory: true,
        evaluationStatus: "NEEDS_CONFIRMATION",
        evidenceFound: "Skill 'Docker' is self-reported (Beginner); no linked repo demonstrates Docker configuration.",
        sourceSnippet: "Must have practical experience containerizing services with Docker and writing Dockerfiles",
        explanation: "Self-reported skill lacks verifiable repository evidence.",
        recommendedAction: "Push a Dockerfile and docker-compose configuration to a public GitHub project.",
      },
      {
        investigationId: invMicrosoft.id,
        requirementText: "Strong proficiency in backend TypeScript or Systems programming",
        isMandatory: true,
        evaluationStatus: "SATISFIED",
        evidenceFound: "Distributed Task Scheduler repository in TypeScript",
        sourceSnippet: "Demonstrated backend systems code in TypeScript, C#, or Go",
        explanation: "Solid evidence of backend concurrency and typing in TypeScript.",
        recommendedAction: null,
      },
      {
        investigationId: invMicrosoft.id,
        requirementText: "CGPA above 8.0",
        isMandatory: true,
        evaluationStatus: "SATISFIED",
        evidenceFound: "Current CGPA: 8.65",
        sourceSnippet: "Minimum academic threshold of 8.0 CGPA",
        explanation: "Surpasses the 8.0 cutoff.",
        recommendedAction: null,
      },
    ],
  });

  // Pre-run Investigation for Amazon (LIKELY INELIGIBLE)
  const invAmazon = await prisma.investigation.create({
    data: {
      userId: user.id,
      opportunityId: oppAmazon.id,
      status: "COMPLETED",
      overallEligibility: "LIKELY_INELIGIBLE",
      hardRequirementsMet: 1,
      totalMandatoryRequirements: 2,
      suitabilityScore: 32,
      summary: "This listing for Amazon SDE-1 is designated for batches 2024 and 2025 who can onboard immediately. Because your recorded graduation year is 2026, automated ATS and recruiting rules will reject the application based on published batch cutoffs.",
      gapAnalysis: "Mandatory Graduation Cutoff Unmet: Role requires graduation by May 2025. You are currently in 6th semester with graduation scheduled for mid-2026.",
      riskFactors: JSON.stringify([
        "Hard automated filter on graduation date will disqualify submission.",
        "Applying to misaligned batch roles flags duplicate submissions on Amazon Jobs.",
      ]),
      recommendations: JSON.stringify([
        "Do not apply to this full-time listing. Instead, target Amazon Summer 2026 Internship opportunities.",
        "Set an alert in Opportunity Discovery for Amazon 2026 Campus Hiring.",
      ]),
    },
  });

  await prisma.investigationFinding.createMany({
    data: [
      {
        investigationId: invAmazon.id,
        requirementText: "Graduation year must be 2024 or 2025 for immediate onboarding",
        isMandatory: true,
        evaluationStatus: "NOT_SATISFIED",
        evidenceFound: "Profile lists graduation year: 2026",
        sourceSnippet: "Only candidates who have completed degree in 2024 or graduating by May 2025 are eligible for immediate start",
        explanation: "Published cutoff explicitly excludes 2026 graduates.",
        recommendedAction: "Apply for 2026 intern positions instead of full-time immediate openings.",
      },
      {
        investigationId: invAmazon.id,
        requirementText: "Proficiency in Object-Oriented design and DSA",
        isMandatory: true,
        evaluationStatus: "SATISFIED",
        evidenceFound: "DSA 450+ solved, systems engineering background",
        sourceSnippet: "Deep understanding of object oriented programming, algorithms, and complexity analysis",
        explanation: "Technical ability matches, but administrative cutoff fails.",
        recommendedAction: null,
      },
    ],
  });

  // 4. Preparation Plan & Tasks for Google
  const prepPlan = await prisma.preparationPlan.upsert({
    where: {
      userId_opportunityId: {
        userId: user.id,
        opportunityId: oppGoogle.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      opportunityId: oppGoogle.id,
      title: "Google SWE Intern 2026 Targeted Mastery Plan",
      estimatedHours: 28,
      overallReadiness: 65,
    },
  });

  await prisma.preparationTask.deleteMany({ where: { planId: prepPlan.id } });
  await prisma.preparationTask.createMany({
    data: [
      {
        planId: prepPlan.id,
        title: "Format Official University Transcript & PDF Resume",
        category: "DOCUMENT_PREP",
        description: "Verify that semester 1-5 grades are clearly visible on transcript. Limit résumé to single page with quantified project metrics.",
        evidenceBasis: "OFFICIAL_STAGE",
        priority: "HIGH",
        estimatedMinutes: 45,
        isCompleted: true,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        resourceUrl: "https://careers.google.com/how-we-hire/",
      },
      {
        planId: prepPlan.id,
        title: "Google Online Challenge (GOC): 2-Problem Timed Simulation",
        category: "CODING",
        description: "Simulate 60-minute Google coding assessment with two medium-hard problems on Graph BFS/DFS and Trie prefix search.",
        evidenceBasis: "CANDIDATE_REPORTED",
        priority: "HIGH",
        estimatedMinutes: 90,
        isCompleted: true,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        resourceUrl: "https://leetcode.com/company/google/",
      },
      {
        planId: prepPlan.id,
        title: "Technical Round 1: Live Coding & Time-Space Complexity Defense",
        category: "TECHNICAL_ROUND",
        description: "Practice thinking out loud and writing clean, modular helper functions while explaining O(V+E) time complexity to an interviewer.",
        evidenceBasis: "OFFICIAL_STAGE",
        priority: "HIGH",
        estimatedMinutes: 120,
        isCompleted: false,
        resourceUrl: "https://techinterviewhandbook.org/coding-interview-study-plan/",
      },
      {
        planId: prepPlan.id,
        title: "Googleyness & Leadership: 5 Core Situational Stories",
        category: "HR_BEHAVIORAL",
        description: "Formulate STAR-method responses demonstrating intellectual humility, working with ambiguous requirements, and doing the right thing for the user.",
        evidenceBasis: "OFFICIAL_STAGE",
        priority: "MEDIUM",
        estimatedMinutes: 60,
        isCompleted: false,
        resourceUrl: "https://careers.google.com/how-we-hire/interviewing/",
      },
    ],
  });

  // Resources for Google Prep Plan
  await prisma.preparationResource.deleteMany({ where: { planId: prepPlan.id } });
  await prisma.preparationResource.createMany({
    data: [
      {
        planId: prepPlan.id,
        title: "Google Engineering Culture & Interview Rubric Guide",
        resourceType: "DOCUMENTATION",
        url: "https://careers.google.com/how-we-hire/interviewing/",
        summary: "Official Google hiring guidelines detailing coding expectations, communication standards, and Googleyness attributes.",
        isOfficial: true,
      },
      {
        planId: prepPlan.id,
        title: "Google GOC High-Frequency Graph & DP Problem Set",
        resourceType: "PRACTICE_SET",
        url: "https://leetcode.com/explore/interview/card/google/",
        summary: "Curated collection of 35 algorithmic problems asked in recent Google campus and intern online assessments.",
        isOfficial: false,
      },
    ],
  });

  // 5. Practice Sessions
  await prisma.practiceSession.deleteMany({ where: { userId: user.id } });
  await prisma.practiceSession.create({
    data: {
      userId: user.id,
      opportunityId: oppGoogle.id,
      topic: "Algorithms: Graph Traversal & Shortest Path",
      question: "You are given a weighted directed acyclic graph representing task dependencies. How do you find the minimum time needed to complete all tasks, and how do you handle circular dependency errors?",
      questionType: "TECHNICAL",
      expectedKeyPoints: JSON.stringify([
        "Topological sorting using Kahn's algorithm or DFS post-order",
        "Cycle detection via in-degree verification or visited state array (UNVISITED, VISITING, VISITED)",
        "Dynamic programming over topological order to calculate longest path (critical path)",
        "Time complexity O(V + E) and Space complexity O(V + E)",
      ]),
      studentAnswer: "I would use Kahn's algorithm with an in-degree array. If after processing all possible zero in-degree nodes the processed count is less than V, a cycle exists. To find minimum completion time, I relax edges according to topological order, finding the longest path across the DAG.",
      aiFeedback: "Strong, mathematically precise answer. You correctly identified cycle detection with Kahn's algorithm and understood that total completion time in dependency graphs corresponds to the critical path length.",
      strengths: JSON.stringify([
        "Identified in-degree cycle detection immediately",
        "Correctly associated completion time with critical path / longest DAG path",
        "Clear time complexity trade-off",
      ]),
      improvements: JSON.stringify([
        "Mention state handling when task execution can occur concurrently across multiple worker threads.",
      ]),
      scoreEstimate: 92,
    },
  });

  // 6. Application Tracker Populated Pipeline
  await prisma.application.deleteMany({ where: { userId: user.id } });

  // App 1: Google (Applied -> Assessment Scheduled)
  const appGoogle = await prisma.application.create({
    data: {
      userId: user.id,
      opportunityId: oppGoogle.id,
      currentStatus: "ASSESSMENT_SCHEDULED",
      appliedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      deadline: oppGoogle.applicationDeadline,
      targetRole: "Software Engineering Intern (Summer 2026)",
      organisation: "Google India",
      notes: "Submitted via Google Careers portal. Received invitation for Google Online Challenge (GOC).",
      submittedResumeUrl: "storage/documents/demo_priya_resume.pdf",
      assessmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.applicationStatusHistory.createMany({
    data: [
      { applicationId: appGoogle.id, fromStatus: null, toStatus: "SAVED", changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), note: "Discovered and saved via Investigation Engine" },
      { applicationId: appGoogle.id, fromStatus: "SAVED", toStatus: "APPLIED", changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), note: "Application submitted on Google portal" },
      { applicationId: appGoogle.id, fromStatus: "APPLIED", toStatus: "ASSESSMENT_SCHEDULED", changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: "Invitation received for GOC test window" },
    ],
  });

  // App 2: Microsoft (Preparing)
  const appMicrosoft = await prisma.application.create({
    data: {
      userId: user.id,
      opportunityId: oppMicrosoft.id,
      currentStatus: "PREPARING",
      appliedDate: null,
      deadline: oppMicrosoft.applicationDeadline,
      targetRole: "Cloud Software Engineer Intern",
      organisation: "Microsoft India R&D",
      notes: "Resolving Docker project gap before final submission.",
    },
  });

  // App 3: DRDO JRF (Saved)
  await prisma.application.create({
    data: {
      userId: user.id,
      opportunityId: oppDRDO.id,
      currentStatus: "SAVED",
      deadline: oppDRDO.applicationDeadline,
      targetRole: "Junior Research Fellowship (JRF)",
      organisation: "DRDO Bengaluru",
      notes: "Need to verify GATE score submission guidelines.",
    },
  });

  // App 4: Historical Past Application with Documented Rejection Feedback (To demonstrate Outcome & Progress Intelligence!)
  const oppHistoricalAtlassian = await prisma.opportunity.upsert({
    where: { id: "demo-opp-atlassian-2025" },
    update: {},
    create: {
      id: "demo-opp-atlassian-2025",
      title: "Full Stack Engineering Intern (Winter 2025)",
      organisation: "Atlassian",
      organisationLogo: "https://www.atlassian.com/favicon.ico",
      category: "INTERNSHIP",
      roleDescription: "Build Jira collaborative cloud features.",
      originalUrl: "https://www.atlassian.com/company/careers",
      officialOrgUrl: "https://www.atlassian.com",
      sourceType: "OFFICIAL_CAREER_PORTAL",
      sourceVerificationStatus: "OFFICIAL_VERIFIED",
      location: "Bengaluru, India",
      workArrangement: "REMOTE",
      requiredEducation: "B.Tech in CSE",
      eligibleGradYears: JSON.stringify(["2026"]),
      requiredSkills: JSON.stringify(["React", "TypeScript", "System Design"]),
      status: "EXPIRED",
      isDemo: true,
      confidenceNotes: "Historical application cycle from last semester to test outcome analysis.",
    },
  });

  const appAtlassian = await prisma.application.create({
    data: {
      userId: user.id,
      opportunityId: oppHistoricalAtlassian.id,
      currentStatus: "REJECTED",
      appliedDate: new Date("2025-09-10"),
      deadline: new Date("2025-09-15"),
      targetRole: "Full Stack Engineering Intern",
      organisation: "Atlassian",
      notes: "Completed online test and 2 technical rounds.",
    },
  });

  // Documented Feedback for Atlassian
  await prisma.applicationFeedback.create({
    data: {
      applicationId: appAtlassian.id,
      outcome: "REJECTED",
      feedbackReceived: true,
      feedbackSource: "INTERVIEWER_NOTES",
      feedbackText: "Priya demonstrated excellent frontend proficiency and coding speed. However, during the System Design round, she struggled to articulate database sharding and caching eviction policies under 100k QPS load.",
      statedImprovementAreas: JSON.stringify(["System Design Depth", "Database Sharding & Caching"]),
      isEvidenceBacked: true,
    },
  });

  // App 5: Historical Offer (To show successful conversion!)
  const oppInnovaccer = await prisma.opportunity.upsert({
    where: { id: "demo-opp-innovaccer-2025" },
    update: {},
    create: {
      id: "demo-opp-innovaccer-2025",
      title: "Frontend Engineering Intern (Summer 2025)",
      organisation: "Innovaccer Technology Labs",
      organisationLogo: "https://innovaccer.com/favicon.ico",
      category: "INTERNSHIP",
      roleDescription: "Healthcare data visualization dashboard development.",
      originalUrl: "https://innovaccer.com/careers",
      officialOrgUrl: "https://innovaccer.com",
      sourceType: "OFFICIAL_CAREER_PORTAL",
      sourceVerificationStatus: "OFFICIAL_VERIFIED",
      location: "Noida, India",
      workArrangement: "HYBRID",
      requiredEducation: "B.Tech in CSE",
      eligibleGradYears: JSON.stringify(["2026"]),
      requiredSkills: JSON.stringify(["React", "TypeScript"]),
      status: "EXPIRED",
      isDemo: true,
      confidenceNotes: "Historical completed internship.",
    },
  });

  const appInnovaccer = await prisma.application.create({
    data: {
      userId: user.id,
      opportunityId: oppInnovaccer.id,
      currentStatus: "OFFER_RECEIVED",
      appliedDate: new Date("2025-03-01"),
      deadline: new Date("2025-03-10"),
      targetRole: "Frontend Engineering Intern",
      organisation: "Innovaccer",
      notes: "Received and completed successfully.",
    },
  });

  await prisma.applicationFeedback.create({
    data: {
      applicationId: appInnovaccer.id,
      outcome: "OFFER",
      feedbackReceived: true,
      feedbackSource: "EMPLOYER_EMAIL",
      feedbackText: "Exceptional mastery of React performance optimization and clear technical communication in panel round.",
      statedImprovementAreas: JSON.stringify([]),
      isEvidenceBacked: true,
    },
  });

  // Notifications
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "Google Online Challenge in 3 Days",
        message: "Your Google Software Engineering Intern assessment window opens on Friday. Complete your practice session now.",
        type: "DEADLINE_ALERT",
        linkUrl: "/preparation/demo-opp-google-swe-2026",
      },
      {
        userId: user.id,
        title: "Investigation Report Completed",
        message: "Opportunity Intelligence Agent finished analyzing Microsoft Cloud Engineer Intern. 1 missing evidence requirement detected.",
        type: "INVESTIGATION_READY",
        linkUrl: "/investigation/demo-opp-microsoft-cloud-2026",
      },
      {
        userId: user.id,
        title: "Application Deadline Alert: Microsoft",
        message: "Microsoft Cloud Engineer Intern deadline expires in 5 days. Complete the Docker evidence task to proceed.",
        type: "DEADLINE_ALERT",
        linkUrl: "/applications",
      },
    ],
  });

  console.log("Demo data successfully seeded for Priya Sharma (priya.sharma@nsut.ac.in).");
}
