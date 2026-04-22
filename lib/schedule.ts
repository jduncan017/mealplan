import type { CalendarDay, Recipe } from "@/data/types";
import { resolveMealRecipe } from "./mealLookup";

export function buildScheduleMap(
  calendar: CalendarDay[],
  recipes: Recipe[]
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const push = (slug: string, date: string) => {
    const arr = map.get(slug) || [];
    if (!arr.includes(date)) arr.push(date);
    map.set(slug, arr);
  };
  for (const d of calendar) {
    if (d.dinnerSlug) push(d.dinnerSlug, d.date);
    const br = resolveMealRecipe(d.breakfast, "breakfast", recipes);
    if (br) push(br.slug, d.date);
    const lu = resolveMealRecipe(d.lunch, "lunch", recipes);
    if (lu) push(lu.slug, d.date);
  }
  return map;
}
