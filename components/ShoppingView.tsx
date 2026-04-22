"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Check, RotateCcw, ShoppingCart } from "lucide-react";
import type { ShoppingWeek } from "@/data/types";
import { useLocalChecklist } from "@/lib/storage";
import { PageHeader } from "./PageHeader";

export function ShoppingView({ weeks }: { weeks: ShoppingWeek[] }) {
  const params = useSearchParams();
  const qsWeek = Number(params.get("week"));
  const initial =
    weeks.find((w) => w.week === qsWeek)?.week || weeks[0]?.week || 1;

  const [week, setWeek] = useState<number>(initial);

  useEffect(() => {
    if (qsWeek && weeks.some((w) => w.week === qsWeek)) setWeek(qsWeek);
  }, [qsWeek, weeks]);

  const current = weeks.find((w) => w.week === week) || weeks[0];
  const { checks, toggle, reset, loaded } = useLocalChecklist(
    `shopping:week:${current.week}`
  );

  const totalItems = useMemo(
    () => current.sections.reduce((n, s) => n + s.items.length, 0),
    [current]
  );
  const doneCount = useMemo(
    () => Object.values(checks).filter(Boolean).length,
    [checks]
  );

  return (
    <>
      <PageHeader
        title="Shopping"
        subtitle={current.dateLabel}
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
        {weeks.map((w) => (
          <button
            key={w.week}
            onClick={() => setWeek(w.week)}
            className={`shrink-0 rounded-pill px-3.5 py-1.5 text-sm font-semibold transition ${
              w.week === current.week
                ? "bg-primary-300 text-white shadow-card"
                : "bg-surface border border-mpneutral-200 text-mpneutral-400 hover:border-primary-200"
            }`}
          >
            Week {w.week}
          </button>
        ))}
      </div>

      {loaded && (
        <div className="mb-4 flex items-center gap-3 rounded-card bg-surface p-4 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-400">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-mpneutral-400">
              {doneCount} of {totalItems} items
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-pill bg-mpneutral-200">
              <div
                className="h-full rounded-pill bg-gradient-to-r from-primary-300 to-secondary-300 transition-all duration-500"
                style={{
                  width: totalItems
                    ? `${(doneCount / totalItems) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {current.sections.map((section) => (
          <section
            key={section.name}
            className="overflow-hidden rounded-card border border-app-border bg-surface shadow-card"
          >
            <div className="flex items-center gap-2 border-b border-app-border px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-primary-300" />
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-mpneutral-400">
                {section.name}
              </h2>
            </div>
            <ul className="divide-y divide-app-border px-4">
              {section.items.map((item, i) => {
                const id = `${section.name}:${i}:${item.name}`;
                const checked = !!checks[id];
                return (
                  <li key={id}>
                    <button
                      onClick={() => toggle(id)}
                      className="flex w-full items-center gap-3 py-3 text-left"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                          checked
                            ? "border-primary-300 bg-primary-300 text-white"
                            : "border-mpneutral-300 bg-background"
                        }`}
                      >
                        {checked && <Check className="h-4 w-4 animate-pop" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium transition ${
                            checked
                              ? "text-mpneutral-300 line-through"
                              : "text-mpneutral-400"
                          }`}
                        >
                          {item.name}
                          {item.qty && (
                            <span className="ml-2 text-xs font-normal text-mpneutral-300">
                              {item.qty}
                            </span>
                          )}
                        </div>
                        {item.for && (
                          <div className="text-xs text-mpneutral-300">
                            {item.for}
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
