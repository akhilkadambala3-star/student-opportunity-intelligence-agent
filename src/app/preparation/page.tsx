import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppLayout } from "@/components/layout/AppLayout";
import { GraduationCap, ArrowRight, TrendingUp, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PreparationIndexPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const plans = await prisma.preparationPlan.findMany({
    where: { userId: user.id },
    include: {
      opportunity: true,
      tasks: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Preparation Centre</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Tailored roadmaps, selection stage dissection, and interactive mock drills for your target opportunities.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No preparation plans initialized yet. Audit an opportunity to generate a tailored blueprint.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {plans.map((plan) => {
              const completedTasks = plan.tasks.filter((t) => t.isCompleted).length;
              return (
                <div
                  key={plan.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {plan.opportunity.organisation}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {plan.overallReadiness}% Readiness
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {plan.title}
                    </h3>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Milestones Completed</span>
                        <span>{completedTasks} of {plan.tasks.length}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all"
                          style={{
                            width: `${plan.tasks.length > 0 ? (completedTasks / plan.tasks.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Est. Effort: ~{plan.estimatedHours} hrs
                    </span>
                    <Link
                      href={`/preparation/${plan.opportunityId}`}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 inline-flex items-center gap-1.5"
                    >
                      <span>Open Blueprint & Drills</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
