"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WallWidget } from "@/components/widgets/WallWidget";
import {
  ShieldCheck,
  Share2,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Code2,
  Sparkles,
  Lock,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  const sampleTestimonials = [
    {
      id: "t1",
      customer_name: "Aarav Mehta",
      customer_role: "Founder, NovaPay",
      rating: 5,
      content:
        "Proofly allowed us to collect authentic client quotes in days. Our sales conversions noticeably jumped after adding the Wall of Love widget to our pricing page.",
      submitted_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "t2",
      customer_name: "Neha Sharma",
      customer_role: "Lead Designer, Studio Apex",
      rating: 5,
      content:
        "The customizable iframe widget styled perfectly into our Webflow site. Complete CSS isolation means zero theme clashes or script conflicts.",
      submitted_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "t3",
      customer_name: "Priya Kapoor",
      customer_role: "Managing Director, Elevate Consulting",
      rating: 5,
      content:
        "Clients love the simplicity of the review link. The moderation dashboard ensures nothing goes live without our explicit approval and verified consent.",
      submitted_at: new Date(Date.now() - 259200000).toISOString(),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              P
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">Proofly</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/demo">
              <Button variant="ghost" size="sm" className="text-xs">
                Live Embed Demo
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm" className="text-xs">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-blue-700 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Micro-SaaS · Multi-tenant · Production-ready MVP</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Collect trust. <br className="hidden sm:inline" />
          <span className="text-blue-600">Display proof.</span> Win customers.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The lightweight SaaS where freelancers, agencies, and businesses collect authentic customer
          testimonials via a shareable link, moderate submissions, and embed beautiful review widgets in minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full text-sm font-semibold shadow-md">
              Start Collecting Reviews
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/demo" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full text-sm font-medium bg-white">
              Explore Live Website Demo
            </Button>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tenant Isolation & Private Submissions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Customer Email Privacy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>Zero-Conflict Iframe Embeds</span>
          </div>
        </div>
      </section>

      {/* Live Interactive Widget Showcase */}
      <section className="py-12 px-6 max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            See the Proofly Widget in Action
          </h2>
          <p className="text-xs text-slate-500">
            Real customer reviews rendering inside a responsive, brand-customized Wall of Love.
          </p>
        </div>

        <div className="p-6 md:p-8 bg-white rounded-2xl border border-slate-200/90 shadow-md">
          <WallWidget
            testimonials={sampleTestimonials}
            settings={{
              theme: "light",
              accent_color: "#2563EB",
              show_rating: true,
              show_role: true,
              show_date: true,
            }}
            organizationName="Bright Studio"
          />
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">
            How It Works
          </h3>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            From shareable link to published proof in 3 steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-bold text-base text-slate-900">Share Your Link</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Send your branded review collection page link to happy customers via email, chat, or invoice.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-bold text-base text-slate-900">Moderate Feedback</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every review arrives in your private inbox. Review star ratings and approve testimonials with 1 click.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-bold text-base text-slate-900">Embed on Any Website</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Paste the responsive iframe snippet into WordPress, Webflow, Framer, Squarespace, or custom code.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 px-6 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Proofly</span>
            <span>· Collect trust. Display proof. Win customers.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-800">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-slate-800">
              Sign Up
            </Link>
            <Link href="/demo" className="hover:text-slate-800">
              Live Demo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
