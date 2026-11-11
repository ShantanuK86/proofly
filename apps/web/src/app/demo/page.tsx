"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WallWidget } from "@/components/widgets/WallWidget";
import { ArrowLeft, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";

export default function DemoWebsitePage() {
  const [activeTab, setActiveTab] = useState<"wall" | "carousel">("wall");

  const sampleReviews = [
    {
      id: "demo-r1",
      customer_name: "Marcus Vance",
      customer_role: "VP of Product, FinTech Pulse",
      rating: 5,
      content:
        "Apex Digital delivered our entire web application redesign two weeks ahead of schedule. Their attention to detail and UX craftsmanship is second to none.",
      submitted_at: new Date().toISOString(),
    },
    {
      id: "demo-r2",
      customer_name: "Elena Rostova",
      customer_role: "Head of Marketing, CloudScale",
      rating: 5,
      content:
        "The team transformed our landing page conversion rates by 42%. Communication was transparent, responsive, and exceptionally professional throughout.",
      submitted_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "demo-r3",
      customer_name: "David Chen",
      customer_role: "Co-Founder, ByteWorks",
      rating: 5,
      content:
        "From discovery to production deployment, Apex was a true strategic partner. We couldn't be happier with the final results and user reception.",
      submitted_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Simulation Banner */}
      <div className="bg-slate-900 text-slate-300 px-6 py-3 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-white">Live Customer Site Simulation</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Showing Proofly iframe embed inside an external agency website</span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 font-medium">
            Open Dashboard →
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs h-7 bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              <ArrowLeft className="w-3 h-3 mr-1" />
              Back to Proofly
            </Button>
          </Link>
        </div>
      </div>

      {/* Simulated Agency Website Navbar */}
      <header className="border-b border-slate-100 px-8 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">Apex Creative</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="#services" className="hover:text-slate-900">Services</a>
          <a href="#work" className="hover:text-slate-900">Work</a>
          <a href="#testimonials" className="text-indigo-600 font-bold">Client Reviews</a>
          <a href="#contact" className="hover:text-slate-900">Contact</a>
        </nav>

        <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
          Start a Project
        </button>
      </header>

      {/* Simulated Hero */}
      <section className="py-20 px-6 text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          We design and build digital experiences that drive real revenue.
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Award-winning digital product studio partnering with ambitious startups and Fortune 500 enterprises.
        </p>
      </section>

      {/* Simulated Testimonials Section with Proofly Embed */}
      <section id="testimonials" className="py-16 px-6 bg-slate-50/80 border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Client Testimonials
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Trusted by leaders at top companies
            </h2>
          </div>

          {/* Proofly Wall of Love Embed Container */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <WallWidget
              testimonials={sampleReviews}
              settings={{
                theme: "light",
                accent_color: "#4F46E5",
                show_rating: true,
                show_role: true,
                show_date: true,
              }}
              organizationName="Apex Creative"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-xs text-slate-400">
        <p>© 2026 Apex Creative Studio · Testimonials verified and rendered via Proofly SaaS</p>
      </footer>
    </div>
  );
}
