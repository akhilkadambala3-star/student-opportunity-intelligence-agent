"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, Theme } from "./ThemeProvider";
import { Sun, Moon, Laptop, Check } from "lucide-react";

interface ThemeToggleProps {
  variant?: "compact" | "segmented" | "cards";
  className?: string;
}

export function ThemeToggle({ variant = "compact", className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. CARDS VARIANT (Ideal for Settings Page)
  if (variant === "cards") {
    const options: { id: Theme; title: string; desc: string; icon: any }[] = [
      {
        id: "dark",
        title: "Dark Mode",
        desc: "Deep navy and slate palette with high-contrast glowing accents",
        icon: Moon,
      },
      {
        id: "light",
        title: "Light Mode",
        desc: "Clean crisp paper aesthetic with subtle borders and vivid cobalt",
        icon: Sun,
      },
      {
        id: "system",
        title: "System Preference",
        desc: "Automatically synchronize with your operating system appearance",
        icon: Laptop,
      },
    ];

    return (
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3.5 ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? "bg-blue-500/10 border-blue-500/50 shadow-md shadow-blue-500/10 dark:bg-blue-500/15"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-blue-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>

              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
                  {opt.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {opt.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. SEGMENTED CONTROL VARIANT
  if (variant === "segmented") {
    return (
      <div className={`inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            theme === "light"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
          title="Light theme"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            theme === "dark"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
          title="Dark theme"
        >
          <Moon className="w-3.5 h-3.5 text-blue-400" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            theme === "system"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
          title="System preference"
        >
          <Laptop className="w-3.5 h-3.5 text-slate-400" />
          <span>System</span>
        </button>
      </div>
    );
  }

  // 3. COMPACT DROPDOWN VARIANT (Default for Header/Navbar)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-center relative"
        title={`Current theme: ${theme} (${resolvedTheme})`}
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-blue-400 transition-transform duration-200" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200" />
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            Appearance
          </div>
          <button
            type="button"
            onClick={() => {
              setTheme("light");
              setDropdownOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              theme === "light"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light Mode</span>
            </span>
            {theme === "light" && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("dark");
              setDropdownOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              theme === "dark"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span>Dark Mode</span>
            </span>
            {theme === "dark" && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("system");
              setDropdownOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              theme === "system"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-slate-400" />
              <span>System</span>
            </span>
            {theme === "system" && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
