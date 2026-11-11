"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WallWidget } from "@/components/widgets/WallWidget";
import { CarouselWidget } from "@/components/widgets/CarouselWidget";
import { api } from "@/lib/api";

export default function PublicEmbedWidgetPage() {
  const params = useParams();
  const widgetId = params?.widget_id as string;

  const [widgetData, setWidgetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWidget() {
      if (!widgetId) return;
      try {
        const data = await api.getPublicWidget(widgetId);
        setWidgetData(data);
      } catch (err: any) {
        setError(err.message || "Widget not found or inactive");
      } finally {
        setLoading(false);
      }
    }
    loadWidget();
  }, [widgetId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !widgetData) {
    return (
      <div className="p-6 text-center text-xs text-slate-400">
        Testimonials currently unavailable.
      </div>
    );
  }

  const { type, settings, testimonials, organization_name } = widgetData;

  return (
    <div className="w-full h-full p-2 bg-transparent">
      {type === "CAROUSEL" ? (
        <CarouselWidget
          testimonials={testimonials}
          settings={settings}
          organizationName={organization_name}
        />
      ) : (
        <WallWidget
          testimonials={testimonials}
          settings={settings}
          organizationName={organization_name}
        />
      )}
    </div>
  );
}
