import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Project title required"),
  description: z.string().min(1, "Project description required"),
  problemSolved: z.string().optional(),
  technologies: z.array(z.string()).min(1, "Select at least one technology"),
  personalContribution: z.string().optional(),
  githubUrl: z.string().url("Valid URL required").optional().or(z.literal("")),
  liveUrl: z.string().url("Valid URL required").optional().or(z.literal("")),
  evidenceNotes: z.string().optional(),
  isOngoing: z.boolean().default(false),
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
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { id, title, description, problemSolved, technologies, personalContribution, githubUrl, liveUrl, evidenceNotes, isOngoing } = parsed.data;

    let project;
    if (id) {
      project = await prisma.project.updateMany({
        where: { id, profileId: profile.id },
        data: {
          title,
          description,
          problemSolved,
          technologies: JSON.stringify(technologies),
          personalContribution,
          githubUrl: githubUrl || null,
          liveUrl: liveUrl || null,
          evidenceNotes,
          isOngoing,
        },
      });
    } else {
      project = await prisma.project.create({
        data: {
          profileId: profile.id,
          title,
          description,
          problemSolved,
          technologies: JSON.stringify(technologies),
          personalContribution,
          githubUrl: githubUrl || null,
          liveUrl: liveUrl || null,
          evidenceNotes,
          isOngoing,
        },
      });
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Error saving project:", error);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("id");

    if (!projectId) {
      return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await prisma.project.deleteMany({
      where: {
        id: projectId,
        profileId: profile.id,
      },
    });

    return NextResponse.json({ success: true, message: "Project deleted" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
