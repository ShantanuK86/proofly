import React from "react";
import { Rating } from "@/lib/../components/ui/rating";
import { getInitials, formatDate } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface TestimonialItem {
  id: string;
  customer_name: string;
  customer_role?: string | null;
  rating: number;
  content: string;
  submitted_at: string;
}

interface WallWidgetProps {
  testimonials: TestimonialItem[];
  settings?: {
    theme?: "light" | "dark" | "system";
    accent_color?: string;
    show_rating?: boolean;
    show_role?: boolean;
    show_date?: boolean;
    columns?: number;
  };
  organizationName?: string;
}

export function WallWidget({ testimonials, settings = {}, organizationName }: WallWidgetProps) {
  const isDark = settings.theme === "dark";
  const accentColor = settings.accent_color || "#2563EB";
  const showRating = settings.show_rating !== false;
  const showRole = settings.show_role !== false;
  const showDate = settings.show_date !== false;

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className={`p-8 text-center rounded-xl border ${isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"}`}>
        <p className="text-sm font-medium">No published customer reviews yet.</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${isDark ? "bg-slate-950 text-slate-100" : "bg-transparent text-slate-900"}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
              isDark
                ? "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg shadow-black/20"
                : "bg-white border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow"
            }`}
          >
            <div>
              {showRating && (
                <div className="mb-3">
                  <Rating value={t.rating} readOnly size="sm" />
                </div>
              )}
              <blockquote className={`text-sm leading-relaxed mb-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                "{t.content}"
              </blockquote>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: accentColor }}
                >
                  {getInitials(t.customer_name)}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold">{t.customer_name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                  </div>
                  {showRole && t.customer_role && (
                    <p className={`text-[11px] truncate max-w-[150px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {t.customer_role}
                    </p>
                  )}
                </div>
              </div>

              {showDate && (
                <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {formatDate(t.submitted_at)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <span>Verified by</span>
        <span className="font-semibold text-blue-600">Proofly</span>
      </div>
    </div>
  );
}
