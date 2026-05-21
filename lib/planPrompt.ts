import type { Recipe } from "@/data/types";
import {
  dayNameFromISO,
  monthLabel,
  type PlanState,
} from "./planStorage";

function recipeLine(r: Recipe) {
  return `- \`${r.slug}\` — ${r.name} (${r.category}, ${r.proteinGrams}g protein)`;
}

export function buildPrompt(state: PlanState, recipes: Recipe[]): string {
  const bySlug = new Map(recipes.map((r) => [r.slug, r] as const));

  const dates = Object.keys(state.dayMeals).sort();
  const meals: string[] = [];
  for (const date of dates) {
    const d = state.dayMeals[date];
    const slots: string[] = [];
    if (d.breakfast) slots.push("B");
    if (d.lunch) slots.push("L");
    if (d.dinner) slots.push("D");
    if (slots.length === 0) {
      meals.push(`- ${date} (${dayNameFromISO(date)}): SKIP`);
    } else {
      meals.push(
        `- ${date} (${dayNameFromISO(date)}): ${slots.join(", ")}`
      );
    }
  }

  const agains: Recipe[] = [];
  const skips: Recipe[] = [];
  for (const [slug, stance] of Object.entries(state.stances)) {
    const r = bySlug.get(slug);
    if (!r) continue;
    if (stance === "again") agains.push(r);
    else if (stance === "skip") skips.push(r);
  }
  const adds: Recipe[] = state.addRecipes
    .map((s) => bySlug.get(s))
    .filter((r): r is Recipe => !!r);

  const month = monthLabel(state.monthISO);

  return `# Generate ${month} meal plan

Author next month's data files following the existing schemas in this repo.

## Before you start — read these

- \`PLANNING.md\` — authoring rules (leftover lunch pattern, Sunday prep scope, multi-meal protein bases, shopping structure, **prep step format**). The prep step format rule is critical: every \`data/prep.ts\` step must have a matching \`data/prepMeals.ts\` entry with explicit slug mapping + segments.
- \`data/nutrition.ts\` — current month's macro/micro targets + strict avoid list. Plan must hit the targets and comply with the avoid list. **Do not hardcode targets — read this file.**
- \`data/recipes.ts\` — the recipe corpus. Reference by slug; only add new recipes when there's a clear gap.

## Files to update

- \`data/calendar.ts\` — append \`CalendarDay\` entries for every date below. Match existing structure (date, dayName, week, weekIndex, breakfast, lunch, dinner, dinnerSlug, notes, isFreezerBackup). Use ISO week numbers; \`weekIndex\` should restart at 1 for the first Sunday of the new month and increment each Sunday.
- \`data/prep.ts\` — append one \`PrepWeek\` per Sunday with 4–6 \`steps\`. Match Week 1–5 style.
- \`data/shopping.ts\` — append one \`ShoppingWeek\` per Sunday + update or add a wholesale entry (week: 0) if bulk items change.
- \`data/prepMeals.ts\` — add new \`${'`${week}:${stepIdx}`'}\` entries for every prep step, with optional \`base\` + per-meal \`segments\` so the prep page can show step-trimming when meals are deselected. Reference Week 1–5 entries for the pattern.
- \`data/recipes.ts\` — only add new recipes if needed (see notes). Existing recipes must be referenced by slug, not duplicated.
- \`data/nutrition.ts\` — update if the macro story shifts.

## Meal days needed

${meals.join("\n")}

## Last-month recipes to bring back (priority — use these first)

${agains.length ? agains.map(recipeLine).join("\n") : "_(none flagged)_"}

## Avoid these recipes this month

${skips.length ? skips.map(recipeLine).join("\n") : "_(none flagged)_"}

## Surface these library recipes (try to feature)

${adds.length ? adds.map(recipeLine).join("\n") : "_(none flagged)_"}

## Notes

${state.notes.trim() || "_(none)_"}

## Themes / week vibes

${state.themes.trim() || "_(none)_"}

## Goals

- Protein: ${state.proteinTarget || "_(unspecified)_"}
- Calories: ${state.calorieTarget || "_(unspecified)_"}

## Constraints

- Reuse existing recipes wherever possible; only add new recipes if there's a clear gap (and add them to \`data/recipes.ts\` with full ingredient list, steps, slug, category, tags, protein).
- Sunday prep should produce: make-ahead breakfasts (oats/burritos/muffins/parfaits/chia), Sunday dinner, and 1–2 base proteins (Instant Pot batches) that carry into mid-week meals.
- Shopping list rolls up ingredients across the week with sensible sections (Proteins, Produce, Dairy, Pantry, Snacks).
- Maintain \`prepMeals.ts\` segments for any multi-meal prep step so the UI can trim portions when the user skips a meal.
- Keep the calendar contiguous — every listed date must have an entry.
`;
}
