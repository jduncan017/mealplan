"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Clock,
  ListChecks,
  RotateCcw,
  ShoppingCart,
  X,
} from "lucide-react";
import type { PrepWeek, Recipe } from "@/data/types";
import { useLocalChecklist } from "@/lib/storage";
import { PageHeader } from "./PageHeader";
import { recipes } from "@/data/recipes";
import { calendar } from "@/data/calendar";
import {
  buildPrepMealFilter,
  composeStepAction,
  selectedStepMeals,
  stepVisibleForSelection,
} from "@/lib/mealItemMap";
import {
  currentMonthKey,
  localWeekNumber,
  monthForWeekIndex,
  monthsInCalendar,
} from "@/lib/months";

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

  const mealFilter = useMemo(
    () => buildPrepMealFilter(week, week.week, calendar, recipes),
    [week]
  );

  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setSelectedSlugs(new Set(mealFilter.meals.map((r) => r.slug)));
  }, [mealFilter]);

  const visibleSteps = useMemo(() => {
    return week.steps
      .map((step, i) => {
        const id = `${i}:${step.label}`;
        const info = mealFilter.stepInfo.get(id) || {
          meals: [],
          segments: [],
        };
        return {
          step,
          i,
          id,
          info,
          actionText: composeStepAction(info, step.action, selectedSlugs),
          pillMeals: selectedStepMeals(info, selectedSlugs),
        };
      })
      .filter(({ info }) => stepVisibleForSelection(info, selectedSlugs));
  }, [week.steps, mealFilter, selectedSlugs]);

  const done = useMemo(
    () => visibleSteps.filter(({ id }) => checks[id]).length,
    [visibleSteps, checks]
  );

  const totalMeals = mealFilter.meals.length;
  const selectedCount = selectedSlugs.size;
  const filterActive = totalMeals > 0 && selectedCount < totalMeals;

  const toggleMeal = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };
  const selectAllMeals = () =>
    setSelectedSlugs(new Set(mealFilter.meals.map((r) => r.slug)));
  const clearAllMeals = () => setSelectedSlugs(new Set());

  const months = useMemo(() => monthsInCalendar(calendar), []);
  const currentMonth = useMemo(
    () => monthForWeekIndex(week.week, months),
    [week.week, months]
  );
  const initialMonthKey = currentMonth?.key || currentMonthKey(months);
  const [monthKey, setMonthKey] = useState<string>(initialMonthKey);
  const month = months.find((m) => m.key === monthKey) || currentMonth;

  useEffect(() => {
    if (currentMonth && currentMonth.key !== monthKey) {
      setMonthKey(currentMonth.key);
    }
  }, [currentMonth, monthKey]);

  const monthWeeks = useMemo(() => {
    if (!month) return allWeeks;
    return allWeeks.filter((w) => month.weekIndexes.includes(w));
  }, [allWeeks, month]);

  const localWeek = month ? localWeekNumber(week.week, month) : week.week;

  const handleMonthChange = (key: string) => {
    setMonthKey(key);
    const m = months.find((x) => x.key === key);
    if (m && m.weekIndexes.length > 0) {
      const targetWeek = allWeeks.find((w) =>
        m.weekIndexes.includes(w)
      );
      if (targetWeek !== undefined && targetWeek !== week.week) {
        window.location.href = `/prep/${targetWeek}`;
      }
    }
  };

  return (
    <>
      <PageHeader
        title={`Week ${localWeek} prep`}
        subtitle={week.dateLabel}
        right={
          <div className="no-print flex items-center gap-2">
            {totalMeals > 0 && (
              <button
                onClick={() => setFilterOpen(true)}
                className={`inline-flex items-center gap-1 rounded-pill border px-3 py-1.5 text-xs font-medium shadow-card transition ${
                  filterActive
                    ? "border-tertiary-300 bg-tertiary-100 text-tertiary-400"
                    : "border-mpneutral-200 bg-surface text-mpneutral-400 hover:text-tertiary-400"
                }`}
              >
                <ListChecks className="h-3.5 w-3.5" />
                Meals {selectedCount}/{totalMeals}
              </button>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-pill border border-mpneutral-200 bg-surface px-3 py-1.5 text-xs font-medium text-mpneutral-400 shadow-card hover:text-primary-400"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        }
      />

      {months.length > 1 && (
        <div className="mb-3 flex items-center gap-2 no-print">
          <label className="text-xs font-semibold uppercase tracking-wider text-mpneutral-300">
            Month
          </label>
          <select
            value={monthKey}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="rounded-pill border border-mpneutral-200 bg-surface px-3 py-1.5 text-sm font-medium text-mpneutral-400 shadow-card"
          >
            {months.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 no-print">
        {monthWeeks.map((w) => {
          const num = month ? localWeekNumber(w, month) : w;
          return (
            <Link
              key={w}
              href={`/prep/${w}`}
              className={`shrink-0 rounded-pill px-3.5 py-1.5 text-sm font-semibold transition ${
                w === week.week
                  ? "bg-tertiary-300 text-white shadow-card"
                  : "bg-surface border border-mpneutral-200 text-mpneutral-400 hover:border-tertiary-200"
              }`}
            >
              Week {num}
            </Link>
          );
        })}
      </div>

      {loaded && (
        <div className="mb-4 flex items-center gap-3 rounded-card bg-surface p-4 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-100 text-tertiary-400">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-mpneutral-400">
              {done} of {visibleSteps.length} steps
              {filterActive && (
                <span className="ml-2 text-xs font-normal text-mpneutral-300">
                  ({totalMeals - selectedCount} meal
                  {totalMeals - selectedCount === 1 ? "" : "s"} skipped)
                </span>
              )}
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-pill bg-mpneutral-200">
              <div
                className="h-full rounded-pill bg-gradient-to-r from-tertiary-300 to-secondary-300 transition-all duration-500"
                style={{
                  width: visibleSteps.length
                    ? `${(done / visibleSteps.length) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ol className="space-y-3">
        {visibleSteps.map(({ step, i, id, actionText, pillMeals }) => {
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
                    {actionText}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {step.approx && (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-400">
                        <Clock className="h-3 w-3" /> {step.approx}
                      </span>
                    )}
                    {pillMeals.map((r) => (
                      <span
                        key={r.slug}
                        className="inline-flex items-center rounded-pill bg-tertiary-100 px-2 py-0.5 text-[10px] font-medium text-tertiary-400"
                      >
                        {r.name}
                      </span>
                    ))}
                  </div>
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
          <ShoppingCart className="h-4 w-4" /> Week {localWeek} shopping list
        </Link>
      </div>

      {filterOpen && (
        <PrepMealFilterModal
          meals={mealFilter.meals}
          selected={selectedSlugs}
          onToggle={toggleMeal}
          onSelectAll={selectAllMeals}
          onClearAll={clearAllMeals}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </>
  );
}

function PrepMealFilterModal({
  meals,
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
  onClose,
}: {
  meals: Recipe[];
  selected: Set<string>;
  onToggle: (slug: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-t-card sm:rounded-card bg-surface shadow-lift flex flex-col"
      >
        <div className="flex items-center justify-between border-b border-app-border px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-mpneutral-400">
              Prepping which meals?
            </h2>
            <p className="text-xs text-mpneutral-300">
              Uncheck meals you&apos;ll skip. Prep steps used only for skipped
              meals are hidden.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-mpneutral-400 hover:bg-mpneutral-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-app-border px-5 py-2 text-xs">
          <button
            onClick={onSelectAll}
            className="font-medium text-tertiary-400 hover:underline"
          >
            Select all
          </button>
          <span className="text-mpneutral-300">·</span>
          <button
            onClick={onClearAll}
            className="font-medium text-mpneutral-400 hover:underline"
          >
            Clear all
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-3">
          <ul className="space-y-1">
            {meals.map((r) => {
              const checked = selected.has(r.slug);
              return (
                <li key={r.slug}>
                  <button
                    onClick={() => onToggle(r.slug)}
                    className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left hover:bg-app-surfaceAlt"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                        checked
                          ? "border-tertiary-300 bg-tertiary-300 text-white"
                          : "border-mpneutral-300 bg-background"
                      }`}
                    >
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          checked
                            ? "text-mpneutral-400"
                            : "text-mpneutral-300 line-through"
                        }`}
                      >
                        {r.name}
                      </div>
                      <div className="text-xs capitalize text-mpneutral-300">
                        {r.category}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-app-border px-5 py-3">
          <button
            onClick={onClose}
            className="w-full rounded-pill bg-tertiary-300 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-tertiary-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
