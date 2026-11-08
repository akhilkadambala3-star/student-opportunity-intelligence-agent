"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppClientLayout } from "@/components/layout/AppClientLayout";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FolderGit2,
  Code2,
} from "lucide-react";

export default function InsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      const res = await fetch("/api/insights");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-400 font-mono text-xs">
        Synthesizing progress intelligence & outcome evidence...
      </div>
    );
  }

  const report = data?.report;
  const sample = report?.sampleSizeSummary;

  return (
    <AppClientLayout>
      <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Progress & Outcome Intelligence</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Evidence-backed analytics derived strictly from your tracked applications and confirmed feedback.
        </p>
      </div>

      {/* Sample Size & Confidence Notice (Rule: Always display sample sizes) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold font-mono">
            n={sample?.totalApplications || 0}
          </div>
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Sample Size Notice:</span>
            <span className="text-slate-600 dark:text-slate-400 ml-1.5">{sample?.dataConfidenceNotice}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="official">Evidence-Grounded</Badge>
        </div>
      </div>

      {/* Funnel & Conversion Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Application Conversion Funnel</span>
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Progression across hiring stages (n={sample?.totalApplications || 0})
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {report?.conversionFunnel?.map((item: any, idx: number) => (
              <div key={item.stage} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.stage}</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? "bg-slate-400 dark:bg-slate-700"
                        : idx === 1
                        ? "bg-blue-600"
                        : idx === 2
                        ? "bg-indigo-500"
                        : idx === 3
                        ? "bg-purple-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.max(item.percentage, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Gap Frequency Across Target Opportunities */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Target Market Skill Demand</span>
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Technologies requested by your target opportunities vs your confirmed profile
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {report?.skillGapFrequency?.slice(0, 5).map((skill: any) => (
              <div
                key={skill.skill}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  {skill.status === "CONFIRMED" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{skill.skill}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Required by {skill.marketDemandCount} target opportunity(s)
                    </span>
                  </div>
                </div>

                <div>
                  {skill.status === "CONFIRMED" ? (
                    <Badge variant="eligible">Profile Evidenced</Badge>
                  ) : (
                    <Badge variant="potential">Evidence Gap</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documented Feedback Themes from Real Outcomes */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Documented Feedback Themes</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Summarized strictly from verified employer communications and interviewer notes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report?.documentedFeedbackThemes?.map((theme: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">{theme.theme}</span>
                <span className="text-[10px] font-mono text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/40">
                  Reported {theme.reportedInCount}x
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Origin: {theme.evidenceSource}
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {theme.actionableFix}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence-Backed Personal Improvement Plan */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-200 dark:border-blue-500/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Evidence-Backed Personal Improvement Plan</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Specific actions recommended based on target market gaps and recorded interview outcomes.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {report?.evidenceBackedImprovementPlan?.map((plan: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{plan.category.replace("_", " ")}</Badge>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{plan.title}</h4>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{plan.rationale}</p>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                  Grounded in: {plan.groundedIn}
                </div>
              </div>

              <Link
                href="/preparation"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm shadow-blue-600/20 shrink-0 inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Take Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  </AppClientLayout>
);
}
