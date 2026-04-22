"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Recipe, RecipeCategory } from "@/data/types";
import { RecipeCard } from "./RecipeCard";
import { Tag } from "./Tag";

const CATEGORIES: { label: string; value: RecipeCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Dinners", value: "dinner" },
  { label: "Soups", value: "soup" },
  { label: "Breakfasts", value: "breakfast" },
  { label: "Lunches", value: "lunch" },
  { label: "Snacks", value: "snack" },
];

const TOOLS = ["Instant Pot", "Air Fryer", "Sheet Pan", "Sauté", "Oven"];

const TIME_BUCKETS = [
  { label: "Any time", min: 0, max: Infinity },
  { label: "Under 20 min", min: 0, max: 20 },
  { label: "Under 40 min", min: 0, max: 40 },
  { label: "Over 40 min", min: 40, max: Infinity },
];

const PROTEIN_BUCKETS = [
  { label: "Any protein", min: 0 },
  { label: "15g+", min: 15 },
  { label: "25g+", min: 25 },
  { label: "35g+", min: 35 },
];

export function RecipesBrowser({
  recipes,
  schedule = {},
}: {
  recipes: Recipe[];
  schedule?: Record<string, string[]>;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<RecipeCategory | "all">("all");
  const [tool, setTool] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [timeBucket, setTimeBucket] = useState(0);
  const [proteinBucket, setProteinBucket] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => r.tags.forEach((t) => set.add(t)));
    const skip = new Set([
      "Dinner",
      "Soup",
      "Breakfast",
      "Lunch",
      "Snack",
      ...TOOLS,
    ]);
    return Array.from(set).filter((t) => !skip.has(t)).sort();
  }, [recipes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tb = TIME_BUCKETS[timeBucket];
    const pb = PROTEIN_BUCKETS[proteinBucket];
    return recipes.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (tool && !r.tags.includes(tool)) return false;
      if (selectedTags.length && !selectedTags.every((t) => r.tags.includes(t)))
        return false;
      const total = (r.prepMin || 0) + (r.cookMin || 0);
      if (total > 0 && (total < tb.min || total > tb.max)) return false;
      if (r.proteinGrams < pb.min) return false;
      if (q && !r.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [recipes, query, category, tool, selectedTags, timeBucket, proteinBucket]);

  const activeFilterCount =
    (tool ? 1 : 0) +
    selectedTags.length +
    (timeBucket !== 0 ? 1 : 0) +
    (proteinBucket !== 0 ? 1 : 0);

  return (
    <div className="pb-6">
      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 pb-3 pt-1 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mpneutral-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes"
            className="w-full rounded-pill border border-mpneutral-200 bg-surface py-3 pl-10 pr-4 text-sm shadow-card outline-none placeholder:text-mpneutral-300 focus:border-primary-300 focus:shadow-ring"
          />
        </div>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`whitespace-nowrap rounded-pill px-3.5 py-1.5 text-sm font-semibold transition ${
                category === c.value
                  ? "bg-primary-300 text-white shadow-card"
                  : "bg-surface text-mpneutral-400 border border-mpneutral-200 hover:border-primary-200"
              }`}
            >
              {c.label}
            </button>
          ))}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`ml-auto inline-flex shrink-0 items-center gap-1 rounded-pill border px-3 py-1.5 text-sm font-semibold ${
              activeFilterCount
                ? "border-secondary-300 bg-secondary-100 text-secondary-400"
                : "border-mpneutral-200 bg-surface text-mpneutral-400"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-secondary-300 px-1 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 space-y-4 rounded-card bg-surface p-4 shadow-card animate-fadeIn">
          <Group label="Tool">
            <PillRow
              items={["", ...TOOLS]}
              value={tool}
              onChange={setTool}
              renderLabel={(v) => v || "Any"}
            />
          </Group>
          <Group label="Total time">
            <PillRow
              items={TIME_BUCKETS.map((_, i) => i)}
              value={timeBucket}
              onChange={setTimeBucket}
              renderLabel={(i) => TIME_BUCKETS[i as number].label}
            />
          </Group>
          <Group label="Protein">
            <PillRow
              items={PROTEIN_BUCKETS.map((_, i) => i)}
              value={proteinBucket}
              onChange={setProteinBucket}
              renderLabel={(i) => PROTEIN_BUCKETS[i as number].label}
            />
          </Group>
          <Group label="Tags">
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => {
                const on = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() =>
                      setSelectedTags((prev) =>
                        on ? prev.filter((x) => x !== t) : [...prev, t]
                      )
                    }
                  >
                    <Tag tone={on ? "tertiary" : "neutral"}>
                      {t} {on && <X className="ml-1 inline h-3 w-3" />}
                    </Tag>
                  </button>
                );
              })}
            </div>
          </Group>
          {activeFilterCount > 0 && (
            <button
              className="text-sm text-primary-400 hover:underline"
              onClick={() => {
                setTool("");
                setSelectedTags([]);
                setTimeBucket(0);
                setProteinBucket(0);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-mpneutral-300">
          No recipes match those filters.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((r, i) => (
            <RecipeCard
              key={r.slug}
              recipe={r}
              priority={i < 4}
              scheduledDates={schedule[r.slug] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-mpneutral-300">
        {label}
      </div>
      {children}
    </div>
  );
}

function PillRow<T extends string | number>({
  items,
  value,
  onChange,
  renderLabel,
}: {
  items: T[];
  value: T;
  onChange: (v: T) => void;
  renderLabel: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={String(it)}
          onClick={() => onChange(it)}
          className={`rounded-pill border px-3 py-1 text-sm ${
            value === it
              ? "border-primary-300 bg-primary-300 text-white"
              : "border-mpneutral-200 bg-white text-mpneutral-400"
          }`}
        >
          {renderLabel(it)}
        </button>
      ))}
    </div>
  );
}
