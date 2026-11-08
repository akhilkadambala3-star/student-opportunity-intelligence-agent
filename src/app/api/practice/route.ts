import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { evaluatePracticeAnswer } from "@/lib/ai/preparation";
import { z } from "zod";

export const dynamic = "force-dynamic";

const practiceAnswerSchema = z.object({
  opportunityId: z.string().optional(),
  topic: z.string().min(1, "Topic required"),
  question: z.string().min(1, "Question required"),
  questionType: z.enum(["TECHNICAL", "APTITUDE", "BEHAVIORAL", "PROJECT_EXPLANATION"]),
  expectedKeyPoints: z.array(z.string()),
  studentAnswer: z.string().min(5, "Answer must be at least 5 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = practiceAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { opportunityId, topic, question, questionType, expectedKeyPoints, studentAnswer } = parsed.data;

    // Evaluate answer with AI
    const evaluation = await evaluatePracticeAnswer(
      question,
      questionType,
      expectedKeyPoints,
      studentAnswer
    );

    // Save session
    const session = await prisma.practiceSession.create({
      data: {
        userId: user.id,
        opportunityId: opportunityId || null,
        topic,
        question,
        questionType,
        expectedKeyPoints: JSON.stringify(expectedKeyPoints),
        studentAnswer,
        aiFeedback: evaluation.aiFeedback,
        strengths: JSON.stringify(evaluation.strengths),
        improvements: JSON.stringify(evaluation.improvements),
        scoreEstimate: evaluation.scoreEstimate,
      },
    });

    return NextResponse.json({
      success: true,
      session,
      evaluation,
    });
  } catch (error) {
    console.error("Practice evaluation error:", error);
    return NextResponse.json({ error: "Failed to evaluate answer" }, { status: 500 });
  }
}
