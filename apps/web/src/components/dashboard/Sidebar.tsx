"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Link2,
  Code2,
  Settings,
  LogOut,
  Building2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { user, organization, organizations, switchOrg, logout } = useAuth();

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Reviews", href: "/dashboard/reviews", icon: MessageSquare },
    { label: "Collection Page", href: "/dashboard/collect", icon: Link2 },
    { label: "Widgets", href: "/dashboard/widgets", icon: Code2 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between h-screen sticky top-0 shrink-0 border-r border-slate-800">
      <div>
        {/* Brand */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              P
            </div>
            <span className="font-bold text-lg text-white tracking-tight">Proofly</span>
          </Link>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/50">
            MVP
          </span>
        </div>

        {/* Organization Switcher */}
        <div className="p-4 border-b border-slate-800">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1.5 px-2">
            Active Workspace
          </div>
          {organizations.length > 0 ? (
            <select
              value={organization?.id || ""}
              onChange={(e) => switchOrg(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="px-2 py-1.5 text-xs text-slate-400">Loading workspaces...</div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {organization?.slug && (
          <a
            href={`/r/${organization.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span className="truncate">View Public Page</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1 shrink-0 text-slate-400" />
          </a>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {user?.name?.[0] || "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">{user?.name || "User"}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
