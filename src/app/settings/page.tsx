"use client";

import React, { useState, useEffect } from "react";
import { AppClientLayout } from "@/components/layout/AppClientLayout";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  Settings,
  Cpu,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  Palette,
} from "lucide-react";

export default function SettingsPage() {
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.aiStatus) setAiStatus(data.aiStatus);
      })
      .catch(() => {});
  }, []);

  const handleReSeed = async () => {
    setSeeding(true);
    setMessage(null);

    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          text: "Demo data successfully re-seeded! All opportunities, profiles, and pipelines are reset to baseline.",
          type: "success",
        });
      } else {
        setMessage({ text: data.error || "Failed to reset demo data", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error during seeding", type: "error" });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AppClientLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Workspace & System Settings</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure theme aesthetics, inspect AI intelligence engines, reset demo data, and audit document security.
          </p>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
              message.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* 1. APPEARANCE & THEME SECTION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Appearance & Color Theme</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Choose between Dark Mode, Light Mode, or automatic System Preference
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Persistent Theme
            </span>
          </div>

          <div className="pt-1">
            <ThemeToggle variant="cards" />
          </div>
        </div>

        {/* 2. AI PROVIDER SECTION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>AI Provider & Verification Engine</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Server-side provider-independent intelligence architecture
              </span>
            </div>
            {aiStatus?.isConfigured ? (
              <Badge variant="official">Gemini 1.5 Live</Badge>
            ) : (
              <Badge variant="potential">Demo Engine Active</Badge>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Current Provider:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                {aiStatus?.provider || "DEMO_DETERMINISTIC"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Model Identifier:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {aiStatus?.modelName || "deterministic-rule-engine-v1"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">API Key Configured:</span>
              <span className="font-semibold">
                {aiStatus?.isConfigured ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live GEMINI_API_KEY Active
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> No API Key (Deterministic Fallback)
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
            <p>
              <strong>Configuration:</strong> To enable live Google Gemini generation, define <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200">GEMINI_API_KEY</code> in your environment file.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              When unset, the application automatically uses the deterministic evaluation engine with zero loss of core functionality. Hard eligibility rules are always evaluated deterministically.
            </p>
          </div>
        </div>

        {/* 3. PRIVACY & SECURITY AUDIT */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Privacy & Document Vault Isolation</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Guarantees regarding student files and data storage
              </span>
            </div>
            <Badge variant="official">Verified Secure</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Private Storage Disk</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Uploaded résumés are written to <code className="text-blue-600 dark:text-blue-400 font-mono">storage/documents/</code> outside public web directories.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">HTTP-Only Sessions</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Authentication tokens are isolated in HTTP-only, SameSite cookies inaccessible to malicious client scripts.
              </p>
            </div>
          </div>
        </div>

        {/* 4. DEMO DATA RESET SECTION */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Demo Data Management</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Reset or restore the realistic NSUT student opportunity dataset
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Demo Tools
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Re-seeding resets the SQLite database to the verified hackathon baseline. It reinstates demo candidate Priya Sharma (NSUT CSE &apos;26) and 4 realistic opportunities with their exact deterministic states.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleReSeed}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-sm hover:shadow-blue-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? "animate-spin" : ""}`} />
              <span>{seeding ? "Resetting Database..." : "Reset Database to Demo Baseline"}</span>
            </button>
          </div>
        </div>
      </div>
    </AppClientLayout>
  );
}
