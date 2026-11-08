"use client";

import React from "react";

interface OpportunityLogoProps {
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  glow?: boolean;
}

export function OpportunityLogo({
  iconOnly = false,
  size = "md",
  showTagline = true,
  className = "",
  glow = true,
}: OpportunityLogoProps) {
  // Dimensions based on size
  const iconDimensions = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  }[size];

  const textSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }[size];

  const taglineSize = {
    sm: "text-[10px]",
    md: "text-[11px]",
    lg: "text-xs",
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Scalable SVG Brand Mark */}
      <div className={`relative shrink-0 ${iconDimensions}`}>
        {/* Ambient subtle glow filter */}
        {glow && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 blur-[6px] opacity-40 dark:opacity-60 -z-10" />
        )}

        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            {/* Primary Brand Gradient */}
            <linearGradient id="oi-brand-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>

            {/* Accent Cyan Highlight */}
            <linearGradient id="oi-cyan-grad" x1="8" y1="20" x2="40" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Bridge Arch Gradient */}
            <linearGradient id="oi-arch-grad" x1="6" y1="36" x2="42" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.8" />
            </linearGradient>

            {/* Soft inner bevel glow */}
            <filter id="soft-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Background Rounded Shield / Tile */}
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="12"
            className="fill-slate-900/90 dark:fill-slate-950 stroke-slate-200/40 dark:stroke-slate-800/80"
            strokeWidth="1.2"
          />

          {/* Subtle geometric grid backdrop */}
          <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" className="text-blue-500/20 dark:text-blue-400/20" />

          {/* Left Pillar (Student / Side A) */}
          <rect x="10" y="22" width="3.5" height="15" rx="1.75" fill="url(#oi-brand-grad)" />

          {/* Right Pillar (Opportunity / Side B) */}
          <rect x="34.5" y="22" width="3.5" height="15" rx="1.75" fill="url(#oi-brand-grad)" />

          {/* Connecting Bridge Arch: Represents "Bridge the Gap" */}
          <path
            d="M 11.5 24 C 14 16, 34 16, 36.5 24"
            stroke="url(#oi-arch-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Central Upward Diamond / Intelligence Node at the Bridge Apex */}
          <path
            d="M 24 10 L 28 16 L 24 22 L 20 16 Z"
            fill="url(#oi-cyan-grad)"
            filter="url(#soft-glow)"
          />

          {/* Central Intelligence Core Spark */}
          <circle cx="24" cy="16" r="2.2" fill="#FFFFFF" />

          {/* Grounding Horizon Line */}
          <path
            d="M 12 37 L 36 37"
            stroke="url(#oi-brand-grad)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
        </svg>
      </div>

      {/* Wordmark and Tagline */}
      {!iconOnly && (
        <div className="flex flex-col min-w-0">
          <div className={`font-extrabold tracking-tight leading-tight ${textSize}`}>
            <span className="text-slate-900 dark:text-white">Opportunity</span>{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">
              Intelligence
            </span>
          </div>

          {showTagline && (
            <div className={`flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400 tracking-wide mt-0.5 ${taglineSize}`}>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Bridge the Gap</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>NSUT</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
