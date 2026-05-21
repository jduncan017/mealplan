"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalIcon,
  Check,
  ChefHat,
  ClipboardCopy,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import type { Recipe, RecipeCategory } from "@/data/types";
import { recipes as allRecipes } from "@/data/recipes";
import { calendar } from "@/data/calendar";
import { buildScheduleMap } from "@/lib/schedule";
import { PageHeader } from "./PageHeader";
import {
  dayNameFromISO,
  monthLabel,
  usePlanState,
  type RecipeStance,
} from "@/lib/planStorage";
import { buildPrompt } from "@/lib/planPrompt";

type Step = 1 | 2 | 3;

export function PlanWizard() {
  const plan = usePlanState();
  const [step, setStep] = useState<Step>(1);

  const usedSlugs = useMemo(() => {
    const map = buildScheduleMap(calendar, allRecipes);
    return new Set(map.keys());
  }, []);

  const HIDDEN_SLUGS = useMemo(() => new Set(["leftover-dinner"]), []);

  const lastMonthRecipes = useMemo(
    () =>
      allRecipes.filter(
        (r) => usedSlugs.has(r.slug) && !HIDDEN_SLUGS.has(r.slug)
      ),
    [usedSlugs, HIDDEN_SLUGS]
  );

  const libraryRecipes = useMemo(
    () =>
      allRecipes.filter(
        (r) => !usedSlugs.has(r.slug) && !HIDDEN_SLUGS.has(r.slug)
      ),
    [usedSlugs, HIDDEN_SLUGS]
  );

  if (!plan.loaded) {
    return (
      <div className="py-12 text-center text-mpneutral-300">Loading plan…</div>
    );
  }

  return (
    <div className="-mx-4 sm:mx-[calc(50%-50vw)] sm:w-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <PageHeader
          title="Meal Plan Generator"
          subtitle={`Build instructions for ${monthLabel(plan.state.monthISO)}`}
          right={<StepperHeader step={step} onJump={setStep} />}
        />

        {step === 1 && (
          <Step1Calendar
            plan={plan}
            onNext={() => setStep(2)}
            onReset={() => {
              if (confirm("Reset all planning data?")) plan.resetAll();
            }}
          />
        )}
        {step === 2 && (
          <Step2Recipes
            plan={plan}
            lastMonthRecipes={lastMonthRecipes}
            libraryRecipes={libraryRecipes}
            onPrev={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3Generate
            plan={plan}
            recipes={allRecipes}
            onPrev={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}

function StepperHeader({
  step,
  onJump,
}: {
  step: Step;
  onJump: (s: Step) => void;
}) {
  const steps: { n: Step; label: string; icon: React.ReactNode }[] = [
    { n: 1, label: "Days & meals", icon: <CalIcon className="h-4 w-4" /> },
    { n: 2, label: "Recipes", icon: <ChefHat className="h-4 w-4" /> },
    { n: 3, label: "Generate", icon: <Sparkles className="h-4 w-4" /> },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, idx) => {
        const active = s.n === step;
        const done = s.n < step;
        return (
          <div key={s.n} className="flex items-center gap-1.5">
            <button
              onClick={() => onJump(s.n)}
              className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "bg-primary-300 text-white shadow-card"
                  : done
                  ? "bg-primary-100 text-primary-400"
                  : "bg-surface border border-mpneutral-200 text-mpneutral-300"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                  active
                    ? "bg-white text-primary-400"
                    : done
                    ? "bg-primary-300 text-white"
                    : "bg-mpneutral-200 text-mpneutral-300"
                }`}
              >
                {done ? <Check className="h-2.5 w-2.5" /> : s.n}
              </span>
              {s.label}
            </button>
            {idx < steps.length - 1 && (
              <span className="text-mpneutral-300">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Step1Calendar({
  plan,
  onNext,
  onReset,
}: {
  plan: ReturnType<typeof usePlanState>;
  onNext: () => void;
  onReset: () => void;
}) {
  const [yStr, mStr] = plan.state.monthISO.split("-");
  const year = Number(yStr);
  const month = Number(mStr);

  const dates = useMemo(
    () => Object.keys(plan.state.dayMeals).sort(),
    [plan.state.dayMeals]
  );

  const firstDayOfWeek = new Date(`${plan.state.monthISO}T00:00:00`).getDay();
  const leadingBlanks = Array.from({ length: firstDayOfWeek });
  const trailingBlanksCount =
    (7 - ((firstDayOfWeek + dates.length) % 7)) % 7;
  const trailingBlanks = Array.from({ length: trailingBlanksCount });

  const monthOptions = useMemo(() => {
    const out: string[] = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      out.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
      );
    }
    return out;
  }, []);

  const totalMealCount = useMemo(() => {
    let n = 0;
    for (const date of dates) {
      const d = plan.state.dayMeals[date];
      if (d.breakfast) n++;
      if (d.lunch) n++;
      if (d.dinner) n++;
    }
    return n;
  }, [dates, plan.state.dayMeals]);

  return (
    <div className="space-y-4">
      <div className="rounded-card bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-mpneutral-400">
            Target month:
            <select
              value={plan.state.monthISO}
              onChange={(e) => plan.setMonth(e.target.value)}
              className="rounded-pill border border-mpneutral-200 bg-background px-3 py-1 text-sm"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => plan.setAllMeals(true)}
              className="rounded-pill border border-mpneutral-200 bg-background px-3 py-1 font-medium text-mpneutral-400 hover:border-primary-300 hover:text-primary-400"
            >
              Check all
            </button>
            <button
              onClick={() => plan.setAllMeals(false)}
              className="rounded-pill border border-mpneutral-200 bg-background px-3 py-1 font-medium text-mpneutral-400 hover:border-primary-300 hover:text-primary-400"
            >
              Clear all
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-pill border border-mpneutral-200 bg-background px-3 py-1 font-medium text-mpneutral-400 hover:border-primary-300 hover:text-primary-400"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
            <span className="ml-2 text-mpneutral-300">
              {totalMealCount} meals selected
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-card border-l border-t border-app-border bg-surface shadow-card">
        <div className="grid grid-cols-7">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="border-b border-r border-app-border bg-app-surfaceAlt py-2 text-center text-sm font-bold uppercase tracking-wider text-mpneutral-300"
            >
              {d}
            </div>
          ))}
          {leadingBlanks.map((_, i) => (
            <div
              key={`blank-${i}`}
              className="border-b border-r border-app-border bg-mpneutral-100/40"
            />
          ))}
          {dates.map((date) => {
            const d = plan.state.dayMeals[date];
            const dayNum = Number(date.split("-")[2]);
            const allOn = d.breakfast && d.lunch && d.dinner;
            const allOff = !d.breakfast && !d.lunch && !d.dinner;
            return (
              <div
                key={date}
                className={`flex flex-col gap-2 border-b border-r border-app-border p-3 text-left transition ${
                  allOff ? "bg-mpneutral-100 opacity-60" : "bg-background"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl font-bold text-mpneutral-400">
                    {dayNum}
                  </span>
                  <button
                    onClick={() =>
                      plan.updateDay(date, {
                        breakfast: !allOn,
                        lunch: !allOn,
                        dinner: !allOn,
                      })
                    }
                    className="text-xs font-semibold text-primary-400 hover:underline"
                  >
                    {allOn ? "Skip" : "All"}
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <MealCheck
                    label="Breakfast"
                    checked={d.breakfast}
                    onChange={(v) => plan.updateDay(date, { breakfast: v })}
                  />
                  <MealCheck
                    label="Lunch"
                    checked={d.lunch}
                    onChange={(v) => plan.updateDay(date, { lunch: v })}
                  />
                  <MealCheck
                    label="Dinner"
                    checked={d.dinner}
                    onChange={(v) => plan.updateDay(date, { dinner: v })}
                  />
                </div>
              </div>
            );
          })}
          {trailingBlanks.map((_, i) => (
            <div
              key={`tblank-${i}`}
              className="border-b border-r border-app-border bg-mpneutral-100/40"
            />
          ))}
        </div>
      </div>

      <NavBar onNext={onNext} canNext={totalMealCount > 0} />
    </div>
  );
}

function MealCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition ${
        checked
          ? "bg-primary-300 text-white"
          : "bg-mpneutral-200 text-mpneutral-300 hover:bg-mpneutral-200/80"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2 ${
          checked
            ? "border-white bg-white text-primary-400"
            : "border-mpneutral-300 bg-background"
        }`}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

function Step2Recipes({
  plan,
  lastMonthRecipes,
  libraryRecipes,
  onPrev,
  onNext,
}: {
  plan: ReturnType<typeof usePlanState>;
  lastMonthRecipes: Recipe[];
  libraryRecipes: Recipe[];
  onPrev: () => void;
  onNext: () => void;
}) {
  const [tab, setTab] = useState<"last" | "library">("last");

  const grouped = useMemo(() => {
    const list = tab === "last" ? lastMonthRecipes : libraryRecipes;
    const by = new Map<RecipeCategory, Recipe[]>();
    for (const r of list) {
      const arr = by.get(r.category) || [];
      arr.push(r);
      by.set(r.category, arr);
    }
    const order: RecipeCategory[] = [
      "dinner",
      "soup",
      "breakfast",
      "lunch",
      "snack",
    ];
    return order
      .map((cat) => ({ cat, list: by.get(cat) || [] }))
      .filter((g) => g.list.length > 0);
  }, [tab, lastMonthRecipes, libraryRecipes]);

  const counts = useMemo(() => {
    let again = 0;
    let skip = 0;
    for (const [, st] of Object.entries(plan.state.stances)) {
      if (st === "again") again++;
      else if (st === "skip") skip++;
    }
    return {
      again,
      skip,
      add: plan.state.addRecipes.length,
    };
  }, [plan.state.stances, plan.state.addRecipes]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-card bg-surface p-3 shadow-card">
        <button
          onClick={() => setTab("last")}
          className={`rounded-pill px-3 py-1.5 text-sm font-semibold transition ${
            tab === "last"
              ? "bg-primary-300 text-white shadow-card"
              : "bg-background text-mpneutral-400 hover:text-primary-400"
          }`}
        >
          Last month ({lastMonthRecipes.length})
        </button>
        <button
          onClick={() => setTab("library")}
          className={`rounded-pill px-3 py-1.5 text-sm font-semibold transition ${
            tab === "library"
              ? "bg-tertiary-300 text-white shadow-card"
              : "bg-background text-mpneutral-400 hover:text-tertiary-400"
          }`}
        >
          Library ({libraryRecipes.length})
        </button>
        <span className="ml-auto text-xs text-mpneutral-300">
          ⭐ {counts.again} · 🚫 {counts.skip} · + {counts.add} from library
        </span>
      </div>

      {tab === "last" ? (
        <div className="space-y-3">
          {grouped.map(({ cat, list }) => (
            <section
              key={cat}
              className="overflow-hidden rounded-card border border-app-border bg-surface shadow-card"
            >
              <div className="border-b border-app-border px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-mpneutral-400">
                {cat}
              </div>
              <ul className="divide-y divide-app-border">
                {list.map((r) => (
                  <RecipeStanceRow
                    key={r.slug}
                    recipe={r}
                    stance={plan.state.stances[r.slug] || "neutral"}
                    onSet={(s) => plan.setStance(r.slug, s)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ cat, list }) => (
            <section
              key={cat}
              className="overflow-hidden rounded-card border border-app-border bg-surface shadow-card"
            >
              <div className="border-b border-app-border px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-mpneutral-400">
                {cat}
              </div>
              <ul className="divide-y divide-app-border">
                {list.map((r) => {
                  const added = plan.state.addRecipes.includes(r.slug);
                  return (
                    <li key={r.slug}>
                      <button
                        onClick={() => plan.toggleAddRecipe(r.slug)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-app-surfaceAlt"
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                            added
                              ? "border-tertiary-300 bg-tertiary-300 text-white"
                              : "border-mpneutral-300 bg-background"
                          }`}
                        >
                          {added && <Check className="h-3 w-3" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-mpneutral-400">
                            {r.name}
                          </div>
                          <div className="text-xs text-mpneutral-300">
                            {r.proteinGrams}g protein
                            {r.tool ? ` · ${r.tool}` : ""}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <NavBar onPrev={onPrev} onNext={onNext} canNext />
    </div>
  );
}

function RecipeStanceRow({
  recipe,
  stance,
  onSet,
}: {
  recipe: Recipe;
  stance: RecipeStance;
  onSet: (s: RecipeStance) => void;
}) {
  const setOrClear = (s: RecipeStance) => onSet(stance === s ? "neutral" : s);
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-mpneutral-400">
          {recipe.name}
        </div>
        <div className="text-xs text-mpneutral-300">
          {recipe.proteinGrams}g protein
          {recipe.tool ? ` · ${recipe.tool}` : ""}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <StanceButton
          active={stance === "again"}
          tone="good"
          onClick={() => setOrClear("again")}
          label="Again"
          icon={<Check className="h-3.5 w-3.5" />}
        />
        <StanceButton
          active={stance === "skip"}
          tone="bad"
          onClick={() => setOrClear("skip")}
          label="Skip"
          icon={<X className="h-3.5 w-3.5" />}
        />
      </div>
    </li>
  );
}

function StanceButton({
  active,
  tone,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  tone: "good" | "bad";
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  const activeClass =
    tone === "good"
      ? "bg-secondary-300 text-white"
      : "bg-mpneutral-300 text-white";
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold transition ${
        active
          ? activeClass
          : "bg-background border border-mpneutral-200 text-mpneutral-400 hover:border-primary-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Step3Generate({
  plan,
  recipes,
  onPrev,
}: {
  plan: ReturnType<typeof usePlanState>;
  recipes: Recipe[];
  onPrev: () => void;
}) {
  const prompt = useMemo(
    () => buildPrompt(plan.state, recipes),
    [plan.state, recipes]
  );
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("Copy failed. Select the text and copy manually.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-mpneutral-300">
            Protein target
          </span>
          <input
            type="text"
            value={plan.state.proteinTarget}
            onChange={(e) => plan.setField("proteinTarget", e.target.value)}
            className="rounded-card border border-mpneutral-200 bg-surface px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-mpneutral-300">
            Calorie target
          </span>
          <input
            type="text"
            value={plan.state.calorieTarget}
            onChange={(e) => plan.setField("calorieTarget", e.target.value)}
            className="rounded-card border border-mpneutral-200 bg-surface px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-mpneutral-300">
          Themes / week vibes
        </span>
        <input
          type="text"
          value={plan.state.themes}
          onChange={(e) => plan.setField("themes", e.target.value)}
          placeholder="e.g. Mediterranean week, more soups, comfort food week"
          className="rounded-card border border-mpneutral-200 bg-surface px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-mpneutral-300">
          Notes
        </span>
        <textarea
          value={plan.state.notes}
          onChange={(e) => plan.setField("notes", e.target.value)}
          rows={4}
          placeholder="Anything else — dietary swaps, scheduling notes, guests, etc."
          className="resize-y rounded-card border border-mpneutral-200 bg-surface px-3 py-2 text-sm focus:border-primary-300 focus:outline-none"
        />
      </label>

      <div className="overflow-hidden rounded-card border border-app-border bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-app-border px-4 py-3">
          <div>
            <h2 className="font-display text-base font-bold text-mpneutral-400">
              Generated prompt
            </h2>
            <p className="text-xs text-mpneutral-300">
              Copy and paste into your Cursor / Claude Code session.
            </p>
          </div>
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1 rounded-pill bg-primary-300 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-primary-400"
          >
            <ClipboardCopy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <textarea
          readOnly
          value={prompt}
          rows={20}
          className="block w-full resize-y bg-background p-4 font-mono text-xs leading-relaxed text-mpneutral-400 focus:outline-none"
        />
      </div>

      <NavBar onPrev={onPrev} />
    </div>
  );
}

function NavBar({
  onPrev,
  onNext,
  canNext,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  canNext?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      {onPrev ? (
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-1 rounded-pill border border-mpneutral-200 bg-surface px-4 py-2 text-sm font-semibold text-mpneutral-400 shadow-card hover:text-primary-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      ) : (
        <div />
      )}
      {onNext && (
        <button
          onClick={onNext}
          disabled={!canNext}
          className={`inline-flex items-center gap-1 rounded-pill px-5 py-2 text-sm font-semibold text-white shadow-card transition ${
            canNext
              ? "bg-primary-300 hover:bg-primary-400"
              : "bg-mpneutral-300 cursor-not-allowed"
          }`}
        >
          Next <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
