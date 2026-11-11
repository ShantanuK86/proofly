"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/lib/../components/ui/button";
import { Copy, Check, ExternalLink, Sparkles } from "lucide-react";

export function Header({ title, description }: { title: string; description?: string }) {
  const { organization } = useAuth();
  const [copied, setCopied] = useState(false);

  const collectionUrl = typeof window !== "undefined" && organization?.slug
    ? `${window.location.origin}/r/${organization.slug}`
    : `/r/${organization?.slug || ""}`;

  const copyLink = () => {
    if (!organization?.slug) return;
    navigator.clipboard.writeText(collectionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>

      {organization && (
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="text-xs font-semibold text-slate-700 bg-white"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Review Link</span>
              </>
            )}
          </Button>

          <a
            href={collectionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200/60"
          >
            <span>Open Page</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </header>
  );
}
