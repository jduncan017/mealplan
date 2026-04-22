"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({
  fallback = "/recipes",
  label = "Back",
}: {
  fallback?: string;
  label?: string;
}) {
  const router = useRouter();

  const onClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback);
  };

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-pill border border-app-border bg-surface px-3.5 py-2 text-sm font-semibold text-mpneutral-400 shadow-card transition hover:shadow-lift hover:text-primary-400"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}
