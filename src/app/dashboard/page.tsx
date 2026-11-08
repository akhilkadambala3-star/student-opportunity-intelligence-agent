import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppLayout } from "@/components/layout/AppLayout";
import { EligibilityBadge, ProvenanceBadge } from "@/components/ui/Badge";
import {
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Target,
  ExternalLink,
  KanbanSquare,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const now = Date.now();

  // Fetch full student profile
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      skills: { include: { skill: true } },
      projects: true,
      experiences: true,
    },
  });

  // Fetch recent applications
  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { opportunity: true },
    orderBy: { updatedAt: "desc" },
  });

  // Fetch recent investigations
  const investigations = await prisma.investigation.findMany({
    where: { userId: user.id },
    include: {
      opportunity: { include: { sources: true } },
      findings: true,
    },
    orderBy: { lastRunAt: "desc" },
    take: 3,
  });

  // Fetch upcoming prep tasks
  const prepPlans = await prisma.preparationPlan.findMany({
    where: { userId: user.id },
    include: {
      opportunity: true,
      tasks: {
        where: { isCompleted: false },
        take: 4,
      },
    },
  });

  // Fetch recommended opportunities
  const opportunities = await prisma.opportunity.findMany({
    where: { status: "ACTIVE" },
    take: 3,
    orderBy: { applicationDeadline: "asc" },
  });

  // Application counts by stage
  const counts = {
    saved: applications.filter((a) => a.currentStatus === "SAVED" || a.currentStatus === "INTERESTED").length,
    preparing: applications.filter((a) => a.currentStatus === "PREPARING").length,
    applied: applications.filter((a) => a.currentStatus === "APPLIED").length,
    assessment: applications.filter((a) => a.currentStatus === "ASSESSMENT_SCHEDULED").length,
    interview: applications.filter((a) => a.currentStatus === "INTERVIEW_SCHEDULED").length,
    offers: applications.filter((a) => a.currentStatus === "OFFER_RECEIVED").length,
  };

  const profileCompletion = profile?.profileCompletion || 40;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Top Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm dark:shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <span>{profile?.institution || "NSUT Delhi"}</span>
              <span>•</span>
              <span>{profile?.degree || "B.Tech"} {profile?.branch || "CSE"} '26</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Welcome back, {profile?.displayName || user.name}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Opportunity Intelligence has audited 4 opportunities against your confirmed credentials. You have 1 assessment upcoming this week.
            </p>
          </div>

          {/* Profile Completion Gauge */}
          <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800/80 shadow-xs min-w-[220px]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Profile Evidence</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{profileCompletion}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <Link
              href="/profile"
              className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>Manage evidence & skills</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Application Pipeline Stage Counter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
              <KanbanSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Application Pipeline</span>
            </h3>
            <Link href="/applications" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium">
              <span>Open Tracker</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Saved", count: counts.saved, color: "text-slate-700 dark:text-slate-300", bg: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" },
              { label: "Preparing", count: counts.preparing, color: "text-amber-600 dark:text-amber-400", bg: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" },
              { label: "Applied", count: counts.applied, color: "text-blue-600 dark:text-blue-400", bg: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" },
              { label: "Assessments", count: counts.assessment, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-slate-800" },
              { label: "Interviews", count: counts.interview, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-slate-800" },
              { label: "Offers", count: counts.offers, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-slate-800" },
            ].map((s) => (
              <Link
                key={s.label}
                href="/applications"
                className={`p-3.5 rounded-xl border ${s.bg} hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all text-center block`}
              >
                <div className={`text-xl font-bold font-mono ${s.color}`}>{s.count}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{s.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols wide): Recommended & Recent Investigations */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recommended Opportunities */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Top Targeted Opportunities</span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Transparent match evaluations based on your verified criteria
                  </span>
                </div>
                <Link
                  href="/opportunities"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Explore all</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {opportunities.map((opp) => {
                  let reqSkills: string[] = [];
                  try {
                    reqSkills = JSON.parse(opp.requiredSkills);
                  } catch {}

                  const daysUntil = opp.applicationDeadline
                    ? Math.ceil((new Date(opp.applicationDeadline).getTime() - now) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <div
                      key={opp.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {opp.organisation}
                          </span>
                          <ProvenanceBadge trustLevel={opp.sourceVerificationStatus} />
                          {daysUntil !== null && (
                            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                              daysUntil <= 5
                                ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30"
                                : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                            }`}>
                              {daysUntil > 0 ? `${daysUntil} days left` : "Deadline passed"}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {opp.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {reqSkills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="text-[10px] font-medium bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800"
                            >
                              {s}
                            </span>
                          ))}
                          {opp.stipendOrComp && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium ml-1">
                              • {opp.stipendOrComp}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                        <Link
                          href={`/investigation/${opp.id}`}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Investigate</span>
                        </Link>
                        <Link
                          href={`/preparation/${opp.id}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium text-[11px] transition-colors"
                        >
                          Prep Roadmap
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Investigations Audit Log */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Recent Investigation Audits</span>
              </h3>

              <div className="space-y-3">
                {investigations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{inv.opportunity.organisation}</span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{inv.opportunity.title}</h4>
                      </div>
                      <EligibilityBadge state={inv.overallEligibility} />
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                      {inv.summary}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span>Mandatory Met: <strong className="text-slate-800 dark:text-slate-200">{inv.hardRequirementsMet} / {inv.totalMandatoryRequirements}</strong></span>
                      <Link
                        href={`/investigation/${inv.opportunityId}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Full Requirement Breakdown</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Upcoming Tasks & Preparation Focus */}
          <div className="space-y-6">
            {/* Upcoming Deadlines & Events */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Upcoming Milestones</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Google India Assessment</span>
                    <span className="text-slate-500 dark:text-slate-400">In 3 Days</span>
                  </div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">Google Online Challenge (GOC)</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Timed 60-min DSA simulation</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">Microsoft Cloud Intern</span>
                    <span className="text-slate-500 dark:text-slate-400">In 5 Days</span>
                  </div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">Application Portal Closes</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Action: push Docker evidence commit</div>
                </div>
              </div>
            </div>

            {/* Preparation Tasks */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Pending Prep Tasks</span>
                </h3>
                <Link href="/preparation" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  View all
                </Link>
              </div>

              <div className="space-y-2.5">
                {prepPlans.flatMap((p) => p.tasks).slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{task.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{task.description}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">~{task.estimatedMinutes} mins • Priority: {task.priority}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Next Step Callout */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-500/30 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Next Recommended Move</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Take the <strong>Google GOC Graph Traversal</strong> interactive practice session in the Preparation Center to verify complexity defense before your test window opens.
              </p>
              <Link
                href="/preparation/demo-opp-google-swe-2026"
                className="block text-center py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm shadow-indigo-600/20"
              >
                Launch Mock Question Drill →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
