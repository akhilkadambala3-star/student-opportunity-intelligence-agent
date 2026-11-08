import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { getAIProviderStatus } from "@/lib/ai/gemini";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export async function AppLayout({ children }: AppLayoutProps) {
  const user = await getCurrentUser();
  const aiStatus = getAIProviderStatus();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} aiStatus={aiStatus} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
