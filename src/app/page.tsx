"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OpportunityLogo } from "@/components/brand/OpportunityLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Lock,
  Layers,
  Search,
  BookOpen,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function LandingPage() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [authError, setAuthError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    institution: "NSUT Delhi",
    graduationYear: 2026,
  });

  const handleDemoLogin = async () => {
    setLoadingDemo(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/demo-login", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setAuthError(data.error || "Failed to log in as demo student. Please ensure seeding is complete.");
      }
    } catch {
      setAuthError("Network error during demo login");
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = authModal === "register" ? "/api/auth/register" : "/api/auth/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch {
      setAuthError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white transition-colors duration-150">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <OpportunityLogo size="sm" showTagline={true} />
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle variant="compact" />

            <button
              type="button"
              onClick={() => {
                setAuthError("");
                setAuthModal("login");
              }}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loadingDemo}
              className="text-xs font-semibold px-3.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <span>{loadingDemo ? "Loading..." : "Launch Demo"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Devlympics 2026 • Theme: Bridge the Gap</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          Discover the right opportunity.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400">
            Understand your chances.
          </span>{" "}
          Prepare with purpose.
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The persistent, evidence-backed student opportunity system. We independently investigate published eligibility, audit your verified accomplishments against employer cutoffs, and engineer tailored preparation roadmaps.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loadingDemo}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <span>Launch Live Demo (Priya Sharma, NSUT &apos;26)</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthError("");
              setAuthModal("register");
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-sm transition-all shadow-xs"
          >
            Create Student Account
          </button>
        </div>

        {/* Bridge The Gap Concept Graphic */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl text-left">
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold mb-4">
            How We Bridge The Gap
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Side A */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Side A</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 mb-2">The Student</h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <li className="flex items-center gap-1.5">• Actual academic performance & graduating batch</li>
                  <li className="flex items-center gap-1.5">• Verified code repositories & live projects</li>
                  <li className="flex items-center gap-1.5">• Distinguishes verified vs self-reported</li>
                  <li className="flex items-center gap-1.5">• Clear evidence notes & document vault</li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                Confirmed Student Profile
              </div>
            </div>

            {/* The Bridge */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-500/30 flex flex-col justify-between relative shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">The Bridge</span>
                  <Badge variant="official">Evidence Agent</Badge>
                </div>
                <h3 className="text-base font-bold text-blue-950 dark:text-blue-200 mt-1 mb-2">Investigation Engine</h3>
                <ul className="text-xs text-blue-900/80 dark:text-blue-200/80 space-y-1.5 font-medium">
                  <li className="flex items-center gap-1.5">✓ Strict deterministic hard-cutoff evaluation</li>
                  <li className="flex items-center gap-1.5">✓ Requirement-by-requirement audit table</li>
                  <li className="flex items-center gap-1.5">✓ Identifies missing evidence vs failed rules</li>
                  <li className="flex items-center gap-1.5">✓ Selection stages & practice drill synthesis</li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800/40 text-[11px] text-blue-700 dark:text-blue-300 font-bold flex items-center justify-between">
                <span>Transparent Audit Report</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>

            {/* Side B */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Side B</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 mb-2">The Opportunity</h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <li className="flex items-center gap-1.5">• Official employer portal listings</li>
                  <li className="flex items-center gap-1.5">• Government scholarships & fellowships</li>
                  <li className="flex items-center gap-1.5">• Published graduating batch cutoffs</li>
                  <li className="flex items-center gap-1.5">• Mandatory vs preferred qualifications</li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Vetted Opportunity Sources
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sample Investigation Carousel / Preview */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <Badge variant="primary">Sample Investigation Findings</Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-3">
            Real Evidence. Zero Unsupported Claims.
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2">
            See how the engine treats different candidate scenarios with strict honesty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Appears Eligible */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/30 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Google India</span>
                <Badge variant="eligible" dot>Appears Eligible</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                Software Engineering Intern 2026
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Student Priya Sharma satisfies graduation batch (2026), CGPA cutoff (8.65 vs 7.50), and demonstrated DSA mastery with 450+ solved problems.
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                <div className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 4 of 4 Mandatory Criteria Met
                </div>
                <div>Source: Google Careers Official Portal</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            >
              Inspect Audit Table →
            </button>
          </div>

          {/* Card 2: Potentially Eligible / Missing Evidence */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/30 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Microsoft R&D</span>
                <Badge variant="potential" dot>Potentially Eligible</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                Cloud Software Engineer Intern
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Eligible on graduation batch and CGPA, but published listing strictly mandates hands-on Docker containerization, which is only self-reported without repo proof.
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                <div className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> 1 Evidence Gap Detected
                </div>
                <div>Action: Add Dockerfile to public repository</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            >
              View Gap Action Plan →
            </button>
          </div>

          {/* Card 3: Likely Ineligible / Mandatory Unmet */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-500/30 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Amazon Jobs</span>
                <Badge variant="ineligible" dot>Likely Ineligible</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                SDE-1 Full-Time (Immediate Start)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Hard administrative cutoff: Role requires degree completion by May 2025. Priya is batch of 2026 and cannot fulfill immediate start requirements.
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                <div className="text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Published Hard Cutoff Failed
                </div>
                <div>Advice: Target Amazon Summer 2026 Intern instead</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            >
              Analyze Batch Rules →
            </button>
          </div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-slate-200 dark:border-slate-800/80">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center mb-8">
          Architected on Strict Trust & Verification Principles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-blue-600 dark:text-blue-400 font-bold mb-1">1. Evidence Before Claims</div>
            Self-reported skills are visibly labeled and never confused with verified repository code or test scores.
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-blue-600 dark:text-blue-400 font-bold mb-1">2. No Fabricated Data</div>
            Zero simulated job postings or synthetic rejection reasons. All demo items are explicitly marked as seed data.
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-blue-600 dark:text-blue-400 font-bold mb-1">3. User Confirmation First</div>
            Parsed résumé information requires explicit user review and confirmation before it updates the student profile.
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-blue-600 dark:text-blue-400 font-bold mb-1">4. Privacy & Access Control</div>
            Uploaded documents are stored privately outside public folders with server-side ownership checks.
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {authModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setAuthModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              {authModal === "register" ? "Create Student Account" : "Sign In to Your Workspace"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {authModal === "register"
                ? "Enter your details to track applications and run investigations."
                : "Sign in with your registered email and password."}
            </p>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs mb-3 font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
              {authModal === "register" && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rohan Mehta"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@nsut.ac.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm hover:shadow-blue-500/20 transition-all mt-4"
              >
                {authModal === "register" ? "Create Account" : "Sign In"}
              </button>
            </form>

            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => setAuthModal(authModal === "register" ? "login" : "register")}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {authModal === "register" ? "Already have an account? Sign in" : "Need an account? Register"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 py-8 px-6 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <OpportunityLogo size="sm" showTagline={true} />
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <span>Devlympics 2026</span>
            <span>•</span>
            <span>Evidence-Based Guidance</span>
            <span>•</span>
            <span>Private Storage Vault</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
