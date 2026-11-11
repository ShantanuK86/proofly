"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WallWidget } from "@/components/widgets/WallWidget";
import { CarouselWidget } from "@/components/widgets/CarouselWidget";
import { api, Widget, Testimonial } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Code,
  Copy,
  Check,
  LayoutGrid,
  Sliders,
  Palette,
  Eye,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function WidgetsPage() {
  const { organization } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [approvedReviews, setApprovedReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Editor states
  const [widgetType, setWidgetType] = useState<"WALL" | "CAROUSEL">("WALL");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [accentColor, setAccentColor] = useState("#2563EB");
  const [showRating, setShowRating] = useState(true);
  const [showRole, setShowRole] = useState(true);
  const [showDate, setShowDate] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!organization) return;
      try {
        const [widgetList, reviews] = await Promise.all([
          api.listWidgets(),
          api.listTestimonials("APPROVED"),
        ]);
        setWidgets(widgetList);
        setApprovedReviews(reviews);

        if (widgetList.length > 0) {
          const w = widgetList[0];
          setSelectedWidget(w);
          setWidgetType(w.type);
          setTheme(w.settings?.theme === "dark" ? "dark" : "light");
          setAccentColor(w.settings?.accent_color || "#2563EB");
          setShowRating(w.settings?.show_rating !== false);
          setShowRole(w.settings?.show_role !== false);
          setShowDate(w.settings?.show_date !== false);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [organization]);

  const embedUrl = typeof window !== "undefined" && selectedWidget
    ? `${window.location.origin}/embed/${selectedWidget.public_id}`
    : `/embed/${selectedWidget?.public_id || ""}`;

  const iframeSnippet = `<iframe
  src="${embedUrl}"
  title="Customer Testimonials"
  width="100%"
  height="500"
  loading="lazy"
  style="border:0;width:100%;max-width:100%;display:block;"
></iframe>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(iframeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = async () => {
    if (!selectedWidget) return;
    setSaving(true);
    setSuccessMsg("");
    try {
      const updated = await api.updateWidget(selectedWidget.id, {
        type: widgetType,
        settings: {
          ...selectedWidget.settings,
          theme,
          accent_color: accentColor,
          show_rating: showRating,
          show_role: showRole,
          show_date: showDate,
        },
      });
      setSelectedWidget(updated);
      setSuccessMsg("Widget configuration updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update widget");
    } finally {
      setSaving(false);
    }
  };

  // Sample items for preview if no reviews approved yet
  const previewItems = approvedReviews.length > 0
    ? approvedReviews
    : [
        {
          id: "demo-1",
          customer_name: "Aarav Mehta",
          customer_role: "Founder, NovaPay",
          rating: 5,
          content: "Proofly made it effortless to collect real feedback from our clients and display it cleanly on our marketing site.",
          submitted_at: new Date().toISOString(),
        },
        {
          id: "demo-2",
          customer_name: "Neha Sharma",
          customer_role: "Product Designer",
          rating: 5,
          content: "The embed works seamlessly on our Webflow landing page. Customer trust increased noticeably after launch.",
          submitted_at: new Date().toISOString(),
        },
        {
          id: "demo-3",
          customer_name: "Priya Kapoor",
          customer_role: "Managing Director",
          rating: 4,
          content: "Clean, fast, and simple. Exactly what our small consulting agency needed without enterprise bloat.",
          submitted_at: new Date().toISOString(),
        },
      ];

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
        title="Embeddable Testimonial Widgets"
        description="Customize your review wall or carousel and copy the responsive iframe embed code to display on any website."
      />

      <div className="p-8 space-y-8 max-w-7xl">
        {/* Iframe Snippet Box */}
        <Card className="bg-slate-900 text-white border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Embed Code Snippet (HTML / Iframe)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={copyEmbed}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Copied Snippet!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy Embed Code
                    </>
                  )}
                </Button>
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                >
                  <span>Open Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <pre className="p-3.5 rounded-lg bg-slate-950 font-mono text-xs text-blue-300 overflow-x-auto border border-slate-800">
              {iframeSnippet}
            </pre>
            <p className="text-[11px] text-slate-400 mt-2">
              Works across WordPress, Webflow, Framer, Squarespace, Shopify, React, and standard HTML sites. CSS and scripts remain completely isolated.
            </p>
          </CardContent>
        </Card>

        {/* Customization & Live Interactive Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Widget Appearance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {successMsg && (
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Layout Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Display Layout</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWidgetType("WALL")}
                      className={`p-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                        widgetType === "WALL"
                          ? "bg-blue-50 border-blue-600 text-blue-700"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Wall Grid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWidgetType("CAROUSEL")}
                      className={`p-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                        widgetType === "CAROUSEL"
                          ? "bg-blue-50 border-blue-600 text-blue-700"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Carousel</span>
                    </button>
                  </div>
                </div>

                {/* Theme Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Color Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`p-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                        theme === "light"
                          ? "bg-slate-100 border-slate-900 text-slate-900 font-semibold"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`p-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                        theme === "dark"
                          ? "bg-slate-900 border-slate-900 text-white font-semibold"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                    <span>Show Star Ratings</span>
                    <input
                      type="checkbox"
                      checked={showRating}
                      onChange={(e) => setShowRating(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                    <span>Show Reviewer Role/Company</span>
                    <input
                      type="checkbox"
                      checked={showRole}
                      onChange={(e) => setShowRole(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                    <span>Show Submission Date</span>
                    <input
                      type="checkbox"
                      checked={showDate}
                      onChange={(e) => setShowDate(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>
                </div>

                <Button
                  variant="primary"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full text-xs"
                >
                  {saving ? "Saving..." : "Apply & Save Widget"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview Container */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Live Embed Preview
              </span>
              <span className="text-xs text-slate-400">
                {approvedReviews.length} approved review{approvedReviews.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div
              className={`p-6 rounded-2xl border transition-colors ${
                theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200/80"
              }`}
            >
              {widgetType === "WALL" ? (
                <WallWidget
                  testimonials={previewItems}
                  settings={{
                    theme,
                    accent_color: accentColor,
                    show_rating: showRating,
                    show_role: showRole,
                    show_date: showDate,
                  }}
                  organizationName={organization?.name}
                />
              ) : (
                <CarouselWidget
                  testimonials={previewItems}
                  settings={{
                    theme,
                    accent_color: accentColor,
                    show_rating: showRating,
                    show_role: showRole,
                    show_date: showDate,
                  }}
                  organizationName={organization?.name}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
