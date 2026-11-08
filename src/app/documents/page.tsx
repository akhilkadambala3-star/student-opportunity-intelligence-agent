"use client";

import React, { useState, useEffect } from "react";
import { AppClientLayout } from "@/components/layout/AppClientLayout";
import { Badge } from "@/components/ui/Badge";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileCheck2,
} from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Review confirmation modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeDocForReview, setActiveDocForReview] = useState<any>(null);
  const [reviewDraft, setReviewDraft] = useState<any>({
    displayName: "",
    institution: "",
    degree: "",
    branch: "",
    graduationYear: 2026,
    cgpa: 8.5,
    location: "",
    confirmedSkills: [] as string[],
    confirmedProjects: [] as any[],
  });

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("fileType", "RESUME");

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({
          text: "Document uploaded to private storage & parsed! Please review the extracted data before confirming.",
          type: "success",
        });
        fetchDocuments();

        // Open confirmation review modal
        if (data.extractedData) {
          setActiveDocForReview(data.document);
          setReviewDraft({
            displayName: data.extractedData.displayName || "",
            institution: data.extractedData.institution || "",
            degree: data.extractedData.degree || "",
            branch: data.extractedData.branch || "",
            graduationYear: data.extractedData.graduationYear || 2026,
            cgpa: data.extractedData.cgpa || 8.5,
            location: data.extractedData.location || "",
            confirmedSkills: data.extractedData.skills?.map((s: any) => s.name) || [],
            confirmedProjects: data.extractedData.projects || [],
          });
          setReviewModalOpen(true);
        }
      } else {
        setMessage({ text: data.error || "Upload failed", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error during upload", type: "error" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleConfirmExtraction = async () => {
    if (!activeDocForReview) return;

    try {
      const res = await fetch(`/api/documents/${activeDocForReview.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewDraft),
      });

      if (res.ok) {
        setMessage({
          text: "Extracted credentials confirmed and applied to your profile!",
          type: "success",
        });
        setReviewModalOpen(false);
        fetchDocuments();
      } else {
        setMessage({ text: "Failed to confirm document extraction", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error during confirmation", type: "error" });
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to securely delete this document?")) return;

    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ text: "Document removed securely", type: "success" });
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openExistingReview = (doc: any) => {
    try {
      const parsed = doc.extractedDataJson ? JSON.parse(doc.extractedDataJson) : {};
      setActiveDocForReview(doc);
      setReviewDraft({
        displayName: parsed.displayName || "",
        institution: parsed.institution || "",
        degree: parsed.degree || "",
        branch: parsed.branch || "",
        graduationYear: parsed.graduationYear || 2026,
        cgpa: parsed.cgpa || 8.5,
        location: parsed.location || "",
        confirmedSkills: parsed.skills?.map((s: any) => s.name) || [],
        confirmedProjects: parsed.projects || [],
      });
      setReviewModalOpen(true);
    } catch {
      alert("No structured data associated with this document.");
    }
  };

  return (
    <AppClientLayout>
      <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Document Vault & Evidence Extraction</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Secure private document storage. Uploaded files are parsed into structured evidence drafts requiring your explicit confirmation.
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
              : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500/40 shadow-xs transition-all text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm">
            Upload Résumé, Transcript, or Certificate
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Supports PDF, DOCX, TXT. Files are saved in private isolated server storage and parsed by our extraction engine.
          </p>
        </div>

        <div className="pt-2">
          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm shadow-blue-600/25 cursor-pointer transition-all">
            <span>{uploading ? "Extracting Credentials..." : "Select File to Upload"}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Private Disk Storage
          </span>
          <span>•</span>
          <span>Explicit Confirmation Step</span>
          <span>•</span>
          <span>Max size: 10MB</span>
        </div>
      </div>

      {/* Document Records List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Stored Documents ({documents.length})</span>
        </h3>

        {loading ? (
          <div className="text-xs text-slate-500 py-6 text-center font-mono">
            Loading document records...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 shadow-xs">
            No documents uploaded yet. Upload your PDF résumé above to extract skills and project evidence.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {(doc.fileSize / 1024).toFixed(1)} KB • {doc.fileType}
                    </span>
                    {doc.isConfirmed ? (
                      <Badge variant="official" dot>Confirmed by User</Badge>
                    ) : (
                      <Badge variant="potential" dot>Pending Review</Badge>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">
                    {doc.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                    {doc.extractedText || "No text extracted"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => openExistingReview(doc)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Extracted Data</span>
                  </button>

                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 p-1 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extraction Review & Confirmation Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Review & Confirm Extracted Information</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Confirm the accuracy of extracted fields before applying them to your student profile.
                </p>
              </div>
              <Badge variant="potential">Mandatory Confirmation</Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={reviewDraft.displayName}
                    onChange={(e) => setReviewDraft({ ...reviewDraft, displayName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Institution</label>
                  <input
                    type="text"
                    value={reviewDraft.institution}
                    onChange={(e) => setReviewDraft({ ...reviewDraft, institution: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={reviewDraft.graduationYear}
                    onChange={(e) => setReviewDraft({ ...reviewDraft, graduationYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={reviewDraft.cgpa}
                    onChange={(e) => setReviewDraft({ ...reviewDraft, cgpa: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Extracted Skills to Confirm */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                  Extracted Skills (Click to toggle confirmation)
                </label>
                <div className="flex flex-wrap gap-2">
                  {reviewDraft.confirmedSkills?.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 font-medium text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Extracted Projects */}
              {reviewDraft.confirmedProjects?.length > 0 && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1.5">
                    Extracted Projects
                  </label>
                  <div className="space-y-2">
                    {reviewDraft.confirmedProjects.map((p: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <div className="font-bold text-slate-900 dark:text-slate-200">{p.title}</div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{p.description}</div>
                        <div className="text-blue-600 dark:text-blue-400 text-[10px] mt-1 font-mono">
                          Tech: {Array.isArray(p.technologies) ? p.technologies.join(", ") : p.technologies}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Confirmed items will be tagged as verified with source provenance.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExtraction}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/20 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Apply to Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </AppClientLayout>
);
}
