import type {
  CalendarDay,
  IngredientItem,
  IngredientSection,
  Recipe,
  ShoppingItem,
  ShoppingSection,
  ShoppingWeek,
} from "@/data/types";
import { resolveMealRecipe, previousDayDinner } from "./mealLookup";

const SECTION_ORDER: IngredientSection[] = [
  "Proteins",
  "Produce",
  "Dairy/Refrigerated",
  "Bakery",
  "Frozen",
  "Pantry/Dry",
  "Snacks",
  "Other",
];

interface AggKey {
  name: string;
  unit: string;
  section: IngredientSection;
}

interface AggValue {
  qty: number;
  unit: string;
  section: IngredientSection;
  name: string;
  fromRecipes: Set<string>; // recipe names that contribute
}

function aggKey(i: IngredientItem): string {
  return `${i.section}::${i.name.toLowerCase()}::${i.unit.toLowerCase()}`;
}

function formatQty(qty: number, unit: string): string {
  // Render fractional quantities sanely.
  const rounded = Math.round(qty * 100) / 100;
  let qtyStr: string;
  if (Number.isInteger(rounded)) qtyStr = String(rounded);
  else if (Math.abs(rounded - 0.25) < 0.01) qtyStr = "1/4";
  else if (Math.abs(rounded - 0.5) < 0.01) qtyStr = "1/2";
  else if (Math.abs(rounded - 0.75) < 0.01) qtyStr = "3/4";
  else if (Math.abs(rounded - 1.5) < 0.01) qtyStr = "1.5";
  else if (Math.abs(rounded - 2.5) < 0.01) qtyStr = "2.5";
  else qtyStr = String(rounded);
  if (!unit) return qtyStr;
  return `${qtyStr} ${unit}`;
}

const HOUSEHOLD_SIZE = 2; // Josh + Emily. Adjust if household changes.

interface RecipeUsage {
  recipe: Recipe;
  occurrences: number;
}

function resolveWeekRecipes(
  weekIndex: number,
  calendar: CalendarDay[],
  recipes: Recipe[]
): RecipeUsage[] {
  // Count calendar occurrences per recipe. Engine multiplies each batch's
  // ingredients by ceil(occurrences × household ÷ servings).
  const counts = new Map<string, RecipeUsage>();
  const bump = (r: Recipe | null) => {
    if (!r) return;
    const existing = counts.get(r.slug);
    if (existing) existing.occurrences += 1;
    else counts.set(r.slug, { recipe: r, occurrences: 1 });
  };
  const days = calendar.filter((d) => d.weekIndex === weekIndex);
  for (const d of days) {
    const prevDinner = previousDayDinner(calendar, d.date, recipes);
    if (d.dinnerSlug) {
      bump(recipes.find((x) => x.slug === d.dinnerSlug) || null);
    }
    if (!/leftover/i.test(d.breakfast)) {
      bump(resolveMealRecipe(d.breakfast, "breakfast", recipes));
    }
    if (!/leftover/i.test(d.lunch)) {
      bump(resolveMealRecipe(d.lunch, "lunch", recipes, {
        previousDinner: prevDinner,
      }));
    }
  }
  return Array.from(counts.values());
}

export function canDeriveWeek(
  weekIndex: number,
  calendar: CalendarDay[],
  recipes: Recipe[]
): boolean {
  const used = resolveWeekRecipes(weekIndex, calendar, recipes);
  if (used.length === 0) return false;
  // Every used recipe must have structured ingredientItems
  return used.every(
    (u) =>
      Array.isArray(u.recipe.ingredientItems) &&
      u.recipe.ingredientItems.length > 0
  );
}

function batchesNeeded(usage: RecipeUsage): number {
  const servingsPerBatch = usage.recipe.servings || 1;
  const personMealsNeeded = usage.occurrences * HOUSEHOLD_SIZE;
  return Math.max(1, Math.ceil(personMealsNeeded / servingsPerBatch));
}

export function deriveShoppingWeek(
  weekIndex: number,
  calendar: CalendarDay[],
  recipes: Recipe[],
  dateLabel?: string
): ShoppingWeek {
  const used = resolveWeekRecipes(weekIndex, calendar, recipes);

  // Build derivative demand map: cookedName → total cooked qty (already batches-multiplied).
  const derivativeDemand: Record<string, number> = {};
  for (const usage of used) {
    if (!usage.recipe.ingredientItems) continue;
    const batches = batchesNeeded(usage);
    for (const item of usage.recipe.ingredientItems) {
      if (!item.derivedFromBase) continue;
      derivativeDemand[item.name] =
        (derivativeDemand[item.name] || 0) + item.qty * batches;
    }
  }

  const agg: Record<string, AggValue> = {};
  for (const usage of used) {
    if (!usage.recipe.ingredientItems) continue;
    const batches = batchesNeeded(usage);
    // Compute extra raw needed for this recipe's `produces` (if it's a base
    // recipe feeding downstream meals this week).
    let extraRawByIngredient: Record<string, number> = {};
    if (usage.recipe.produces) {
      const p = usage.recipe.produces;
      const demand = derivativeDemand[p.name] || 0;
      if (demand > 0) {
        const extraRaw = demand * p.rawPerCookedQty;
        extraRawByIngredient[p.sourceIngredient] = extraRaw;
      }
    }
    for (const item of usage.recipe.ingredientItems) {
      if (item.pantry) continue;
      if (item.derivedFromBase) continue;
      const key = aggKey(item);
      if (!agg[key]) {
        agg[key] = {
          qty: 0,
          unit: item.unit,
          section: item.section,
          name: item.name,
          fromRecipes: new Set<string>(),
        };
      }
      const extra = extraRawByIngredient[item.name] || 0;
      agg[key].qty += item.qty * batches + extra;
      agg[key].fromRecipes.add(usage.recipe.name);
    }
  }

  // Group by section
  const sectionsMap: Partial<Record<IngredientSection, ShoppingItem[]>> = {};
  for (const key of Object.keys(agg)) {
    const v = agg[key];
    const recipesList: string[] = [];
    v.fromRecipes.forEach((n) => recipesList.push(n));
    recipesList.sort();
    const item: ShoppingItem = {
      name: v.name,
      qty: formatQty(v.qty, v.unit),
      for: recipesList.join(", "),
    };
    if (!sectionsMap[v.section]) sectionsMap[v.section] = [];
    sectionsMap[v.section]!.push(item);
  }

  const sections: ShoppingSection[] = [];
  for (const sec of SECTION_ORDER) {
    const items = sectionsMap[sec];
    if (!items || items.length === 0) continue;
    items.sort((a, b) => a.name.localeCompare(b.name));
    sections.push({ name: sec, items });
  }

  return {
    week: weekIndex,
    dateLabel: dateLabel || `Week ${weekIndex} (auto-derived)`,
    sections,
  };
}
