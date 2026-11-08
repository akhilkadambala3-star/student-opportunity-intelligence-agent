import React from "react";

export type BadgeVariant =
  | "eligible"
  | "potential"
  | "ineligible"
  | "unknown"
  | "official"
  | "reported"
  | "inferred"
  | "primary"
  | "secondary";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = "secondary", children, className = "", dot = false }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dotColor: string }> = {
    eligible: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-400 font-semibold",
      border: "border-emerald-200 dark:border-emerald-500/30",
      dotColor: "bg-emerald-500 dark:bg-emerald-400",
    },
    potential: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      text: "text-amber-800 dark:text-amber-300 font-semibold",
      border: "border-amber-200 dark:border-amber-500/30",
      dotColor: "bg-amber-500 dark:bg-amber-400",
    },
    ineligible: {
      bg: "bg-rose-50 dark:bg-rose-500/10",
      text: "text-rose-700 dark:text-rose-400 font-semibold",
      border: "border-rose-200 dark:border-rose-500/30",
      dotColor: "bg-rose-500 dark:bg-rose-400",
    },
    unknown: {
      bg: "bg-slate-100 dark:bg-slate-800/60",
      text: "text-slate-600 dark:text-slate-400",
      border: "border-slate-200 dark:border-slate-700/60",
      dotColor: "bg-slate-400 dark:bg-slate-500",
    },
    official: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      text: "text-blue-700 dark:text-blue-400 font-semibold",
      border: "border-blue-200 dark:border-blue-500/30",
      dotColor: "bg-blue-500 dark:bg-blue-400",
    },
    reported: {
      bg: "bg-purple-50 dark:bg-purple-500/10",
      text: "text-purple-700 dark:text-purple-400 font-semibold",
      border: "border-purple-200 dark:border-purple-500/30",
      dotColor: "bg-purple-500 dark:bg-purple-400",
    },
    inferred: {
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
      text: "text-cyan-800 dark:text-cyan-400 font-semibold",
      border: "border-cyan-200 dark:border-cyan-500/30",
      dotColor: "bg-cyan-500 dark:bg-cyan-400",
    },
    primary: {
      bg: "bg-indigo-50 dark:bg-indigo-600/20",
      text: "text-indigo-700 dark:text-indigo-300 font-semibold",
      border: "border-indigo-200 dark:border-indigo-500/30",
      dotColor: "bg-indigo-500 dark:bg-indigo-400",
    },
    secondary: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-700",
      dotColor: "bg-slate-400",
    },
  };

  const style = variantStyles[variant] || variantStyles.secondary;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />}
      {children}
    </span>
  );
}

export function EligibilityBadge({ state }: { state: string }) {
  switch (state) {
    case "CONFIRMED_ELIGIBLE":
    case "APPEARS_ELIGIBLE":
      return <Badge variant="eligible" dot>Appears Eligible</Badge>;
    case "POTENTIALLY_ELIGIBLE":
      return <Badge variant="potential" dot>Potentially Eligible</Badge>;
    case "LIKELY_INELIGIBLE":
      return <Badge variant="ineligible" dot>Likely Ineligible</Badge>;
    default:
      return <Badge variant="unknown" dot>Info Missing</Badge>;
  }
}

export function ProvenanceBadge({ trustLevel }: { trustLevel: string }) {
  switch (trustLevel) {
    case "OFFICIAL_VERIFIED":
    case "OFFICIAL_CAREER_PORTAL":
    case "GOVT_PORTAL":
      return <Badge variant="official">Official Source Verified</Badge>;
    case "DETAILS_CHECKED":
      return <Badge variant="primary">Details Checked</Badge>;
    case "CANDIDATE_REPORTED":
      return <Badge variant="reported">Candidate Reported</Badge>;
    default:
      return <Badge variant="inferred">AI Inferred / Unverified</Badge>;
  }
}
