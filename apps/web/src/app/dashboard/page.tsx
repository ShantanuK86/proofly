"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { api, AnalyticsOverview, Testimonial } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";
import {
  Inbox,
  CheckCircle2,
  Clock,
  Eye,
  Star,
  ArrowRight,
  TrendingUp,
  Share2,
  Code,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { organization } = useAuth();
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const [recentReviews, setRecentReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!organization) return;
      try {
        const [overviewData, reviewsData] = await Promise.all([
          api.getAnalyticsOverview().catch(() => null),
          api.listTestimonials().catch(() => []),
        ]);
        if (overviewData) setStats(overviewData);
        setRecentReviews(reviewsData.slice(0, 5));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [organization]);

  return (
    <div>
      <Header
        title={`${organization?.name || "Workspace"} Overview`}
        description="Monitor review collection velocity, moderation queue, and widget views."
      />

      <div className="p-8 space-y-8 max-w-7xl">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Received
                </span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Inbox className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {stats?.total_received ?? 0}
                </span>
                <span className="text-xs text-slate-500">submissions</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Published Reviews
                </span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {stats?.total_published ?? 0}
                </span>
                <span className="text-xs text-emerald-600 font-medium">
                  {stats?.approval_rate_percent ?? 0}% rate
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending Moderation
                </span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {stats?.total_pending ?? 0}
                </span>
                {stats && stats.total_pending > 0 && (
                  <span className="text-xs text-amber-600 font-medium">Needs action</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Widget Views
                </span>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {stats?.total_widget_views ?? 0}
                </span>
                <span className="text-xs text-slate-500">impressions</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activation Journey */}
        <Card className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white border-0 shadow-lg">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-800/80 border border-blue-700/60 text-xs font-medium text-blue-200">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Activation Checklist</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  Get your first 5 genuine customer reviews
                </h3>
                <p className="text-sm text-blue-200/90 max-w-xl">
                  Share your collection page link directly with happy clients via email or message.
                  Once approved, your reviews instantly reflect in your website embed.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/dashboard/collect">
                  <Button variant="outline" size="sm" className="bg-white text-slate-900 border-white hover:bg-blue-50">
                    <Share2 className="w-4 h-4 mr-1.5" />
                    Share Review Link
                  </Button>
                </Link>
                <Link href="/dashboard/widgets">
                  <Button variant="primary" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white border-0">
                    <Code className="w-4 h-4 mr-1.5" />
                    Embed Widget
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Submissions</h2>
            <Link
              href="/dashboard/reviews"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card>
            {recentReviews.length === 0 ? (
              <div className="p-12 text-center">
                <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <h4 className="text-sm font-semibold text-slate-800">No submissions yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Copy your collection link from the top right and send it to your first customer to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentReviews.map((r) => (
                  <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-slate-900">{r.customer_name}</span>
                        <Rating value={r.rating} readOnly size="sm" />
                        <span className="text-xs text-slate-400">· {formatDate(r.submitted_at)}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 italic max-w-2xl">
                        "{r.content}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant={
                          r.status === "APPROVED"
                            ? "approved"
                            : r.status === "REJECTED"
                            ? "rejected"
                            : "pending"
                        }
                      >
                        {r.status}
                      </Badge>
                      <Link href="/dashboard/reviews">
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Moderate
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
