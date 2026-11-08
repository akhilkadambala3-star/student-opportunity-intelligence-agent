import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  institution: z.string().optional(),
  degree: z.string().optional(),
  branch: z.string().optional(),
  currentSemester: z.number().int().min(1).max(12).optional(),
  graduationYear: z.number().int().min(2020).max(2035).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  location: z.string().optional(),
  preferredLocations: z.array(z.string()).optional(),
  workPreference: z.enum(["REMOTE", "HYBRID", "ONSITE", "ANY"]).optional(),
  targetRoles: z.array(z.string()).optional(),
  targetIndustries: z.array(z.string()).optional(),
  targetOpportunities: z.array(z.string()).optional(),
  minStipend: z.number().int().min(0).optional(),
  bio: z.string().optional(),
  headline: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        skills: {
          include: { skill: true },
          orderBy: { isVerified: "desc" },
        },
        projects: {
          orderBy: { createdAt: "desc" },
        },
        experiences: {
          orderBy: { startDate: "desc" },
        },
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Calculate profile completion score
    let completion = 40;
    if (data.institution) completion += 10;
    if (data.cgpa) completion += 15;
    if (data.graduationYear) completion += 10;
    if (data.targetRoles && data.targetRoles.length > 0) completion += 10;
    if (data.bio) completion += 15;
    completion = Math.min(completion, 100);

    const updated = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName: data.displayName,
        institution: data.institution,
        degree: data.degree,
        branch: data.branch,
        currentSemester: data.currentSemester,
        graduationYear: data.graduationYear,
        cgpa: data.cgpa,
        location: data.location,
        preferredLocations: data.preferredLocations ? JSON.stringify(data.preferredLocations) : undefined,
        workPreference: data.workPreference,
        targetRoles: data.targetRoles ? JSON.stringify(data.targetRoles) : undefined,
        targetIndustries: data.targetIndustries ? JSON.stringify(data.targetIndustries) : undefined,
        targetOpportunities: data.targetOpportunities ? JSON.stringify(data.targetOpportunities) : undefined,
        minStipend: data.minStipend,
        bio: data.bio,
        headline: data.headline,
        profileCompletion: completion,
      },
      create: {
        userId: user.id,
        displayName: data.displayName || user.name,
        institution: data.institution,
        degree: data.degree,
        branch: data.branch,
        currentSemester: data.currentSemester,
        graduationYear: data.graduationYear || 2026,
        cgpa: data.cgpa,
        location: data.location,
        preferredLocations: data.preferredLocations ? JSON.stringify(data.preferredLocations) : undefined,
        workPreference: data.workPreference || "ANY",
        targetRoles: data.targetRoles ? JSON.stringify(data.targetRoles) : undefined,
        targetIndustries: data.targetIndustries ? JSON.stringify(data.targetIndustries) : undefined,
        targetOpportunities: data.targetOpportunities ? JSON.stringify(data.targetOpportunities) : undefined,
        minStipend: data.minStipend,
        bio: data.bio,
        headline: data.headline,
        profileCompletion: completion,
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
