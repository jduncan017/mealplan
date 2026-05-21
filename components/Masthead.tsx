"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Masthead() {
  const pathname = usePathname();
  const onPlan = pathname?.startsWith("/plan");
  return (
    <div
      className={`mx-auto flex items-center justify-between gap-3 px-4 pt-4 no-print ${
        onPlan ? "max-w-6xl sm:px-8" : "max-w-3xl"
      }`}
    >
      <Link href="/" aria-label="May Meal Plan home" className="inline-flex">
        <Image
          src="/logo.png"
          alt="May Meal Plan"
          width={726}
          height={186}
          priority
          className="h-8 w-auto sm:h-9"
        />
      </Link>
      <div className="flex items-center gap-2">
        {onPlan && (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-pill border border-mpneutral-200 bg-surface px-3 py-1.5 text-xs font-semibold text-mpneutral-400 shadow-card hover:border-primary-300 hover:text-primary-400"
          >
            <Home className="h-3.5 w-3.5" /> Back to app
          </Link>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
}
