"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Snowflake,
  ShoppingCart,
  ClipboardList,
  StickyNote,
} from "lucide-react";
import type { CalendarDay, Recipe, RecipeCategory } from "@/data/types";
import { CategoryIcon } from "./CategoryIcon";
import { Tag } from "./Tag";
import { RecipeImage } from "./RecipeImage";
import { formatDayLong, formatDayShort, isWeekend } from "@/lib/week";
import { PageHeader } from "./PageHeader";
import { resolveMealRecipe, previousDayDinner } from "@/lib/mealLookup";

type ViewMode = "day" | "week" | "month";

function isViewMode(v: string | null): v is ViewMode {
  return v === "day" || v === "week" || v === "month";
}

export function CalendarView({
  days,
  recipes,
}: {
  days: CalendarDay[];
  recipes: Recipe[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const dateParam = params.get("date");
  const viewParam = params.get("view");
  const cursor =
    dateParam && days.some((x) => x.date === dateParam)
      ? dateParam
      : days[0].date;
  const mode: ViewMode = isViewMode(viewParam) ? viewParam : "week";

  const updateUrl = useCallback(
    (next: { mode?: ViewMode; cursor?: string }) => {
      const q = new URLSearchParams(params.toString());
      q.set("view", next.mode ?? mode);
      q.set("date", next.cursor ?? cursor);
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [params, mode, cursor, pathname, router]
  );

  const setMode = useCallback(
    (m: ViewMode) => updateUrl({ mode: m }),
    [updateUrl]
  );
  const setCursor = useCallback(
    (c: string) => updateUrl({ cursor: c }),
    [updateUrl]
  );

  const recipeBySlug = useMemo(() => {
    const m = new Map<string, Recipe>();
    recipes.forEach((r) => m.set(r.slug, r));
    return m;
  }, [recipes]);

  const currentDay = days.find((d) => d.date === cursor) || days[0];
  const weekDays = useMemo(
    () => days.filter((d) => d.weekIndex === currentDay.weekIndex),
    [days, currentDay.weekIndex]
  );

  const shiftDay = useCallback(
    (delta: number) => {
      const i = days.findIndex((d) => d.date === cursor);
      const next = days[Math.max(0, Math.min(days.length - 1, i + delta))];
      if (next) setCursor(next.date);
    },
    [days, cursor]
  );

  const shiftWeek = useCallback(
    (delta: number) => {
      const nextIdx = currentDay.weekIndex + delta;
      const first = days.find((d) => d.weekIndex === nextIdx);
      if (first) setCursor(first.date);
    },
    [days, currentDay.weekIndex]
  );

  return (
    <>
      <PageHeader
        title="May 2026"
        subtitle="Meal plan for Josh and Emily"
        right={<ViewSwitcher mode={mode} onChange={setMode} />}
      />

      {mode === "day" && (
        <DayView
          day={currentDay}
          days={days}
          recipes={recipes}
          recipe={recipeBySlug.get(currentDay.dinnerSlug)}
          onPrev={() => shiftDay(-1)}
          onNext={() => shiftDay(1)}
        />
      )}
      {mode === "week" && (
        <WeekView
          weekDays={weekDays}
          recipeBySlug={recipeBySlug}
          onSelect={(d) => updateUrl({ cursor: d, mode: "day" })}
          onPrev={() => shiftWeek(-1)}
          onNext={() => shiftWeek(1)}
          weekIndex={currentDay.weekIndex}
        />
      )}
      {mode === "month" && (
        <MonthView
          days={days}
          recipeBySlug={recipeBySlug}
          cursor={cursor}
          onSelect={(d) => updateUrl({ cursor: d, mode: "day" })}
        />
      )}
    </>
  );
}

function ViewSwitcher({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-pill border border-app-border bg-surface p-1 text-sm shadow-card">
      {(["day", "week", "month"] as ViewMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`rounded-pill px-3.5 py-1.5 font-semibold capitalize transition ${
            mode === m
              ? "bg-primary-300 text-white shadow-card"
              : "text-mpneutral-300 hover:text-mpneutral-400"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

function Nav({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        onClick={onPrev}
        aria-label="Previous"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-card text-mpneutral-400 transition hover:text-primary-400 hover:shadow-lift"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="font-display text-lg font-semibold tracking-tight text-mpneutral-400">
        {label}
      </div>
      <button
        onClick={onNext}
        aria-label="Next"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-card text-mpneutral-400 transition hover:text-primary-400 hover:shadow-lift"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function DayView({
  day,
  days,
  recipes,
  recipe,
  onPrev,
  onNext,
}: {
  day: CalendarDay;
  days: CalendarDay[];
  recipes: Recipe[];
  recipe?: Recipe;
  onPrev: () => void;
  onNext: () => void;
}) {
  const prevDinner = previousDayDinner(days, day.date, recipes);
  const breakfastRecipe = resolveMealRecipe(day.breakfast, "breakfast", recipes);
  const lunchRecipe = resolveMealRecipe(day.lunch, "lunch", recipes, {
    previousDinner: prevDinner,
  });

  return (
    <section className="animate-fadeIn">
      <Nav label={formatDayLong(day.date)} onPrev={onPrev} onNext={onNext} />

      {recipe && (
        <Link
          href={`/recipes/${recipe.slug}`}
          className="group relative mb-4 block overflow-hidden rounded-card shadow-card transition hover:shadow-lift"
        >
          <div className="relative aspect-[16/9] w-full">
            <RecipeImage
              recipe={recipe}
              sizes="(max-width: 768px) 100vw, 768px"
              fill
            />
            <div className="absolute inset-0 scrim-bottom" />
            <div className="absolute left-4 right-4 bottom-4 text-white">
              <div className="text-hero mb-1 text-xs font-bold uppercase tracking-widest">
                Dinner
              </div>
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-hero font-display text-2xl font-semibold leading-tight sm:text-3xl">
                  {day.dinner}
                </h2>
                <span className="rounded-pill bg-white px-2.5 py-1 text-sm font-bold text-[#0d7368] shadow-card">
                  {recipe.proteinGrams}g
                </span>
              </div>
            </div>
            {day.isFreezerBackup && (
              <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-pill bg-tertiary-300 px-2.5 py-1 text-xs font-bold text-white shadow-card">
                <Snowflake className="h-3.5 w-3.5" /> Freezer backup
              </div>
            )}
          </div>
        </Link>
      )}

      <div className="overflow-hidden rounded-card border border-app-border bg-surface shadow-card">
        <Meal
          label="Breakfast"
          category="breakfast"
          text={day.breakfast}
          recipe={breakfastRecipe}
          accent="secondary"
        />
        <Meal
          label="Lunch"
          category="lunch"
          text={day.lunch}
          recipe={lunchRecipe}
          accent="tertiary"
          isLeftover={/leftover/i.test(day.lunch)}
        />
      </div>

      {day.notes && (
        <div className="mt-4 flex items-start gap-3 rounded-card border-l-4 border-tertiary-300 bg-tertiary-100 p-4">
          <StickyNote className="mt-0.5 h-5 w-5 shrink-0 text-tertiary-400" />
          <p className="text-base font-medium leading-relaxed text-tertiary-400">
            {day.notes}
          </p>
        </div>
      )}
    </section>
  );
}

function Meal({
  label,
  category,
  text,
  recipe,
  accent,
  isLeftover = false,
}: {
  label: string;
  category: RecipeCategory;
  text: string;
  recipe: Recipe | null;
  accent: "primary" | "secondary" | "tertiary";
  isLeftover?: boolean;
}) {
  const accentBg = {
    primary: "bg-primary-100",
    secondary: "bg-secondary-100",
    tertiary: "bg-tertiary-100",
  }[accent];
  const accentText = {
    primary: "text-primary-400",
    secondary: "text-secondary-400",
    tertiary: "text-tertiary-400",
  }[accent];

  const body = (
    <div className="flex items-center gap-4 p-4">
      {recipe ? (
        <RecipeImage
          recipe={recipe}
          sizes="80px"
          className="h-16 w-16 shrink-0 overflow-hidden rounded-card"
        />
      ) : (
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-card ${accentBg} ${accentText}`}
        >
          <CategoryIcon category={category} className="h-8 w-8" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div
          className={`text-xs font-bold uppercase tracking-wider ${accentText}`}
        >
          {label}
          {isLeftover && (
            <span className="ml-1.5 rounded-pill bg-mpneutral-200 px-1.5 py-0.5 text-[0.65rem] text-mpneutral-400">
              Leftover
            </span>
          )}
        </div>
        <div className="mt-0.5 font-display text-lg font-semibold leading-tight text-mpneutral-400">
          {text}
        </div>
        {recipe && (
          <div className="mt-1 text-sm text-mpneutral-300">
            {recipe.proteinGrams}g protein
          </div>
        )}
      </div>
    </div>
  );

  if (recipe) {
    return (
      <Link
        href={`/recipes/${recipe.slug}`}
        className="block border-b-2 border-app-border transition hover:bg-mpneutral-100/40 last:border-0"
      >
        {body}
      </Link>
    );
  }
  return (
    <div className="border-b-2 border-app-border last:border-0">{body}</div>
  );
}

function WeekView({
  weekDays,
  recipeBySlug,
  onSelect,
  onPrev,
  onNext,
  weekIndex,
}: {
  weekDays: CalendarDay[];
  recipeBySlug: Map<string, Recipe>;
  onSelect: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
  weekIndex: number;
}) {
  const first = weekDays[0];
  const last = weekDays[weekDays.length - 1];
  const label =
    first && last
      ? `Week ${weekIndex} · ${formatDayShort(first.date)} to ${formatDayShort(last.date)}`
      : `Week ${weekIndex}`;

  return (
    <section className="animate-fadeIn">
      <Nav label={label} onPrev={onPrev} onNext={onNext} />

      <div className="space-y-2.5">
        {weekDays.map((d) => (
          <DayListItem
            key={d.date}
            day={d}
            recipe={recipeBySlug.get(d.dinnerSlug)}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href={`/shopping?week=${weekIndex}`}
          className="flex items-center justify-center gap-2 rounded-card bg-primary-300 py-3.5 text-base font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
        >
          <ShoppingCart className="h-5 w-5" /> Week {weekIndex} shopping
        </Link>
        <Link
          href={`/prep/${weekIndex}`}
          className="flex items-center justify-center gap-2 rounded-card bg-secondary-300 py-3.5 text-base font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
        >
          <ClipboardList className="h-5 w-5" /> Week {weekIndex} prep
        </Link>
      </div>
    </section>
  );
}

function MonthView({
  days,
  recipeBySlug,
  cursor,
  onSelect,
}: {
  days: CalendarDay[];
  recipeBySlug: Map<string, Recipe>;
  cursor: string;
  onSelect: (date: string) => void;
}) {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const first = new Date("2026-05-01T00:00:00");
  const startOffset = first.getDay();
  const cells: ({ date: string; day: CalendarDay } | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let day = 1; day <= 31; day++) {
    const iso = `2026-05-${String(day).padStart(2, "0")}`;
    const d = byDate.get(iso);
    if (d) cells.push({ date: iso, day: d });
    else cells.push(null);
  }

  return (
    <section className="animate-fadeIn">
      <div className="space-y-2.5 sm:hidden">
        {days.map((d) => (
          <DayListItem
            key={d.date}
            day={d}
            recipe={recipeBySlug.get(d.dinnerSlug)}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className="hidden sm:block">
      <div className="grid grid-cols-7 gap-1 px-1 pb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-xs font-bold uppercase tracking-wider text-mpneutral-300"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) => {
          if (!cell)
            return <div key={i} className="aspect-square rounded-md" />;
          const { date, day } = cell;
          const active = date === cursor;
          const recipe = recipeBySlug.get(day.dinnerSlug);
          return (
            <button
              key={i}
              onClick={() => onSelect(date)}
              className={`group relative aspect-square overflow-hidden rounded-md shadow-card transition hover:-translate-y-0.5 hover:shadow-lift ${
                active
                  ? "ring-2 ring-primary-300 ring-offset-2 ring-offset-background"
                  : ""
              }`}
            >
              {recipe ? (
                <RecipeImage
                  recipe={recipe}
                  sizes="80px"
                  fill
                />
              ) : (
                <div className="absolute inset-0 bg-mpneutral-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-mpneutral-400/45 to-transparent" />
              <div className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1e150e] shadow-card">
                {Number(date.slice(8, 10))}
              </div>
              {day.isFreezerBackup && (
                <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-tertiary-300">
                  <Snowflake className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      </div>
    </section>
  );
}

function DayListItem({
  day,
  recipe,
  onSelect,
}: {
  day: CalendarDay;
  recipe?: Recipe;
  onSelect: (date: string) => void;
}) {
  const weekend = isWeekend(day.dayName);
  return (
    <button
      onClick={() => onSelect(day.date)}
      className="flex w-full items-stretch gap-3 overflow-hidden rounded-card border border-app-border bg-surface text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div
        className={`flex w-14 shrink-0 flex-col items-center justify-center py-3 text-white sm:w-16 ${
          weekend ? "bg-secondary-300" : "bg-primary-300"
        }`}
      >
        <span className="font-display text-[0.65rem] font-bold uppercase tracking-wider sm:text-xs">
          {day.dayName.slice(0, 3)}
        </span>
        <span className="font-display text-xl font-semibold leading-none sm:text-2xl">
          {day.date.slice(8, 10)}
        </span>
      </div>
      <div className="flex-1 min-w-0 space-y-1 py-2.5 pr-3">
        <MealLine label="B" text={day.breakfast} />
        <MealLine label="L" text={day.lunch} />
        <MealLine label="D" text={day.dinner} />
      </div>
      {day.isFreezerBackup && (
        <div className="flex items-center pr-2">
          <Snowflake className="h-4 w-4 text-tertiary-300" />
        </div>
      )}
      {recipe && (
        <div className="relative w-20 shrink-0 sm:w-28">
          <RecipeImage recipe={recipe} sizes="112px" fill />
        </div>
      )}
    </button>
  );
}

function MealLine({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="w-3 shrink-0 font-bold text-mpneutral-300">{label}</span>
      <span className="truncate text-mpneutral-400">{text}</span>
    </div>
  );
}
