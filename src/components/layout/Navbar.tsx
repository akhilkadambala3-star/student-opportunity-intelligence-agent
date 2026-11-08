"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  Bell,
  Cpu,
  CheckCircle2,
  AlertCircle,
  X,
  Menu,
  ShieldCheck,
} from "lucide-react";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    isDemo: boolean;
  } | null;
  aiStatus?: {
    isConfigured: boolean;
    provider: string;
    modelName: string;
    statusMessage: string;
  } | null;
  onOpenMobileSidebar?: () => void;
}

export function Navbar({ user, aiStatus, onOpenMobileSidebar }: NavbarProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (user) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.notifications) setNotifications(data.notifications);
        })
        .catch(() => {});
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-150">
      {/* Left: Mobile hamburger & Context Header */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5 stroke-[1.8]" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Opportunity Intelligence Workspace
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/50">
              NSUT Edition
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:inline">
            Evidence-backed gap investigation & preparation
          </span>
        </div>
      </div>

      {/* Right Actions: AI Provider Pill, Theme Switcher, Notifications, User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Provider Status Pill */}
        <button
          type="button"
          onClick={() => setShowAiModal(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            aiStatus?.isConfigured
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
              : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/40"
          }`}
          title="Click to view AI Engine status"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">
            {aiStatus?.isConfigured ? "Gemini 1.5 Live" : "Demo Engine"}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
        </button>

        {/* Theme Switcher */}
        <ThemeToggle variant="compact" />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 transition-colors relative"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
                  Notifications ({unreadCount} new)
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.linkUrl || "#"}
                      onClick={() => setShowNotifications(false)}
                      className={`block p-2.5 rounded-xl border text-xs transition-colors ${
                        n.isRead
                          ? "bg-slate-50 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/60 text-slate-600 dark:text-slate-400"
                          : "bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-slate-900 dark:text-slate-200"
                      }`}
                    >
                      <div className="font-semibold mb-0.5 text-slate-900 dark:text-slate-200">
                        {n.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {n.message}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs hover:ring-2 hover:ring-blue-500 transition-all"
          title="My Profile"
        >
          {user?.name ? user.name[0].toUpperCase() : "P"}
        </Link>
      </div>

      {/* AI Status Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Intelligence & Verification Engine
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Deterministic audit + optional AI analysis
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Provider:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">
                    {aiStatus?.provider || "DEMO_DETERMINISTIC"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Model Engine:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                    {aiStatus?.modelName || "deterministic-rule-engine-v1"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Live API Key:</span>
                  <span className="font-semibold">
                    {aiStatus?.isConfigured ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Configured & Live
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> Demo Engine Active
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {aiStatus?.statusMessage}
              </p>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-blue-700 dark:text-blue-300">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Deterministic Integrity Rule</span>
                </div>
                Hard eligibility requirements (Graduation year, CGPA, degree prerequisites) are evaluated strictly through deterministic rule algorithms. Generative AI is reserved for document parsing and practice mock interview drills.
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
