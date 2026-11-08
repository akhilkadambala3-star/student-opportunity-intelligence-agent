import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppLayout } from "@/components/layout/AppLayout";
import { EligibilityBadge, ProvenanceBadge } from "@/components/ui/Badge";
import { ScanEye, ArrowRight, Sparkles, Building2, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InvestigationIndexPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const investigations = await prisma.investigation.findMany({
    where: { userId: user.id },
    include: {
      opportunity: { include: { sources: true } },
      findings: true,
    },
    orderBy: { lastRunAt: "desc" },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ScanEye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Investigation Workspace</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Evidence audits conducted by the Opportunity Intelligence Agent across your targeted opportunities.
            </p>
          </div>

          <Link
            href="/opportunities"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 inline-flex items-center gap-1.5 self-start"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Audit New Opportunity</span>
          </Link>
        </div>

        {investigations.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No investigations run yet. Visit Opportunity Discovery to launch an audit against your profile.
            </p>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {investigations.map((inv) => (
              <div
                key={inv.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{inv.opportunity.organisation}</span>
                    <ProvenanceBadge trustLevel={inv.opportunity.sourceVerificationStatus} />
                    <EligibilityBadge state={inv.overallEligibility} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {inv.opportunity.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    {inv.summary}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Mandatory Criteria Met: <strong className="text-slate-800 dark:text-slate-200">{inv.hardRequirementsMet} / {inv.totalMandatoryRequirements}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Soft Match: <strong className="text-blue-600 dark:text-blue-400 font-mono">{inv.suitabilityScore}/100</strong>
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <Link
                    href={`/investigation/${inv.opportunityId}`}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <span>View Audit Table</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/preparation/${inv.opportunityId}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium text-xs transition-colors"
                  >
                    Preparation Roadmap
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
