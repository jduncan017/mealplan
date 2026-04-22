"use client";

import Link from "next/link";
import { Check, Clock, RotateCcw, ShoppingCart } from "lucide-react";
import type { PrepWeek } from "@/data/types";
import { useLocalChecklist } from "@/lib/storage";
import { PageHeader } from "./PageHeader";

export function PrepView({
  week,
  allWeeks,
}: {
  week: PrepWeek;
  allWeeks: number[];
}) {
  const { checks, toggle, reset, loaded } = useLocalChecklist(
    `prep:week:${week.week}`
  );
  const done = Object.values(checks).filter(Boolean).length;

  return (
    <>
      <PageHeader
        title={`Week ${week.week} prep`}
        subtitle={week.dateLabel}
        right={
          <button
            onClick={reset}
            className="no-print inline-flex items-center gap-1 rounded-pill border border-mpneutral-200 bg-surface px-3 py-1.5 text-xs font-medium text-mpneutral-400 shadow-card hover:text-primary-400"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 no-print">
        {allWeeks.map((w) => (
          <Link
            key={w}
            href={`/prep/${w}`}
            className={`shrink-0 rounded-pill px-3.5 py-1.5 text-sm font-semibold transition ${
              w === week.week
                ? "bg-tertiary-300 text-white shadow-card"
                : "bg-surface border border-mpneutral-200 text-mpneutral-400 hover:border-tertiary-200"
            }`}
          >
            Week {w}
          </Link>
        ))}
      </div>

      {loaded && (
        <div className="mb-4 flex items-center gap-3 rounded-card bg-surface p-4 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-100 text-tertiary-400">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-mpneutral-400">
              {done} of {week.steps.length} steps
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-pill bg-mpneutral-200">
              <div
                className="h-full rounded-pill bg-gradient-to-r from-tertiary-300 to-secondary-300 transition-all duration-500"
                style={{
                  width: week.steps.length
                    ? `${(done / week.steps.length) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ol className="space-y-3">
        {week.steps.map((step, i) => {
          const id = `${i}:${step.label}`;
          const checked = !!checks[id];
          return (
            <li key={id}>
              <button
                onClick={() => toggle(id)}
                className="flex w-full items-start gap-3 rounded-card bg-surface p-4 text-left shadow-card transition hover:shadow-lift"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold transition ${
                    checked
                      ? "bg-tertiary-300 text-white"
                      : "bg-tertiary-100 text-tertiary-400"
                  }`}
                >
                  {checked ? <Check className="h-4 w-4 animate-pop" /> : i + 1}
                </span>
                <div className="flex-1">
                  <div
                    className={`text-sm leading-relaxed transition ${
                      checked
                        ? "text-mpneutral-300 line-through"
                        : "text-mpneutral-400"
                    }`}
                  >
                    {step.action}
                  </div>
                  {step.approx && (
                    <div className="mt-1.5 inline-flex items-center gap-1 rounded-pill bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-400">
                      <Clock className="h-3 w-3" /> {step.approx}
                    </div>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6">
        <Link
          href={`/shopping?week=${week.week}`}
          className="flex items-center justify-center gap-2 rounded-card bg-primary-300 py-3 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
        >
          <ShoppingCart className="h-4 w-4" /> Week {week.week} shopping list
        </Link>
      </div>
    </>
  );
}
