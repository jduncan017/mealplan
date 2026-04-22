import type { Recipe, RecipeCategory, CalendarDay } from "@/data/types";

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

export function resolveMealRecipe(
  text: string,
  category: RecipeCategory,
  recipes: Recipe[],
  opts?: { previousDinner?: Recipe | null }
): Recipe | null {
  if (!text) return null;
  const n = normalize(text);

  if (/leftover/.test(n) && opts?.previousDinner) {
    return opts.previousDinner;
  }

  const pool = recipes.filter((r) => r.category === category);

  for (const r of pool) {
    if (normalize(r.name) === n) return r;
  }

  for (const r of pool) {
    const rn = normalize(r.name);
    if (n.includes(rn) || rn.includes(n)) return r;
  }

  const words = n.split(" ").filter((w) => w.length > 3);
  let best: { recipe: Recipe; score: number } | null = null;
  for (const r of pool) {
    const rn = normalize(r.name);
    const score = words.filter((w) => rn.includes(w)).length;
    if (score >= 2 && (!best || score > best.score)) {
      best = { recipe: r, score };
    }
  }
  return best?.recipe || null;
}

export function previousDayDinner(
  days: CalendarDay[],
  currentDate: string,
  recipes: Recipe[]
): Recipe | null {
  const i = days.findIndex((d) => d.date === currentDate);
  if (i <= 0) return null;
  const prev = days[i - 1];
  return recipes.find((r) => r.slug === prev.dinnerSlug) || null;
}
