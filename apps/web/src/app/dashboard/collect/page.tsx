"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { api, CollectionPage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CollectManagementPage() {
  const { organization } = useAuth();
  const [page, setPage] = useState<CollectionPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [thankYouMessage, setThankYouMessage] = useState("");

  useEffect(() => {
    async function loadPage() {
      if (!organization) return;
      try {
        const pages = await api.listCollectionPages();
        if (pages.length > 0) {
          const p = pages[0];
          setPage(p);
          setTitle(p.title);
          setDescription(p.description || "");
          setIsActive(p.is_active);
          setThankYouMessage(p.settings?.thank_you_message || "Thank you! Your testimonial has been submitted.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [organization]);

  const collectionUrl = typeof window !== "undefined" && page?.slug
    ? `${window.location.origin}/r/${page.slug}`
    : `/r/${page?.slug || ""}`;

  const copyLink = () => {
    navigator.clipboard.writeText(collectionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) return;
    setSaving(true);
    setSuccessMsg("");
    try {
      const updated = await api.updateCollectionPage(page.id, {
        title,
        description,
        is_active: isActive,
        settings: {
          ...page.settings,
          thank_you_message: thankYouMessage,
        },
      });
      setPage(updated);
      setSuccessMsg("Collection page updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Collection Page & Link"
        description="Share your custom review page with customers to collect ratings, written quotes, and verified publication consent."
      />

      <div className="p-8 space-y-8 max-w-7xl">
        {/* Shareable Link Box */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Your Public Collection URL
                </span>
                <p className="text-sm font-medium text-slate-800 break-all">{collectionUrl}</p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Button variant="primary" size="sm" onClick={copyLink}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1 text-white" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Link
                    </>
                  )}
                </Button>
                <a
                  href={collectionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
                >
                  <span>Open Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customizer & Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Settings */}
          <div className="lg:col-span-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Configuration</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSave} className="space-y-5">
                  {successMsg && (
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Page Headline</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Subheading / Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Thank You Message</label>
                    <input
                      type="text"
                      value={thankYouMessage}
                      onChange={(e) => setThankYouMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Accept Submissions</p>
                      <p className="text-xs text-slate-500">Allow customers to submit reviews</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  <Button type="submit" variant="primary" disabled={saving} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving Changes..." : "Save Settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Live Mobile/Desktop Simulation Preview */}
          <div className="lg:col-span-6 space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Live Customer Form Preview
            </span>
            <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200/80 shadow-inner">
              <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 mx-auto rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
                    {organization?.name?.[0] || "P"}
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{title || "Leave a Review"}</h3>
                  <p className="text-xs text-slate-500">{description || "Share your feedback with us"}</p>
                </div>

                <div className="flex justify-center py-2 border-y border-slate-100">
                  <Rating value={5} readOnly size="md" />
                </div>

                <div className="space-y-2">
                  <div className="h-20 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-400">
                    Write your honest review here...
                  </div>
                  <div className="h-8 bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center text-xs text-slate-400">
                    Your Full Name
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 text-[11px] text-slate-500">
                  <input type="checkbox" checked readOnly className="mt-0.5 text-blue-600 rounded" />
                  <span>I give permission to publish this review publicly.</span>
                </div>

                <Button variant="primary" size="sm" className="w-full text-xs" disabled>
                  Submit Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
