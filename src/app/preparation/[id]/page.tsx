"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { AppClientLayout } from "@/components/layout/AppClientLayout";
import { Badge } from "@/components/ui/Badge";
import {
  GraduationCap,
  CheckCircle2,
  Circle,
  ExternalLink,
  Send,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Cpu,
} from "lucide-react";

export default function PreparationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tasks" | "practice" | "resources">("tasks");

  // Practice state
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const fetchPlan = async () => {
    try {
      const res = await fetch(`/api/preparation/${id}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/preparation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, isCompleted: !currentStatus }),
      });
      if (res.ok) {
        fetchPlan();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitPractice = async () => {
    if (!studentAnswer.trim() || !data?.opportunity) return;
    setEvaluating(true);
    setEvaluationResult(null);

    const questionObj = sampleQuestions[activeQuestionIdx];

    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: id,
          topic: questionObj.topic,
          question: questionObj.question,
          questionType: questionObj.questionType,
          expectedKeyPoints: questionObj.expectedKeyPoints,
          studentAnswer,
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        setEvaluationResult(resData.evaluation);
        fetchPlan();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const sampleQuestions = [
    {
      topic: "Algorithms: Graph Traversal & Shortest Path",
      question: "You are given a weighted directed acyclic graph (DAG) representing task dependencies. How do you find the minimum total time needed to complete all tasks, and how do you handle circular dependency errors?",
      questionType: "TECHNICAL",
      expectedKeyPoints: [
        "Topological sorting via Kahn's algorithm or DFS post-order",
        "Cycle detection with in-degree validation",
        "Dynamic programming over topological order for longest/critical path",
        "Time complexity O(V + E)",
      ],
    },
    {
      topic: "System Design: Microservice Cache Eviction",
      question: "When designing a caching layer for high-volume read queries, how would you prevent cache stampedes (dog-piling) and ensure eventual consistency when mutations occur?",
      questionType: "TECHNICAL",
      expectedKeyPoints: [
        "Mutex locking or probabilistic early expiration (XFetch algorithm)",
        "Write-through vs Cache-aside with invalidation events",
        "Background worker refresh for warm cache keys",
        "Handling network partitions between cache and database",
      ],
    },
    {
      topic: "Behavioral: Resolving Architectural Disagreements",
      question: "Tell me about a time you strongly disagreed with a peer on an engineering decision. How did you structure your argument and what was the outcome?",
      questionType: "BEHAVIORAL",
      expectedKeyPoints: [
        "STAR framework structure",
        "Data or benchmark-driven evidence rather than emotional arguments",
        "Intellectual humility and commitment to project success",
        "Collaborative post-decision execution",
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-400 font-mono text-xs">
        Loading preparation blueprint...
      </div>
    );
  }

  const plan = data?.plan;
  const opp = data?.opportunity;

  return (
    <AppClientLayout>
      <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/opportunities" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">Discover</Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">Preparation Centre</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{plan?.title || `Preparation Blueprint for ${opp?.title}`}</span>
          </h2>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Targeted for <strong className="text-slate-700 dark:text-slate-300">{opp?.organisation}</strong> • Estimated Effort: {plan?.estimatedHours || 20} Hours
          </div>
        </div>

        {/* Readiness Metric */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Readiness Score</div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{plan?.overallReadiness || 0}%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
        {[
          { key: "tasks", label: "Tactical Preparation Tasks" },
          { key: "practice", label: "Interactive Practice Drill Centre" },
          { key: "resources", label: "Official Guides & Curated Material" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 font-semibold transition-all border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab.key
                ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Roadmap Tasks */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Tasks are tagged with their evidence origin: <strong>Officially Documented Stage</strong> vs <strong>Candidate-Reported Experience</strong> vs <strong>AI-Inferred Recommendation</strong>.
            </span>
          </div>

          <div className="space-y-3">
            {plan?.tasks?.map((task: any) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 shadow-sm ${
                  task.isCompleted
                    ? "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 opacity-80"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <button
                  onClick={() => handleToggleTask(task.id, task.isCompleted)}
                  className="mt-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  )}
                </button>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4
                      className={`text-sm font-bold ${
                        task.isCompleted ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.evidenceBasis === "OFFICIAL_STAGE" ? (
                      <Badge variant="official">Official Hiring Stage</Badge>
                    ) : task.evidenceBasis === "CANDIDATE_REPORTED" ? (
                      <Badge variant="reported">Candidate Reported</Badge>
                    ) : (
                      <Badge variant="inferred">AI Inferred Strategy</Badge>
                    )}

                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                      ~{task.estimatedMinutes} mins
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {task.description}
                  </p>

                  {task.resourceUrl && (
                    <div className="pt-1">
                      <a
                        href={task.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>Resource Guide</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Practice Drill Centre */}
      {activeTab === "practice" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveQuestionIdx(idx);
                  setEvaluationResult(null);
                  setStudentAnswer("");
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all shadow-xs ${
                  activeQuestionIdx === idx
                    ? "bg-blue-50 dark:bg-blue-600/15 border-blue-300 dark:border-blue-500 text-blue-900 dark:text-blue-200"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-slate-200 line-clamp-1">{q.topic}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-mono">{q.questionType}</div>
              </button>
            ))}
          </div>

          {/* Active Question Box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">
                {sampleQuestions[activeQuestionIdx].questionType} Interview Drill
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                {sampleQuestions[activeQuestionIdx].question}
              </h3>
            </div>

            {/* Answer Input */}
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 font-medium mb-1.5">
                Your Answer / Live Technical Defense:
              </label>
              <textarea
                rows={6}
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Structure your answer with architectural principles, complexity trade-offs, and failure handling..."
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Evaluation is graded against technical rubric and candidate benchmarks.
              </span>
              <button
                onClick={handleSubmitPractice}
                disabled={evaluating || !studentAnswer.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{evaluating ? "Evaluating Answer..." : "Submit for AI Assessment"}</span>
              </button>
            </div>

            {/* AI Evaluation Result Card */}
            {evaluationResult && (
              <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-blue-200 dark:border-blue-500/30 space-y-4 text-xs shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-slate-900 dark:text-slate-100">AI Interview Feedback</span>
                  </div>
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Score Estimate: {evaluationResult.scoreEstimate} / 100
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {evaluationResult.aiFeedback}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 space-y-1.5">
                    <strong className="text-emerald-800 dark:text-emerald-300 font-bold block">Key Strengths Demonstrated:</strong>
                    <ul className="text-emerald-900/90 dark:text-emerald-200/80 space-y-1">
                      {evaluationResult.strengths?.map((s: string, i: number) => (
                        <li key={i}>✓ {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 space-y-1.5">
                    <strong className="text-amber-800 dark:text-amber-300 font-bold block">Actionable Improvements:</strong>
                    <ul className="text-amber-900/90 dark:text-amber-200/80 space-y-1">
                      {evaluationResult.improvements?.map((imp: string, i: number) => (
                        <li key={i}>• {imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Official Resources */}
      {activeTab === "resources" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan?.resources?.map((r: any) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                      {r.resourceType}
                    </span>
                    {r.isOfficial && <Badge variant="official">Official Hiring Guide</Badge>}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{r.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{r.summary}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </AppClientLayout>
);
}
