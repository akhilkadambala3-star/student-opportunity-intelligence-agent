"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { OpportunityLogo } from "@/components/brand/OpportunityLogo";
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  Compass,
  ScanEye,
  GraduationCap,
  KanbanSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    isDemo: boolean;
  } | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  user,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Allow either external or internal control of collapse state
  const isCollapsed = onToggleCollapse !== undefined ? collapsed : internalCollapsed;
  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Profile", href: "/profile", icon: UserCheck },
    { label: "My Documents", href: "/documents", icon: FileText },
    { label: "Discover", href: "/opportunities", icon: Compass },
    { label: "Investigation", href: "/investigation", icon: ScanEye },
    { label: "Preparation & Drills", href: "/preparation", icon: GraduationCap },
    { label: "Application Tracker", href: "/applications", icon: KanbanSquare },
    { label: "Progress & Insights", href: "/insights", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 z-40 md:z-30 flex flex-col h-screen select-none transition-all duration-200 ease-in-out shrink-0
          bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80
          ${isCollapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1"
            title="Opportunity Intelligence"
          >
            <OpportunityLogo
              iconOnly={isCollapsed}
              size={isCollapsed ? "sm" : "sm"}
              showTagline={!isCollapsed}
            />
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 stroke-[2]" />
            ) : (
              <ChevronLeft className="w-4 h-4 stroke-[2]" />
            )}
          </button>
        </div>

        {/* Demo Account Indicator Badge */}
        {user?.isDemo && !isCollapsed && (
          <div className="mx-3.5 mt-3.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <div className="min-w-0 flex-1 leading-tight">
              <span className="font-semibold block truncate">Demo Mode Active</span>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 truncate block">
                NSUT CSE &apos;26 Profile
              </span>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/30 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/80 border border-transparent"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                {/* Active Indicator Left Accent Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors stroke-[1.8] ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate tracking-tight">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card & Logout Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/60 shrink-0">
          <div
            className={`flex items-center rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-2 shadow-xs transition-all ${
              isCollapsed ? "justify-center p-1.5" : "justify-between"
            }`}
          >
            {/* User Details */}
            <Link
              href="/profile"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 min-w-0 pr-1 hover:opacity-85 transition-opacity"
              title="View your profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0 ring-2 ring-white dark:ring-slate-800">
                {user?.name ? user.name[0].toUpperCase() : "P"}
              </div>

              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                    <span>{user?.name || "Priya Sharma"}</span>
                    {user?.isDemo && (
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || "priya.sharma@nsut.ac.in"}
                  </div>
                </div>
              )}
            </Link>

            {/* Logout Action Button */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={handleLogout}
                title="Log out of session"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4 stroke-[1.8]" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
