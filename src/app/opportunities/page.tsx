"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppClientLayout } from "@/components/layout/AppClientLayout";
import { EligibilityBadge, ProvenanceBadge } from "@/components/ui/Badge";
import {
  Compass,
  Search,
  Filter,
  Sparkles,
  Calendar,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
} from "lucide-react";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedArrangement, setSelectedArrangement] = useState("ALL");
  const [selectedEligibility, setSelectedEligibility] = useState("ALL");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (selectedArrangement !== "ALL") params.append("workArrangement", selectedArrangement);
      if (selectedEligibility !== "ALL") params.append("eligibility", selectedEligibility);

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      if (data.opportunities) {
        setOpportunities(data.opportunities);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedCategory, selectedArrangement, selectedEligibility]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const handleSaveToTracker = async (opportunityId: string) => {
    setSavingId(opportunityId);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, initialStatus: "SAVED" }),
      });
      if (res.ok) {
        setToast("Added to your Application Tracker!");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AppClientLayout>
      <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Compass className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Opportunity Discovery Agent</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Explore curated opportunities with transparent, evidence-backed eligibility audits. Hard cutoffs are never overridden by soft match scores.
        </p>
      </div>

      {toast && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by role, company, required skill (e.g. Google, Docker, DSA)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 transition-all shrink-0"
          >
            Search
          </button>
        </form>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          {["ALL", "INTERNSHIP", "FULL_TIME", "FELLOWSHIP", "HACKATHON"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat.replace("_", " ")}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Audit Filter:</span>
          {["ALL", "APPEARS_ELIGIBLE", "POTENTIALLY_ELIGIBLE", "LIKELY_INELIGIBLE"].map((el) => (
            <button
              key={el}
              onClick={() => setSelectedEligibility(el)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedEligibility === el
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {el === "ALL"
                ? "All States"
                : el === "APPEARS_ELIGIBLE"
                ? "Eligible"
                : el === "POTENTIALLY_ELIGIBLE"
                ? "Missing Info"
                : "Ineligible"}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunity Listings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Found {opportunities.length} opportunities</span>
          <span>Sorted by application deadline</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            Evaluating opportunities against student evidence...
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm">
            No opportunities match your filter criteria. Try clearing search filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {opportunities.map((opp) => {
              let reqSkills: string[] = [];
              try {
                reqSkills = JSON.parse(opp.requiredSkills);
              } catch {}

              let prefSkills: string[] = [];
              try {
                prefSkills = opp.preferredSkills ? JSON.parse(opp.preferredSkills) : [];
              } catch {}

              const daysUntil = opp.applicationDeadline
                ? Math.ceil((new Date(opp.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div
                  key={opp.id}
                  className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border flex flex-col justify-between transition-all shadow-sm ${
                    opp.eligibilityState === "APPEARS_ELIGIBLE"
                      ? "border-emerald-300 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-500/50"
                      : opp.eligibilityState === "POTENTIALLY_ELIGIBLE"
                      ? "border-amber-300 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/50"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Org, Provenance Badge, Eligibility Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{opp.organisation}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {opp.title}
                        </h3>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <EligibilityBadge state={opp.eligibilityState} />
                        <ProvenanceBadge trustLevel={opp.sourceVerificationStatus} />
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span>{opp.location} ({opp.workArrangement})</span>
                      </span>
                      {opp.stipendOrComp && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                          • {opp.stipendOrComp}
                        </span>
                      )}
                      {daysUntil !== null && (
                        <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                          <Clock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                          <span>{daysUntil > 0 ? `${daysUntil} days left` : "Expired"}</span>
                        </span>
                      )}
                    </div>

                    {/* Transparent Match Rationale Callout */}
                    <div
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        opp.eligibilityState === "APPEARS_ELIGIBLE"
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                          : opp.eligibilityState === "POTENTIALLY_ELIGIBLE"
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300"
                          : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300"
                      }`}
                    >
                      <strong className="block text-[11px] uppercase tracking-wider mb-0.5 font-bold">
                        Eligibility Analysis:
                      </strong>
                      <span>{opp.matchRationale}</span>
                    </div>

                    {/* Required Skills */}
                    <div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">Stated Technical Requirements:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {reqSkills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-medium bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <button
                      onClick={() => handleSaveToTracker(opp.id)}
                      disabled={savingId === opp.id}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{savingId === opp.id ? "Saving..." : "Save to Tracker"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/preparation/${opp.id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        Prep Plan
                      </Link>

                      <Link
                        href={`/investigation/${opp.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Launch Audit</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </AppClientLayout>
);
}
