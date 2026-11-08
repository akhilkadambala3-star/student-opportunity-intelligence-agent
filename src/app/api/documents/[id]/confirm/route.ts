import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const confirmationSchema = z.object({
  displayName: z.string().optional(),
  institution: z.string().optional(),
  degree: z.string().optional(),
  branch: z.string().optional(),
  graduationYear: z.number().int().optional(),
  cgpa: z.number().optional(),
  location: z.string().optional(),
  confirmedSkills: z.array(z.string()).optional(),
  confirmedProjects: z.array(
    z.object({
      title: z.string(),
      technologies: z.array(z.string()),
      description: z.string(),
      githubUrl: z.string().optional().or(z.literal("")),
    })
  ).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const document = await prisma.document.findFirst({
      where: { id, userId: user.id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = confirmationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 1. Mark document as confirmed by user
    await prisma.document.update({
      where: { id: document.id },
      data: { isConfirmed: true },
    });

    // 2. Update Student Profile
    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        displayName: data.displayName,
        institution: data.institution,
        degree: data.degree,
        branch: data.branch,
        graduationYear: data.graduationYear,
        cgpa: data.cgpa,
        location: data.location,
      },
      create: {
        userId: user.id,
        displayName: data.displayName || user.name,
        institution: data.institution,
        degree: data.degree,
        branch: data.branch,
        graduationYear: data.graduationYear || 2026,
        cgpa: data.cgpa,
        location: data.location,
      },
    });

    // 3. Add confirmed skills
    if (data.confirmedSkills && data.confirmedSkills.length > 0) {
      for (const skillName of data.confirmedSkills) {
        const skillRecord = await prisma.skill.upsert({
          where: { name: skillName.trim() },
          update: {},
          create: { name: skillName.trim(), category: "Extracted from Resume" },
        });

        await prisma.userSkill.upsert({
          where: {
            profileId_skillId: {
              profileId: profile.id,
              skillId: skillRecord.id,
            },
          },
          update: {
            isVerified: true,
            verificationSource: `Confirmed via ${document.title}`,
          },
          create: {
            profileId: profile.id,
            skillId: skillRecord.id,
            proficiencyLevel: "INTERMEDIATE",
            isVerified: true,
            verificationSource: `Confirmed via ${document.title}`,
            evidenceNotes: `Extracted from verified resume file '${document.title}' and explicitly confirmed by student.`,
          },
        });
      }
    }

    // 4. Add confirmed projects
    if (data.confirmedProjects && data.confirmedProjects.length > 0) {
      for (const proj of data.confirmedProjects) {
        await prisma.project.create({
          data: {
            profileId: profile.id,
            title: proj.title,
            description: proj.description,
            technologies: JSON.stringify(proj.technologies),
            githubUrl: proj.githubUrl || null,
            evidenceNotes: `Extracted from uploaded resume '${document.title}' and confirmed by user.`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Confirmed extracted data successfully applied to your profile!",
      profile,
    });
  } catch (error) {
    console.error("Confirmation error:", error);
    return NextResponse.json({ error: "Failed to apply confirmed data" }, { status: 500 });
  }
}
