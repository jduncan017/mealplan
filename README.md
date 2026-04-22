# May Meal Plan

Personal pregnancy meal planning app for Josh and Emily. Next.js 14 + TypeScript + Tailwind. No auth, no database. Data lives in flat TypeScript modules generated from `May_2026_Meal_Plan.xlsx`.

## Features

- **Calendar** with day, week, and month views for May 2026.
- **Recipes** (53 total: dinners, soups, breakfasts, lunches, snacks) with filters for category, tool, time, protein, and tag plus name search.
- **Recipe detail** with ingredients, method, meta, and print friendly layout.
- **Shopping lists** for 5 weekly blocks, checkable items persisted per week in localStorage.
- **Prep guides** for each Sunday with step checkboxes, persisted in localStorage.
- **Nutrition reference** pulled directly from the spreadsheet.
- **Mobile first** with sticky bottom nav (Lucide icons).
- **Warm palette** defined as CSS variables in `app/globals.css`, wired to Tailwind as `primary`, `secondary`, `tertiary`, `mpneutral` scales (100 to 400).

## Getting started

Requires Node 18+ and Python 3 with `openpyxl` (only for regenerating data modules).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Regenerating data from the spreadsheet

```bash
pip install openpyxl
python3 scripts/extract.py ~/Downloads/May_2026_Meal_Plan.xlsx
```

Writes `data/recipes.ts`, `data/calendar.ts`, `data/shopping.ts`, `data/prep.ts`, `data/nutrition.ts`. Commit the regenerated files.

## Environment

Copy `.env.local.example` to `.env.local` when we wire Unsplash in v2.

```
UNSPLASH_ACCESS_KEY=
```

`next.config.mjs` already whitelists `images.unsplash.com` in `remotePatterns` so flipping `lib/image.ts` to return a real URL works without config changes.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, click **Add New → Project** and import the repo.
3. Framework preset: **Next.js**. Root directory: the repo root. No environment variables required for v1.
4. Click **Deploy**. First build takes 60 to 90 seconds.
5. Assign a custom domain in **Settings → Domains** if you want.

The CLI route is equivalent:

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

## Scripts

- `npm run dev` - local development
- `npm run build` - production build
- `npm run start` - serve a production build locally
- `python3 scripts/extract.py [xlsx-path]` - regenerate data modules

## Structure

```
app/
  page.tsx                  calendar
  recipes/page.tsx          recipes browser
  recipes/[slug]/page.tsx   recipe detail
  shopping/page.tsx         weekly shopping
  prep/[week]/page.tsx      prep guide
  nutrition/page.tsx        nutrition reference
components/                 shared UI (cards, nav, filters)
data/                       generated TypeScript data
lib/                        slug, week, storage, image helpers
scripts/extract.py          one time xlsx to TypeScript
```

## Out of scope for v1

- Unsplash images (scaffolded only, swap in `lib/image.ts`)
- Supabase or any DB
- Auth
- Adding or editing recipes in the UI
- Auto rotation to June
- Ratings, notes, made it yet tracking

## Conventions

- TypeScript strict
- Simple idiomatic React, state via `useState` plus tiny localStorage hook in `lib/storage.ts`
- No em or en dashes in UI copy
