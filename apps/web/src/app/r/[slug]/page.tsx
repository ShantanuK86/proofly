"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { CheckCircle2, ShieldCheck, Star, MessageSquareQuote, Lock } from "lucide-react";

export default function PublicCollectionPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        const data = await api.getPublicCollectionPage(slug);
        setPageData(data);
      } catch (err: any) {
        setError(err.message || "Collection page not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert("Please confirm your consent for publication.");
      return;
    }
    setSubmitting(true);
    try {
      await api.submitTestimonial(slug, {
        customer_name: name,
        customer_role: role || undefined,
        customer_email: email || undefined,
        rating,
        content,
        publish_consent: consent,
        website_hp: honeypot || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit testimonial");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading review page...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            !
          </div>
          <h2 className="text-lg font-bold text-slate-900">Page Not Found</h2>
          <p className="text-xs text-slate-500">
            This review collection page does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (!pageData.is_active) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Submissions Paused</h2>
          <p className="text-xs text-slate-500">
            {pageData.organization_name} is currently not accepting new review submissions.
          </p>
        </div>
      </div>
    );
  }

  const primaryColor = pageData.organization_branding?.primary_color || "#2563EB";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 selection:bg-blue-500 selection:text-white">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header / Brand Banner */}
        <div className="text-center space-y-3">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            {pageData.organization_name[0]}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {pageData.title}
            </h1>
            {pageData.description && (
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {pageData.description}
              </p>
            )}
          </div>
        </div>

        {/* Form Card or Thank You Screen */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Thank You!</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {pageData.settings?.thank_you_message ||
                    "Your review has been received and submitted for moderation."}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified submission powered by Proofly</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-2 text-center pb-4 border-b border-slate-100">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Select your rating
                </label>
                <div className="flex justify-center">
                  <Rating value={rating} onChange={setRating} size="lg" />
                </div>
              </div>

              {/* Questions Prompts */}
              {pageData.settings?.questions && pageData.settings.questions.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 block mb-1">
                    Need inspiration? You could mention:
                  </span>
                  <ul className="list-disc list-inside space-y-1">
                    {pageData.settings.questions.map((q: string, idx: number) => (
                      <li key={idx} className="italic">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Testimonial Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Your Testimonial / Feedback *</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {content.length}/2000
                  </span>
                </label>
                <textarea
                  required
                  rows={4}
                  minLength={10}
                  maxLength={2000}
                  placeholder="Share your experience working with us..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Role / Company (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Founder at Acme Inc"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email (Optional & Private) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Your Email (Optional)</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-normal">
                    <Lock className="w-3 h-3" /> Never published publicly
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Spam Honeypot - hidden from human users */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Explicit Publication Consent Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed select-none">
                    I give permission to{" "}
                    <strong className="text-slate-900">{pageData.organization_name}</strong> to
                    display this testimonial, my rating, and my name publicly on their website and
                    marketing materials.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full py-2.5 text-sm font-semibold shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                {submitting ? "Submitting..." : pageData.settings?.submit_button_text || "Submit Testimonial"}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <span>Powered by</span>
          <span className="font-semibold text-slate-600">Proofly</span>
        </div>
      </div>
    </div>
  );
}
