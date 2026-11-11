"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { api, Testimonial } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate, getInitials } from "@/lib/utils";
import {
  Check,
  X,
  Trash2,
  Search,
  CheckCircle2,
  ShieldAlert,
  Inbox,
  Clock,
  Filter,
} from "lucide-react";

export default function ReviewsModerationPage() {
  const { organization } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!organization) return;
    try {
      setLoading(true);
      const data = await api.listTestimonials(
        statusFilter === "ALL" ? undefined : statusFilter,
        searchQuery || undefined
      );
      setTestimonials(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [organization, statusFilter, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: "APPROVED" | "REJECTED" | "PENDING") => {
    setProcessingId(id);
    try {
      await api.updateTestimonialStatus(id, newStatus);
      // update local state
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update review status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this testimonial?")) return;
    setProcessingId(id);
    try {
      await api.deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete review");
    } finally {
      setProcessingId(null);
    }
  };

  const counts = {
    all: testimonials.length,
    pending: testimonials.filter((t) => t.status === "PENDING").length,
    approved: testimonials.filter((t) => t.status === "APPROVED").length,
    rejected: testimonials.filter((t) => t.status === "REJECTED").length,
  };

  return (
    <div>
      <Header
        title="Testimonials & Moderation"
        description="Review incoming customer feedback. Only approved reviews with explicit consent are displayed on widgets."
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* Controls: Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl w-fit">
            {[
              { id: "ALL", label: "All Reviews" },
              { id: "PENDING", label: "Pending" },
              { id: "APPROVED", label: "Approved" },
              { id: "REJECTED", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, role or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 mt-2">Loading reviews...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <Card>
            <div className="p-16 text-center">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900">No testimonials found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {statusFilter === "ALL"
                  ? "Share your public link to start receiving client testimonials."
                  : `No ${statusFilter.toLowerCase()} testimonials match the selected filter.`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {testimonials.map((t) => (
              <Card key={t.id} className="transition-all hover:border-slate-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Review Details */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
                          {getInitials(t.customer_name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-slate-900">{t.customer_name}</h4>
                            <Badge
                              variant={
                                t.status === "APPROVED"
                                  ? "approved"
                                  : t.status === "REJECTED"
                                  ? "rejected"
                                  : "pending"
                              }
                            >
                              {t.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            {t.customer_role && <span>{t.customer_role} · </span>}
                            <span>Submitted on {formatDate(t.submitted_at)}</span>
                            {t.customer_email && (
                              <span className="text-slate-400">({t.customer_email})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Rating value={t.rating} readOnly size="sm" />
                        <span className="text-xs font-semibold text-slate-700">{t.rating}/5 stars</span>
                      </div>

                      <blockquote className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-100 italic">
                        "{t.content}"
                      </blockquote>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        {t.publish_consent ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Explicit customer publication consent granted ({t.consent_version})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 font-medium">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            No publication consent provided
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Moderation Actions */}
                    <div className="flex lg:flex-col items-center gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                      {t.status === "PENDING" && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            disabled={processingId === t.id}
                            onClick={() => handleStatusChange(t.id, "APPROVED")}
                            className="w-full text-xs"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={processingId === t.id}
                            onClick={() => handleStatusChange(t.id, "REJECTED")}
                            className="w-full text-xs"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {t.status === "APPROVED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={processingId === t.id}
                          onClick={() => handleStatusChange(t.id, "REJECTED")}
                          className="w-full text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Unpublish
                        </Button>
                      )}

                      {t.status === "REJECTED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={processingId === t.id}
                          onClick={() => handleStatusChange(t.id, "APPROVED")}
                          className="w-full text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Re-approve
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={processingId === t.id}
                        onClick={() => handleDelete(t.id)}
                        className="w-full text-xs text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
