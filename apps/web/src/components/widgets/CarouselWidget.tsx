"use client";

import React, { useState } from "react";
import { Rating } from "@/lib/../components/ui/rating";
import { getInitials, formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface TestimonialItem {
  id: string;
  customer_name: string;
  customer_role?: string | null;
  rating: number;
  content: string;
  submitted_at: string;
}

interface CarouselWidgetProps {
  testimonials: TestimonialItem[];
  settings?: {
    theme?: "light" | "dark" | "system";
    accent_color?: string;
    show_rating?: boolean;
    show_role?: boolean;
    show_date?: boolean;
  };
  organizationName?: string;
}

export function CarouselWidget({ testimonials, settings = {}, organizationName }: CarouselWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const current = testimonials[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${isDark ? "text-slate-100" : "text-slate-900"}`}>
      <div
        className={`relative p-8 rounded-2xl border transition-all duration-300 ${
          isDark
            ? "bg-slate-900 border-slate-800 shadow-xl"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        {showRating && (
          <div className="flex justify-center mb-4">
            <Rating value={current.rating} readOnly size="md" />
          </div>
        )}

        <blockquote className={`text-base md:text-lg text-center font-normal leading-relaxed mb-6 italic ${isDark ? "text-slate-200" : "text-slate-700"}`}>
          "{current.content}"
        </blockquote>

        <div className="flex flex-col items-center justify-center gap-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white mb-1 shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            {getInitials(current.customer_name)}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm">{current.customer_name}</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />
          </div>
          {showRole && current.customer_role && (
            <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {current.customer_role}
            </span>
          )}
          {showDate && (
            <span className={`text-[10px] mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {formatDate(current.submitted_at)}
            </span>
          )}
        </div>

        {testimonials.length > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handlePrev}
              className={`p-2 rounded-full border transition-colors ${
                isDark
                  ? "border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex
                      ? "w-6 bg-blue-600"
                      : isDark
                      ? "bg-slate-700 hover:bg-slate-600"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className={`p-2 rounded-full border transition-colors ${
                isDark
                  ? "border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <span>Verified by</span>
        <span className="font-semibold text-blue-600">Proofly</span>
      </div>
    </div>
  );
}
