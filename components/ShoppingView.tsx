"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  ListChecks,
  Package,
  RotateCcw,
  ShoppingCart,
  X,
} from "lucide-react";
import type { ShoppingWeek } from "@/data/types";
import { useLocalChecklist } from "@/lib/storage";
import { PageHeader } from "./PageHeader";
import { calendar } from "@/data/calendar";
import { recipes } from "@/data/recipes";
import { todayISO } from "@/lib/week";
import {
  buildWeekMealFilter,
  itemVisibleForSelection,
  type MealEntry,
} from "@/lib/mealItemMap";
import {
  currentMonthKey,
  localWeekNumber,
  monthForWeekIndex,
  monthsInCalendar,
} from "@/lib/months";
import {
  canDeriveWeek,
  deriveShoppingWeek,
} from "@/lib/shoppingFromRecipes";

export function ShoppingView({ weeks }: { weeks: ShoppingWeek[] }) {
  const params = useSearchParams();
  const qsParam = params.get("week");
  const qsWeek = qsParam !== null ? Number(qsParam) : NaN;
  const hasQs = qsParam !== null && weeks.some((w) => w.week === qsWeek);
  const todayWeek = calendar.find((d) => d.date === todayISO())?.weekIndex;

  const months = useMemo(() => monthsInCalendar(calendar), []);
  const initialMonthKey = useMemo(() => {
    if (hasQs) {
      const m = monthForWeekIndex(qsWeek, months);
      if (m) return m.key;
    }
    if (todayWeek) {
      const m = monthForWeekIndex(todayWeek, months);
      if (m) return m.key;
    }
    return currentMonthKey(months);
  }, [hasQs, qsWeek, todayWeek, months]);

  const [monthKey, setMonthKey] = useState<string>(initialMonthKey);
  const month = months.find((m) => m.key === monthKey) || months[0];

  const firstRealInMonth = month?.weekIndexes[0] || 1;
  const initial = hasQs
    ? qsWeek
    : (todayWeek && month?.weekIndexes.includes(todayWeek) && todayWeek) ||
      firstRealInMonth;

  const [week, setWeek] = useState<number>(initial);

  useEffect(() => {
    if (hasQs) setWeek(qsWeek);
  }, [hasQs, qsWeek]);

  useEffect(() => {
    if (!month) return;
    if (week === 0) return;
    if (!month.weekIndexes.includes(week)) {
      setWeek(month.weekIndexes[0]);
    }
  }, [month, week]);

  const effectiveWeeks = useMemo(() => {
    // For each non-wholesale week in this month, prefer derived shopping
    // (from recipe ingredientItems aggregated across the week's meals) when
    // every used recipe has structured items. Otherwise fall back to the
    // hand-authored ShoppingWeek entry.
    if (!month) return weeks;
    const next = [...weeks];
    for (const idx of month.weekIndexes) {
      if (idx === 0) continue;
      if (!canDeriveWeek(idx, calendar, recipes)) continue;
      const existing = next.find((w) => w.week === idx);
      const dateLabel = existing?.dateLabel || `Week ${idx}`;
      const derived = deriveShoppingWeek(idx, calendar, recipes, dateLabel);
      const i = next.findIndex((w) => w.week === idx);
      if (i >= 0) next[i] = derived;
      else next.push(derived);
    }
    return next;
  }, [weeks, month]);

  const visibleWeeks = useMemo(() => {
    const wholesale = effectiveWeeks.find((w) => w.week === 0);
    const monthly = month
      ? effectiveWeeks.filter((w) => month.weekIndexes.includes(w.week))
      : [];
    return wholesale ? [wholesale, ...monthly] : monthly;
  }, [effectiveWeeks, month]);

  const current = effectiveWeeks.find((w) => w.week === week) || effectiveWeeks[0];
  const { checks, toggle, reset, loaded } = useLocalChecklist(
    `shopping:week:${current.week}`
  );

  const mealFilter = useMemo(() => {
    if (current.week === 0) return null;
    return buildWeekMealFilter(current, current.week, calendar, recipes);
  }, [current]);

  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (!mealFilter) {
      setSelectedMeals(new Set());
      return;
    }
    setSelectedMeals(new Set(mealFilter.meals.map((m) => m.id)));
  }, [mealFilter]);

  const visibleSections = useMemo(() => {
    return current.sections.map((section) => {
      const items = section.items
        .map((item, i) => ({
          item,
          i,
          id: `${section.name}:${i}:${item.name}`,
        }))
        .filter(({ id }) => {
          if (!mealFilter) return true;
          const matches = mealFilter.itemMatches.get(id) || [];
          return itemVisibleForSelection(matches, selectedMeals);
        });
      return { section, items };
    });
  }, [current, mealFilter, selectedMeals]);

  const totalItems = useMemo(
    () => visibleSections.reduce((n, s) => n + s.items.length, 0),
    [visibleSections]
  );
  const doneCount = useMemo(() => {
    let n = 0;
    for (const { items } of visibleSections) {
      for (const { id } of items) if (checks[id]) n++;
    }
    return n;
  }, [visibleSections, checks]);

  const mealsByDay = useMemo(() => {
    if (!mealFilter) return [];
    const groups = new Map<
      string,
      { date: string; dayName: string; meals: MealEntry[] }
    >();
    for (const m of mealFilter.meals) {
      let g = groups.get(m.date);
      if (!g) {
        g = { date: m.date, dayName: m.dayName, meals: [] };
        groups.set(m.date, g);
      }
      g.meals.push(m);
    }
    return Array.from(groups.values());
  }, [mealFilter]);

  const totalMeals = mealFilter?.meals.length ?? 0;
  const selectedCount = selectedMeals.size;
  const filterActive = mealFilter !== null && selectedCount < totalMeals;

  const toggleMeal = (id: string) => {
    setSelectedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAllMeals = () => {
    if (!mealFilter) return;
    setSelectedMeals(new Set(mealFilter.meals.map((m) => m.id)));
  };
  const clearAllMeals = () => setSelectedMeals(new Set());

  return (
    <>
      <PageHeader
        title={current.week === 0 ? "Wholesale" : "Shopping"}
        subtitle={current.dateLabel}
        right={
          <div className="no-print flex items-center gap-2">
            {mealFilter && (
              <button
                onClick={() => setFilterOpen(true)}
                className={`inline-flex items-center gap-1 rounded-pill border px-3 py-1.5 text-xs font-medium shadow-card transition ${
                  filterActive
                    ? "border-primary-300 bg-primary-100 text-primary-400"
                    : "border-mpneutral-200 bg-surface text-mpneutral-400 hover:text-primary-400"
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
            onChange={(e) => setMonthKey(e.target.value)}
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
        {visibleWeeks.map((w) => {
          const isWholesale = w.week === 0;
          const active = w.week === current.week;
          const localNum = month ? localWeekNumber(w.week, month) : w.week;
          return (
            <button
              key={w.week}
              onClick={() => setWeek(w.week)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-sm font-semibold transition ${
                active
                  ? isWholesale
                    ? "bg-tertiary-300 text-white shadow-card"
                    : "bg-primary-300 text-white shadow-card"
                  : isWholesale
                  ? "bg-surface border border-tertiary-200 text-tertiary-400 hover:border-tertiary-300"
                  : "bg-surface border border-mpneutral-200 text-mpneutral-400 hover:border-primary-200"
              }`}
            >
              {isWholesale && <Package className="h-3.5 w-3.5" />}
              {isWholesale ? "Wholesale" : `Week ${localNum}`}
            </button>
          );
        })}
      </div>

      {loaded && (
        <div className="mb-4 flex items-center gap-3 rounded-card bg-surface p-4 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-400">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-mpneutral-400">
              {doneCount} of {totalItems} items
              {filterActive && (
                <span className="ml-2 text-xs font-normal text-mpneutral-300">
                  ({totalMeals - selectedCount} meal
                  {totalMeals - selectedCount === 1 ? "" : "s"} skipped)
                </span>
              )}
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
        {visibleSections.map(({ section, items }) => {
          if (items.length === 0) return null;
          return (
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
                {items.map(({ item, id }) => {
                  const checked = !!checks[id];
                  const matches = mealFilter?.itemMatches.get(id) || [];
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
                          {matches.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {matches.map((m) => (
                                <span
                                  key={m.id}
                                  className="inline-flex items-center rounded-pill bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-400"
                                >
                                  {m.dayName} {m.slotLabel}
                                </span>
                              ))}
                            </div>
                          ) : (
                            item.for && (
                              <div className="text-xs text-mpneutral-300">
                                {item.for}
                              </div>
                            )
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {filterOpen && mealFilter && (
        <MealFilterModal
          mealsByDay={mealsByDay}
          selected={selectedMeals}
          onToggle={toggleMeal}
          onSelectAll={selectAllMeals}
          onClearAll={clearAllMeals}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </>
  );
}

function MealFilterModal({
  mealsByDay,
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
  onClose,
}: {
  mealsByDay: { date: string; dayName: string; meals: MealEntry[] }[];
  selected: Set<string>;
  onToggle: (id: string) => void;
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
              Cooking this week?
            </h2>
            <p className="text-xs text-mpneutral-300">
              Uncheck meals you&apos;ll skip. Items only used by skipped meals
              are hidden.
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
            className="font-medium text-primary-400 hover:underline"
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
          {mealsByDay.map((day) => (
            <div key={day.date} className="mb-4 last:mb-0">
              <h3 className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-mpneutral-300">
                {day.dayName}
              </h3>
              <ul className="space-y-1">
                {day.meals.map((m) => {
                  const checked = selected.has(m.id);
                  return (
                    <li key={m.id}>
                      <button
                        onClick={() => onToggle(m.id)}
                        className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left hover:bg-app-surfaceAlt"
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                            checked
                              ? "border-primary-300 bg-primary-300 text-white"
                              : "border-mpneutral-300 bg-background"
                          }`}
                        >
                          {checked && <Check className="h-3 w-3" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold uppercase tracking-wider text-mpneutral-300">
                            {m.slotLabel}
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              checked
                                ? "text-mpneutral-400"
                                : "text-mpneutral-300 line-through"
                            }`}
                          >
                            {m.mealText}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-app-border px-5 py-3">
          <button
            onClick={onClose}
            className="w-full rounded-pill bg-primary-300 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-primary-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
