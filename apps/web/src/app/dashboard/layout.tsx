"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, organization, loading, organizations } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (organizations.length === 0) {
        router.push("/onboarding");
      }
    }
  }, [user, loading, organizations, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Loading Proofly...</p>
        </div>
      </div>
    );
  }

  if (!user || organizations.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
