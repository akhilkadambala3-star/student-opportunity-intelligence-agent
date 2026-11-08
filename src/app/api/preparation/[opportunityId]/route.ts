import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateOpportunityPrepPlan } from "@/lib/ai/preparation";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ opportunityId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { opportunityId } = await params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    let plan = await prisma.preparationPlan.findUnique({
      where: {
        userId_opportunityId: {
          userId: user.id,
          opportunityId,
        },
      },
      include: {
        tasks: { orderBy: { priority: "asc" } },
        resources: true,
      },
    });

    // If no plan exists yet, synthesize one!
    if (!plan) {
      let reqSkills: string[] = [];
      try {
        reqSkills = JSON.parse(opportunity.requiredSkills);
      } catch {}

      const blueprint = await generateOpportunityPrepPlan(
        opportunity.title,
        opportunity.organisation,
        reqSkills,
        opportunity.category
      );

      plan = await prisma.preparationPlan.create({
        data: {
          userId: user.id,
          opportunityId,
          title: blueprint.title,
          estimatedHours: blueprint.estimatedHours,
          overallReadiness: 0,
        },
        include: {
          tasks: true,
          resources: true,
        },
      });

      // Insert blueprint tasks
      await prisma.preparationTask.createMany({
        data: blueprint.tasks.map((t) => ({
          planId: plan!.id,
          title: t.title,
          category: t.category,
          description: t.description,
          evidenceBasis: t.evidenceBasis,
          priority: t.priority,
          estimatedMinutes: t.estimatedMinutes,
          resourceUrl: t.resourceUrl,
        })),
      });

      // Insert resources
      await prisma.preparationResource.createMany({
        data: blueprint.resources.map((r) => ({
          planId: plan!.id,
          title: r.title,
          resourceType: r.resourceType,
          url: r.url,
          summary: r.summary,
          isOfficial: r.isOfficial,
        })),
      });

      // Fetch freshly populated plan
      plan = await prisma.preparationPlan.findUnique({
        where: { id: plan.id },
        include: {
          tasks: true,
          resources: true,
        },
      });
    }

    // Fetch practice sessions for this opportunity
    const practiceSessions = await prisma.practiceSession.findMany({
      where: { userId: user.id, opportunityId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      plan,
      practiceSessions,
      opportunity,
    });
  } catch (error) {
    console.error("Preparation plan error:", error);
    return NextResponse.json({ error: "Failed to fetch preparation plan" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ opportunityId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { opportunityId } = await params;
    const body = await req.json();
    const { taskId, isCompleted } = body;

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const plan = await prisma.preparationPlan.findUnique({
      where: {
        userId_opportunityId: {
          userId: user.id,
          opportunityId,
        },
      },
      include: { tasks: true },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Update task
    await prisma.preparationTask.update({
      where: { id: taskId },
      data: {
        isCompleted: Boolean(isCompleted),
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Recalculate readiness percentage
    const updatedTasks = await prisma.preparationTask.findMany({
      where: { planId: plan.id },
    });

    const completedCount = updatedTasks.filter((t) => t.isCompleted).length;
    const readiness = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;

    const updatedPlan = await prisma.preparationPlan.update({
      where: { id: plan.id },
      data: { overallReadiness: readiness },
      include: { tasks: true, resources: true },
    });

    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
