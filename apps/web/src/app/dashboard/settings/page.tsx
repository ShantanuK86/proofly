"use client";

import React, { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Building2, Save, CheckCircle2, User, Globe } from "lucide-react";

export default function SettingsPage() {
  const { user, organization, refreshOrg } = useAuth();

  const [name, setName] = useState(organization?.name || "");
  const [websiteUrl, setWebsiteUrl] = useState(organization?.website_url || "");
  const [primaryColor, setPrimaryColor] = useState(
    organization?.branding?.primary_color || "#2563EB"
  );
  const [badgeText, setBadgeText] = useState(
    organization?.branding?.badge_text || "Verified by Proofly"
  );
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      await api.updateOrganization({
        name,
        website_url: websiteUrl,
        branding: {
          ...organization?.branding,
          primary_color: primaryColor,
          badge_text: badgeText,
        },
      });
      await refreshOrg();
      setSuccessMsg("Business profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header
        title="Business Profile & Settings"
        description="Manage your business information, workspace branding, and account settings."
      />

      <div className="p-8 space-y-8 max-w-4xl">
        <form onSubmit={handleSave} className="space-y-6">
          {successMsg && (
            <div className="p-3.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Organization Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Business Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Public Slug</label>
                  <input
                    type="text"
                    disabled
                    value={organization?.slug || ""}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Website URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://yourbusiness.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Branding & Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Primary Brand Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-36 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Verification Badge Text</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-2">
              <p className="text-xs text-slate-500">
                Logged in as <strong className="text-slate-800">{user?.name}</strong> ({user?.email})
              </p>
              <p className="text-xs text-slate-500">
                Workspace Role: <strong className="text-slate-800">{organization?.role || "OWNER"}</strong>
              </p>
            </CardContent>
          </Card>

          <Button type="submit" variant="primary" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
