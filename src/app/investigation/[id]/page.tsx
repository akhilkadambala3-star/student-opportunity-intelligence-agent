"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { AppClientLayout } from "@/components/layout/AppClientLayout";
import { EligibilityBadge, ProvenanceBadge, Badge } from "@/components/ui/Badge";
import {
  ScanEye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Copy,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Bookmark,
  FileCheck2,
  Share2,
} from "lucide-react";

export default function InvestigationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [opportunity, setOpportunity] = useState<any>(null);
  const [investigation, setInvestigation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reRunning, setReRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"audit" | "overview" | "sources" | "actions">("audit");
  const [copied, setCopied] = useState(false);

  const fetchInvestigationData = async () => {
    try {
      const res = await fetch(`/api/opportunities/${id}`);
      const data = await res.json();
      if (data.opportunity) {
        setOpportunity(data.opportunity);
        setInvestigation(data.userInvestigation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigationData();
  }, [id]);

  const handleRunInvestigation = async () => {
    setReRunning(true);
    try {
      const res = await fetch("/api/investigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: id }),
      });
      const data = await res.json();
      if (data.investigation) {
        setInvestigation(data.investigation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReRunning(false);
    }
  };

  const copyReportToClipboard = () => {
    if (!investigation || !opportunity) return;
    const reportText = `
OPPORTUNITY INVESTIGATION REPORT
Opportunity: ${opportunity.title} at ${opportunity.organisation}
Overall Eligibility: ${investigation.overallEligibility}
Mandatory Requirements Met: ${investigation.hardRequirementsMet} / ${investigation.totalMandatoryRequirements}
Soft Suitability Score: ${investigation.suitabilityScore} / 100

SUMMARY:
${investigation.summary}

GAP ANALYSIS:
${investigation.gapAnalysis}

AUDIT FINDINGS:
${investigation.findings
  ?.map(
    (f: any, idx: number) =>
      `${idx + 1}. [${f.evaluationStatus}] ${f.requirementText}\n   Evidence: ${f.evidenceFound || "None"}\n   Action: ${f.recommendedAction || "None"}`
  )
  .join("\n\n")}

Disclaimer: ${investigation.providerDecisionDisclaimer}
`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-400 font-mono text-xs">
        Loading investigation audit workspace...
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
        Opportunity not found.
      </div>
    );
  }

  const riskFactors = investigation?.riskFactors ? JSON.parse(investigation.riskFactors) : [];
  const recommendations = investigation?.recommendations ? JSON.parse(investigation.recommendations) : [];

  return (
    <AppClientLayout>
      <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/opportunities" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">Discover</Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">Investigation Workspace</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{opportunity.title}</span>
          </h2>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{opportunity.organisation}</span>
            <span>•</span>
            <ProvenanceBadge trustLevel={opportunity.sourceVerificationStatus} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyReportToClipboard}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? "Report Copied!" : "Export Report"}</span>
          </button>

          <button
            onClick={handleRunInvestigation}
            disabled={reRunning}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm shadow-blue-600/25 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{reRunning ? "Auditing Credentials..." : "Re-run Investigation"}</span>
          </button>
        </div>
      </div>

      {/* Investigation Status Banner */}
      {investigation ? (
        <div className={`p-6 rounded-2xl border shadow-sm ${
          investigation.overallEligibility === "APPEARS_ELIGIBLE"
            ? "bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 border-emerald-200 dark:border-emerald-500/30"
            : investigation.overallEligibility === "POTENTIALLY_ELIGIBLE"
            ? "bg-gradient-to-r from-amber-50 via-yellow-50/40 to-white dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900 border-amber-200 dark:border-amber-500/30"
            : "bg-gradient-to-r from-rose-50 via-red-50/40 to-white dark:from-slate-900 dark:via-rose-950/20 dark:to-slate-900 border-rose-200 dark:border-rose-500/30"
        } space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <EligibilityBadge state={investigation.overallEligibility} />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                Mandatory Met: <strong className="text-slate-800 dark:text-slate-200">{investigation.hardRequirementsMet} / {investigation.totalMandatoryRequirements}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                Soft Match Score: <strong className="text-blue-600 dark:text-blue-400 font-mono">{investigation.suitabilityScore}/100</strong>
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                Audited: {new Date(investigation.lastRunAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-white/90 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
            {investigation.summary}
          </p>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            <strong>Evidence Rule:</strong> {investigation.providerDecisionDisclaimer}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No formal investigation audit has been recorded for your profile on this opportunity yet.
          </p>
          <button
            onClick={handleRunInvestigation}
            disabled={reRunning}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Evidence Audit Now</span>
          </button>
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
        {[
          { key: "audit", label: "Requirement-by-Requirement Audit" },
          { key: "overview", label: "Opportunity Overview" },
          { key: "sources", label: "Source Provenance" },
          { key: "actions", label: "Preparation & Roadmap" },
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

      {/* Tab 1: Detailed Requirement Audit Table */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ScanEye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Evidence Audit Table</span>
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Every condition is verified against your actual profile items and document text.
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Requirement</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Evidence Found</th>
                    <th className="py-3 px-3">Official Citation</th>
                    <th className="py-3 px-3">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {investigation?.findings?.map((f: any) => {
                    const statusConfig = {
                      SATISFIED: {
                        icon: CheckCircle2,
                        color: "text-emerald-500",
                        badge: <Badge variant="eligible">Satisfied</Badge>,
                      },
                      NEEDS_CONFIRMATION: {
                        icon: AlertTriangle,
                        color: "text-amber-500",
                        badge: <Badge variant="potential">Needs Confirmation</Badge>,
                      },
                      NO_EVIDENCE_FOUND: {
                        icon: HelpCircle,
                        color: "text-slate-400",
                        badge: <Badge variant="unknown">No Evidence Found</Badge>,
                      },
                      NOT_SATISFIED: {
                        icon: XCircle,
                        color: "text-rose-500",
                        badge: <Badge variant="ineligible">Not Satisfied</Badge>,
                      },
                      AMBIGUOUS_SOURCE: {
                        icon: HelpCircle,
                        color: "text-purple-500",
                        badge: <Badge variant="reported">Ambiguous Source</Badge>,
                      },
                    }[f.evaluationStatus as "SATISFIED" | "NEEDS_CONFIRMATION" | "NO_EVIDENCE_FOUND" | "NOT_SATISFIED" | "AMBIGUOUS_SOURCE"] || {
                      icon: HelpCircle,
                      color: "text-slate-400",
                      badge: <Badge variant="unknown">Unknown</Badge>,
                    };

                    return (
                      <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {statusConfig.badge}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200 min-w-[180px]">
                          {f.requirementText}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            f.isMandatory
                              ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {f.isMandatory ? "Mandatory Cutoff" : "Preferred"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 min-w-[200px]">
                          {f.evidenceFound ? (
                            <span className="text-slate-800 dark:text-slate-200">{f.evidenceFound}</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic">No concrete profile artifact found</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px] min-w-[180px]">
                          {f.sourceSnippet ? `"${f.sourceSnippet}"` : "Official Portal Listing"}
                        </td>
                        <td className="py-3.5 px-3 text-blue-600 dark:text-blue-400 min-w-[180px] font-medium">
                          {f.recommendedAction || <span className="text-slate-400 dark:text-slate-500">None required</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gap Analysis & Risk Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Identified Knowledge & Evidence Gaps</span>
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                {investigation?.gapAnalysis || "No critical evidence gaps detected."}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Process Risk Factors & Competition Reality</span>
              </h4>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                {riskFactors.map((rf: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Overview */}
      {activeTab === "overview" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-xs text-slate-700 dark:text-slate-300">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Role Overview & Scope</h3>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300 text-sm">
              {opportunity.roleDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Location & Arrangement</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{opportunity.location} ({opportunity.workArrangement})</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Compensation / Stipend</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{opportunity.stipendOrComp || "Unpublished"}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Duration</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{opportunity.duration || "Standard Internship"}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Application Deadline</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">
                {opportunity.applicationDeadline ? new Date(opportunity.applicationDeadline).toLocaleDateString() : "Rolling"}
              </span>
            </div>
          </div>

          {opportunity.applicationInstructions && (
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Official Application Instructions</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {opportunity.applicationInstructions}
              </p>
            </div>
          )}

          <div className="pt-2">
            <a
              href={opportunity.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm shadow-blue-600/20"
            >
              <span>Visit Official Listing Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Tab 3: Official Sources Provenance */}
      {activeTab === "sources" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Source Provenance</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strict audit trail of URLs and timestamps from which requirements were extracted.
            </p>
          </div>

          <div className="space-y-3">
            {opportunity.sources?.map((s: any) => (
              <div key={s.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{s.sourceName}</div>
                  <ProvenanceBadge trustLevel={s.trustLevel} />
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                  URL: <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{s.sourceUrl}</a>
                </div>
                {s.extractedSnippet && (
                  <div className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                    "{s.extractedSnippet}"
                  </div>
                )}
                <div className="text-[10px] text-slate-400 dark:text-slate-500">
                  Retrieved: {new Date(s.retrievedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Preparation & Roadmap Link */}
      {activeTab === "actions" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Tailored Preparation Roadmap</h3>
              <p className="text-slate-500 dark:text-slate-400">Step-by-step guidance engineered for {opportunity.organisation}.</p>
            </div>
            <Link
              href={`/preparation/${opportunity.id}`}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
            >
              <span>Open Preparation Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {recommendations.map((rec: string, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </AppClientLayout>
);
}
