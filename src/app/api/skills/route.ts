import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const skillSchema = z.object({
  name: z.string().min(1, "Skill name required"),
  category: z.string().default("General"),
  proficiencyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).default("INTERMEDIATE"),
  isVerified: z.boolean().default(false),
  verificationSource: z.string().optional(),
  evidenceNotes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = skillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, category, proficiencyLevel, isVerified, verificationSource, evidenceNotes } = parsed.data;

    const skill = await prisma.skill.upsert({
      where: { name: name.trim() },
      update: { category },
      create: { name: name.trim(), category },
    });

    const userSkill = await prisma.userSkill.upsert({
      where: {
        profileId_skillId: {
          profileId: profile.id,
          skillId: skill.id,
        },
      },
      update: {
        proficiencyLevel,
        isVerified,
        verificationSource,
        evidenceNotes,
      },
      create: {
        profileId: profile.id,
        skillId: skill.id,
        proficiencyLevel,
        isVerified,
        verificationSource,
        evidenceNotes,
      },
      include: { skill: true },
    });

    return NextResponse.json({ success: true, userSkill });
  } catch (error) {
    console.error("Error saving skill:", error);
    return NextResponse.json({ error: "Failed to save skill" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userSkillId = searchParams.get("id");

    if (!userSkillId) {
      return NextResponse.json({ error: "Missing skill ID" }, { status: 400 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await prisma.userSkill.deleteMany({
      where: {
        id: userSkillId,
        profileId: profile.id,
      },
    });

    return NextResponse.json({ success: true, message: "Skill deleted" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}
