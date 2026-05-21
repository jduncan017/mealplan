# Meal Plan Authoring Rules

Read this every time you (Claude) generate a new month's meal plan. The `/plan` page produces a prompt that triggers a generation pass; this doc is the implicit constitution that prompt assumes.

Source-of-truth files referenced below live in `data/`. Always read them fresh — they change.

## 1. Leftover lunch pattern

- Most weekday lunches = previous day's dinner reheat. On the calendar these are rendered as the `leftover-dinner` slug.
- Therefore every dinner recipe must yield **4+ servings**.
- Friday and Saturday lunches may break the pattern (fresh wrap, mason jar salad, etc.) since the prior dinner is usually eaten.

## 2. Sunday prep scope

Every Sunday produces:

- **Make-ahead breakfasts** for the week (some mix of overnight oats, breakfast burritos, egg muffins, parfaits, chia jars). Variety across the week — don't repeat one breakfast all 7 days unless explicitly requested.
- **One Instant Pot meat base** that fuels multiple weekday meals (see §3).
- **Sunday dinner** itself, made while the Instant Pot runs.
- **Cooked snacks only** — hard-boiled eggs, deviled eggs, roasted chickpeas, batch granola, etc. Skip raw/assembly snacks (do not include "wash fruit", "cut veg", "portion nuts" — those happen ad-hoc).
- **~1 freezer-backup item** — raw stuffed pepper, extra burrito, etc. Safety net for a rough week.

A typical Sunday is 4–6 steps total. Don't pad.

## 3. Multi-meal protein bases

Cook one large protein Sunday, portion for downstream meals:

- **Instant Pot shredded chicken** → can fuel Shredded Chicken Street Tacos, Chicken Enchilada Skillet, Buffalo Chicken Stuffed Sweet Potatoes, Buffalo / Mediterranean / Caesar Chicken Wraps.
- **Instant Pot pulled pork** → BBQ Pulled Pork Sandwiches with Slaw, Carnitas Bowls.
- **Beef base** (Mississippi Pot Roast or barbacoa) → next-day Beef Barbacoa Tacos, leftover beef on bowls, Beef and Barley Soup.

Authoring a week: pick **one** base for the Sunday Instant Pot. Plan 2–3 downstream meals using it. If a week wants a second protein base, add a mid-week IP run rather than doubling Sunday.

## 4. Nutrition targets

**Do not hardcode targets in plans. Always read `data/nutrition.ts` for the current month.**

That file is the source of truth for:
- Daily macro/micro targets (protein, iron, folate, calcium, DHA, fiber, hydration, caffeine)
- The full **avoid list** (high-mercury fish, raw/undercooked meat & fish, raw eggs, unheated deli meat, unpasteurized dairy / juice / soft cheese, raw sprouts, alcohol, excess liver)
- High-iron meals and appetite-loss fallbacks

When generating the plan, structure the week so it hits those targets on average. If `nutrition.ts` says "salmon twice a week", schedule salmon twice. If it changes to "salmon once", schedule once. Don't carry numbers in your head.

The avoid list is **strict**. Every recipe used or authored must comply (pasteurized cheese only, eggs fully cooked, meat to safe temps, etc.).

## 5. Shopping structure

Two-tier:

- **Wholesale (`week: 0`)** — monthly bulk run. Proteins (split into freezer portions), dry goods, oils, spices, snacks staples. Updated only when bulk items change month-over-month.
- **Weekly (`week: 1..N`)** — fresh produce, dairy, week-specific extras. Each `ShoppingItem.for` field should describe which meal(s) or theme the item supports.

Group items by section: Proteins, Produce, Dairy/Refrigerated, Pantry/Dry, Snacks, Other.

## 6. Snacks

Maintained as always-available pantry/fridge items. Do not author Sunday prep steps for raw-assembly snacks. Snack recipes in `recipes.ts` are reference cards for what's around, not weekly to-do items.

Exception: snacks that need cooking (hard-boiled eggs, deviled eggs, roasted chickpeas) can land in Sunday prep if the week benefits.

## 7. Prep step authoring (the format rule)

This is the rule that prevents the retrofit problem we hit in May.

**Every prep step in `data/prep.ts` must:**

1. **Use exact recipe names** when referencing what's being prepped. Write "Save 2.5 cups for Chicken Enchilada Skillet" not "Save 2.5 cups for Tue dinner". This keeps the human-readable text linked to the actual recipe corpus.

2. **Have a matching entry in `data/prepMeals.ts`**, keyed by `${week}:${stepIdx}`, with the shape:
   ```ts
   {
     meals: string[];                                  // recipe slugs this step supports
     base?: string;                                    // shared text always shown
     segments?: { meals: string[]; text: string }[];  // per-meal portions
   }
   ```

3. **Decompose multi-meal steps into segments.** If one prep step produces a base that splits between multiple downstream meals, author each portion as its own segment so the UI can trim it cleanly when the user deselects a meal.

   Example — Sunday shredded chicken feeding three meals:
   ```ts
   "4:0": {
     meals: [
       "shredded-chicken-street-tacos",
       "buffalo-chicken-stuffed-sweet-potatoes",
       "chicken-enchilada-skillet",
     ],
     base: "Instant Pot shredded chicken: same method as Week 1. Pressure 15 min + 10 min NR.",
     segments: [
       { meals: ["buffalo-chicken-stuffed-sweet-potatoes"], text: "Save 2.5 cups for Buffalo Chicken Stuffed Sweet Potatoes." },
       { meals: ["chicken-enchilada-skillet"], text: "Save 2.5 cups for Chicken Enchilada Skillet." },
       { meals: ["shredded-chicken-street-tacos"], text: "Use the rest tonight for Shredded Chicken Street Tacos." },
     ],
   },
   ```

4. **Single-meal steps don't need `base` or `segments`** — `{ meals: [slug] }` is enough.

5. **General-prep steps with no downstream meal** use `{ meals: [] }`. They always show in the prep view.

## 8. Seasonality

Plans should reflect the season of the month being generated. The month name in the prompt is your cue.

Rough seasonal leanings (adjust to taste, not rigid):

- **Summer (Jun–Aug)** — lighter, fresher. Salads as full meals (cobb, grain bowl, taco salad). Burgers (turkey or beef) + slaw or corn. Grilled proteins. Cold or no-cook lunches. Sheet-pan with summer veg (zucchini, corn, peppers, tomato). Wraps. **Cut soups hard** — at most one/week, prefer cold soups (gazpacho, chilled cucumber) or skip. More fruit-forward breakfasts and snacks.
- **Fall (Sep–Nov)** — heartier returns. Roasted root veg, butternut squash, sweet potato, brussels sprouts. Soups come back (1–2/week). Chili. Apple/pear breakfasts. Pumpkin notes.
- **Winter (Dec–Feb)** — peak soup/stew/braise. Slow cooker and Instant Pot weight up. Comfort food. Citrus brightens the palette.
- **Spring (Mar–May)** — transitional. Lighter than winter but still warm dishes. Asparagus, peas, radishes, artichokes, leeks. Pesto. One soup/week still fine.

This sits alongside `nutrition.ts` — protein/iron/DHA targets don't change with the season, but how those targets are delivered does (e.g., salmon stays 2×/week year-round, but in summer it might be cold salmon salad rather than sheet pan).

## 9. May data is frozen

May (weeks 1–5) was authored before this doc and uses an older mix of free-form `prep.ts` text + retrofit `prepMeals.ts`. Don't restructure May. The format above is the rule starting **June 2026** and forward.

## 10. File output checklist

For each new month, append to:

- `data/calendar.ts` — `CalendarDay` per date (date, dayName, week, weekIndex, breakfast, lunch, dinner, dinnerSlug, notes, isFreezerBackup). `weekIndex` is **globally unique across all months** — increment from the previous month's last `weekIndex` so prep/shopping URLs (`/prep/{week}`, shopping tabs) stay distinct. Increment on each new Sunday. (e.g., May ended at weekIndex 5; June starts at weekIndex 6.)
- Skip-days (travel, no meals): include the calendar entry with `breakfast: ""`, `lunch: ""`, `dinner: ""`, `dinnerSlug: ""`, and `notes: "Travel — no meals planned"`. Keeps the calendar contiguous.
- `data/prep.ts` — one `PrepWeek` per Sunday, with steps authored per §7.
- `data/prepMeals.ts` — matching mapping entries per §7.
- `data/shopping.ts` — one `ShoppingWeek` per Sunday + update wholesale if bulk changes.
- `data/recipes.ts` — only add new recipes when there's a clear gap. Reference existing slugs whenever possible.
- `data/nutrition.ts` — update only if targets or avoid list change for the new month.

## 11. Audience context

Current audience: pregnant couple (Josh + Emily). Plans must comply with the avoid list in `nutrition.ts`. High protein is a hard target. Easy-cook days matter — don't schedule three 90-min recipes in a row.
