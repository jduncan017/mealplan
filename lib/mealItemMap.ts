import type {
  CalendarDay,
  PrepWeek,
  Recipe,
  ShoppingItem,
  ShoppingWeek,
} from "@/data/types";
import { resolveMealRecipe, previousDayDinner } from "./mealLookup";
import { prepStepMeals, type PrepStepSegment } from "@/data/prepMeals";

export type MealSlot = "breakfast" | "lunch" | "dinner";

export interface MealEntry {
  id: string;
  date: string;
  dayName: string;
  slot: MealSlot;
  slotLabel: string;
  mealText: string;
  recipe: Recipe | null;
}

const STOPWORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "into",
  "plus",
  "any",
  "all",
  "use",
  "big",
  "small",
  "raw",
  "pack",
  "bag",
  "jar",
  "can",
  "box",
  "lb",
  "oz",
  "tbsp",
  "tsp",
  "cup",
  "cups",
  "bottle",
  "bunch",
  "head",
  "low",
  "high",
  "fat",
  "free",
  "fresh",
  "frozen",
  "dry",
  "powder",
]);

function stripParens(s: string): string {
  return s.replace(/\([^)]*\)/g, " ");
}

function singularize(t: string): string {
  if (t.length > 4 && t.endsWith("ies")) return t.slice(0, -3) + "y";
  if (t.length > 3 && t.endsWith("es")) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}

function tokenize(s: string): string[] {
  const norm = stripParens(s)
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return norm
    .split(" ")
    .map(singularize)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function ingredientTokenSet(recipe: Recipe): Set<string> {
  const tokens = new Set<string>();
  for (const ing of recipe.ingredients) {
    for (const t of tokenize(ing)) tokens.add(t);
  }
  return tokens;
}

const slotLabels: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export function getMealsForWeek(
  weekIndex: number,
  calendar: CalendarDay[],
  recipes: Recipe[]
): MealEntry[] {
  const days = calendar.filter((d) => d.weekIndex === weekIndex);
  const meals: MealEntry[] = [];
  for (const d of days) {
    const prevDinner = previousDayDinner(calendar, d.date, recipes);
    const br = resolveMealRecipe(d.breakfast, "breakfast", recipes, {
      previousDinner: prevDinner,
    });
    const lu = resolveMealRecipe(d.lunch, "lunch", recipes, {
      previousDinner: prevDinner,
    });
    const di = recipes.find((r) => r.slug === d.dinnerSlug) || null;
    const push = (slot: MealSlot, text: string, recipe: Recipe | null) => {
      meals.push({
        id: `${d.date}:${slot}`,
        date: d.date,
        dayName: d.dayName,
        slot,
        slotLabel: slotLabels[slot],
        mealText: text,
        recipe,
      });
    };
    push("breakfast", d.breakfast, br);
    push("lunch", d.lunch, lu);
    push("dinner", d.dinner, di);
  }
  return meals;
}

export function matchItemToMeals(
  item: ShoppingItem,
  meals: MealEntry[]
): MealEntry[] {
  const itemTokens = tokenize(item.name);
  if (itemTokens.length === 0) return [];
  const matched: MealEntry[] = [];
  const seenRecipes = new Map<string, Set<string>>();
  for (const m of meals) {
    if (!m.recipe) continue;
    let tokens = seenRecipes.get(m.recipe.slug);
    if (!tokens) {
      tokens = ingredientTokenSet(m.recipe);
      seenRecipes.set(m.recipe.slug, tokens);
    }
    const all = itemTokens.every((t) => tokens!.has(t));
    if (all) matched.push(m);
  }
  return matched;
}

export interface MealFilterResult {
  meals: MealEntry[];
  itemMatches: Map<string, MealEntry[]>;
}

export function buildWeekMealFilter(
  week: ShoppingWeek,
  weekIndex: number,
  calendar: CalendarDay[],
  recipes: Recipe[]
): MealFilterResult {
  const meals = getMealsForWeek(weekIndex, calendar, recipes);
  const itemMatches = new Map<string, MealEntry[]>();
  for (const section of week.sections) {
    for (let i = 0; i < section.items.length; i++) {
      const id = `${section.name}:${i}:${section.items[i].name}`;
      itemMatches.set(id, matchItemToMeals(section.items[i], meals));
    }
  }
  return { meals, itemMatches };
}

export function itemVisibleForSelection(
  matches: MealEntry[],
  selectedIds: Set<string>
): boolean {
  if (matches.length === 0) return true;
  return matches.some((m) => selectedIds.has(m.id));
}

export interface PrepStepInfo {
  meals: Recipe[];
  base?: string;
  segments: { meals: Recipe[]; text: string }[];
}

export interface PrepMealFilterResult {
  meals: Recipe[];
  stepInfo: Map<string, PrepStepInfo>;
}

export function buildPrepMealFilter(
  prepWeek: PrepWeek,
  weekIndex: number,
  calendar: CalendarDay[],
  recipes: Recipe[]
): PrepMealFilterResult {
  const weekMeals = getMealsForWeek(weekIndex, calendar, recipes);
  const weekSlugs = new Set<string>();
  for (const m of weekMeals) if (m.recipe) weekSlugs.add(m.recipe.slug);

  const bySlug = new Map(recipes.map((r) => [r.slug, r] as const));
  const resolveSlugs = (slugs: string[]): Recipe[] => {
    const out: Recipe[] = [];
    for (const s of slugs) {
      if (!weekSlugs.has(s)) continue;
      const r = bySlug.get(s);
      if (r) out.push(r);
    }
    return out;
  };

  const stepInfo = new Map<string, PrepStepInfo>();
  const seen = new Map<string, Recipe>();
  for (let i = 0; i < prepWeek.steps.length; i++) {
    const step = prepWeek.steps[i];
    const id = `${i}:${step.label}`;
    const mapping = prepStepMeals[`${prepWeek.week}:${i}`];
    if (!mapping) {
      stepInfo.set(id, { meals: [], segments: [] });
      continue;
    }
    const meals = resolveSlugs(mapping.meals);
    for (const r of meals) if (!seen.has(r.slug)) seen.set(r.slug, r);

    const segments = (mapping.segments || [])
      .map((s: PrepStepSegment) => ({
        meals: resolveSlugs(s.meals),
        text: s.text,
      }))
      .filter((s) => s.meals.length > 0);

    stepInfo.set(id, { meals, base: mapping.base, segments });
  }
  return { meals: Array.from(seen.values()), stepInfo };
}

export function stepVisibleForSelection(
  info: PrepStepInfo,
  selectedSlugs: Set<string>
): boolean {
  if (info.meals.length === 0) return true;
  if (info.base) {
    if (info.meals.some((r) => selectedSlugs.has(r.slug))) return true;
    return false;
  }
  if (info.segments.length > 0) {
    return info.segments.some((s) =>
      s.meals.some((r) => selectedSlugs.has(r.slug))
    );
  }
  return info.meals.some((r) => selectedSlugs.has(r.slug));
}

export function composeStepAction(
  info: PrepStepInfo,
  originalAction: string,
  selectedSlugs: Set<string>
): string {
  if (info.segments.length === 0) return originalAction;
  const parts: string[] = [];
  if (info.base) parts.push(info.base);
  for (const s of info.segments) {
    if (s.meals.some((r) => selectedSlugs.has(r.slug))) parts.push(s.text);
  }
  if (parts.length === 0) return originalAction;
  return parts.join(" ");
}

export function selectedStepMeals(
  info: PrepStepInfo,
  selectedSlugs: Set<string>
): Recipe[] {
  return info.meals.filter((r) => selectedSlugs.has(r.slug));
}
