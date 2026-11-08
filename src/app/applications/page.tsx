"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppClientLayout } from "@/components/layout/AppClientLayout";
import { Badge } from "@/components/ui/Badge";
import {
  KanbanSquare,
  List,
  Calendar,
  Building2,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  ArrowRight,
} from "lucide-react";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [toast, setToast] = useState<string | null>(null);

  // Outcome recording modal state
  const [feedbackModalApp, setFeedbackModalApp] = useState<any | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    outcome: "REJECTED",
    feedbackReceived: false,
    feedbackSource: "EMPLOYER_EMAIL",
    feedbackText: "",
    improvementAreas: "",
    isEvidenceBacked: false,
  });

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setToast(`Status updated to ${newStatus}`);
        setTimeout(() => setToast(null), 2500);
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalApp) return;

    const improvementArray = feedbackForm.improvementAreas
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/applications/${feedbackModalApp.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome: feedbackForm.outcome,
          feedbackReceived: feedbackForm.feedbackReceived,
          feedbackSource: feedbackForm.feedbackSource,
          feedbackText: feedbackForm.feedbackText,
          statedImprovementAreas: improvementArray,
          isEvidenceBacked: feedbackForm.feedbackReceived && feedbackForm.isEvidenceBacked,
        }),
      });

      if (res.ok) {
        setToast("Outcome and feedback recorded with evidence validation!");
        setTimeout(() => setToast(null), 3000);
        setFeedbackModalApp(null);
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const kanbanColumns = [
    { title: "Saved / Preparing", statuses: ["INTERESTED", "SAVED", "PREPARING"] },
    { title: "Applied", statuses: ["APPLIED"] },
    { title: "Assessments", statuses: ["ASSESSMENT_SCHEDULED"] },
    { title: "Interviews", statuses: ["INTERVIEW_SCHEDULED", "AWAITING_RESULT"] },
    { title: "Outcomes", statuses: ["OFFER_RECEIVED", "REJECTED", "WITHDRAWN"] },
  ];

  return (
    <AppClientLayout>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <KanbanSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Application Tracker</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Manage your opportunities across each hiring stage. Track interview dates, audit history, and verified feedback.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start shadow-xs">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === "kanban" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <KanbanSquare className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === "table" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-mono text-xs">
          Loading application pipelines...
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No applications saved yet. Visit the Discovery workspace to track an opportunity.
          </p>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
          >
            <span>Discover Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const colApps = applications.filter((a) => col.statuses.includes(a.currentStatus));
            return (
              <div key={col.title} className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {col.title}
                  </h4>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[250px]">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2.5 text-xs shadow-sm"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{app.organisation}</span>
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-0.5 line-clamp-1">{app.targetRole}</h5>
                      </div>

                      {/* Status Selector */}
                      <div>
                        <select
                          value={app.currentStatus}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-[11px] focus:outline-none focus:border-blue-500"
                        >
                          <option value="SAVED">Saved</option>
                          <option value="PREPARING">Preparing</option>
                          <option value="APPLIED">Applied</option>
                          <option value="ASSESSMENT_SCHEDULED">Assessment Scheduled</option>
                          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                          <option value="AWAITING_RESULT">Awaiting Result</option>
                          <option value="OFFER_RECEIVED">Offer Received</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="WITHDRAWN">Withdrawn</option>
                        </select>
                      </div>

                      {app.notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                          {app.notes}
                        </p>
                      )}

                      {/* Outcome / Feedback Banner if present */}
                      {app.feedback && (
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className={app.feedback.outcome === "OFFER" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                              Outcome: {app.feedback.outcome}
                            </span>
                            {app.feedback.feedbackReceived && (
                              <Badge variant="official">Verified Feedback</Badge>
                            )}
                          </div>
                          {app.feedback.feedbackText && (
                            <div className="text-slate-600 dark:text-slate-400 italic line-clamp-2">
                              "{app.feedback.feedbackText}"
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900 text-[11px]">
                        <button
                          onClick={() => {
                            setFeedbackModalApp(app);
                            setFeedbackForm({
                              outcome: app.currentStatus === "OFFER_RECEIVED" ? "OFFER" : "REJECTED",
                              feedbackReceived: app.feedback?.feedbackReceived || false,
                              feedbackSource: app.feedback?.feedbackSource || "EMPLOYER_EMAIL",
                              feedbackText: app.feedback?.feedbackText || "",
                              improvementAreas: "",
                              isEvidenceBacked: app.feedback?.isEvidenceBacked || false,
                            });
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Record Outcome
                        </button>

                        <Link
                          href={`/preparation/${app.opportunityId}`}
                          className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                          title="Prep Roadmap"
                        >
                          Prep →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-3">Role & Organisation</th>
                <th className="py-3 px-3">Current Status</th>
                <th className="py-3 px-3">Applied Date</th>
                <th className="py-3 px-3">Deadline</th>
                <th className="py-3 px-3">Notes & Feedback</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{app.targetRole}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{app.organisation}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <select
                      value={app.currentStatus}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="SAVED">Saved</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="APPLIED">Applied</option>
                      <option value="ASSESSMENT_SCHEDULED">Assessment Scheduled</option>
                      <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                      <option value="OFFER_RECEIVED">Offer Received</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "Not applied yet"}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {app.deadline ? new Date(app.deadline).toLocaleDateString() : "Rolling"}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                    {app.feedback ? `Outcome: ${app.feedback.outcome}` : app.notes || "—"}
                  </td>
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => {
                        setFeedbackModalApp(app);
                        setFeedbackForm({
                          outcome: app.currentStatus === "OFFER_RECEIVED" ? "OFFER" : "REJECTED",
                          feedbackReceived: app.feedback?.feedbackReceived || false,
                          feedbackSource: app.feedback?.feedbackSource || "EMPLOYER_EMAIL",
                          feedbackText: app.feedback?.feedbackText || "",
                          improvementAreas: "",
                          isEvidenceBacked: app.feedback?.isEvidenceBacked || false,
                        });
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Record Feedback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Outcome & Rejection Feedback Modal */}
      {feedbackModalApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Record Outcome & Feedback
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {feedbackModalApp.targetRole} • {feedbackModalApp.organisation}
              </p>
            </div>

            <form onSubmit={handleRecordFeedbackSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Final Result / Outcome</label>
                <select
                  value={feedbackForm.outcome}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, outcome: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="OFFER">Offer Received 🎉</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WAITLISTED">Waitlisted</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                  <option value="NO_RESPONSE">No Response / Ghosted</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedbackForm.feedbackReceived}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        feedbackReceived: e.target.checked,
                        isEvidenceBacked: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Did you receive actual, documented feedback from the employer?
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Strict Rule: If no reason was given, select unchecked. The system will never invent speculative rejection reasons.
                </p>
              </div>

              {feedbackForm.feedbackReceived && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Feedback Source</label>
                    <select
                      value={feedbackForm.feedbackSource}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, feedbackSource: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="EMPLOYER_EMAIL">Official Recruiter Email</option>
                      <option value="PORTAL_MESSAGE">Application Portal Message</option>
                      <option value="INTERVIEWER_NOTES">Verbal Interviewer Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Exact Stated Feedback Text
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackForm.feedbackText}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, feedbackText: e.target.value })}
                      placeholder="e.g. Good DSA speed, but struggled to explain database sharding under load..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Stated Improvement Areas (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={feedbackForm.improvementAreas}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, improvementAreas: e.target.value })}
                      placeholder="e.g. System Design Depth, Caching Policies"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFeedbackModalApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/20"
                >
                  Save Outcome & Analysis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </AppClientLayout>
);
}
