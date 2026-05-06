# Meal Plan — Vision & Roadmap

## One-line pitch
AI plans your week of meals around your dietary preferences so you stop deciding what to eat.

## Problem
Deciding what to cook is daily friction. Existing apps dump huge recipe libraries on you and still leave the planning, shopping, and prep work undone. Pregnant, busy, or recovering parents (the original audience) want a single weekly answer, not another browse experience.

## Audience
- Primary: busy households (couples, new parents, pregnancy)
- Secondary: solo cooks who batch-prep on Sundays
- Tertiary: people on specific diets (high-protein, low-FODMAP, gluten-free, etc.) who want plans that actually respect them

## Promise
- Open the app → see this week's meals → done
- Plan adapts to your dietary rules, dislikes, and favorites
- Shopping list and Sunday prep generated from the plan
- Edit anything: swap a recipe, change a photo, mark a dislike — the AI learns

## Pricing model
| Tier | Price | What you get |
|---|---|---|
| Free | $0 | 2 AI-generated weekly plans total. Full recipe browse, shopping list, prep guide for those weeks. |
| Plus | ~$6/mo or $48/yr | Unlimited weekly plans, full month planning, recipe edits saved, photo replacement, favorites/dislikes, AI learns preferences over time |
| Family (later) | ~$10/mo | Up to 4 profiles with shared plan + per-person dietary rules |

Conversion lever: free user finishes their second week, sees "plan week 3" CTA, paywall.

## Feature list

### MVP (web, what we have now + small additions)
- [x] Calendar (day / week / month views)
- [x] Recipe browser with filters
- [x] Recipe detail pages
- [x] Shopping list per week
- [x] Sunday prep guide
- [x] Nutrition summary
- [x] Mobile-first PWA, installable on iOS/Android
- [ ] Onboarding: dietary preferences quiz (allergies, diet style, dislikes, household size, cooking time budget, tools owned)
- [ ] AI weekly plan generation (calls LLM with preferences + recipe corpus)
- [ ] Account + auth (so plans persist across devices)
- [ ] Stripe billing + free-tier counter

### V1 paid features
- [ ] Edit any recipe (ingredients, steps, times) — saved to your account, doesn't affect others
- [ ] Replace recipe photo (upload or pick from Unsplash)
- [ ] Favorite / dislike toggle on every recipe
- [ ] AI re-plan: "regenerate this week" or "swap Tuesday's dinner"
- [ ] Month-view planning (5 weeks ahead)
- [ ] Export shopping list (Apple Reminders, Google Keep, plain text, share sheet)

### V2 polish
- [ ] AI learns from feedback over time (weight favorites, avoid disliked ingredients)
- [ ] "Use what's in my fridge" mode — paste/photo your inventory, plan around it
- [ ] Pantry tracking
- [ ] Calorie / macro targets per profile
- [ ] Leftover-aware planning (Tuesday dinner becomes Wednesday lunch automatically)

### V3 (native phone app)
- [ ] React Native (Expo) wrapper sharing types/data layer with web
- [ ] Push notifications: "Time to start dinner", "Sunday prep tomorrow"
- [ ] Apple Health / Google Fit nutrition sync
- [ ] Widgets: today's meals on home screen
- [ ] Apple Watch glance: what's for dinner

### V4 social/growth
- [ ] Share a plan with a partner (read + edit)
- [ ] Public recipe contributions (moderated)
- [ ] Affiliate grocery delivery (Instacart, Amazon Fresh)

## Tech direction

### Now (web MVP)
- Next.js 14 + Tailwind, deployed Vercel
- Flat TypeScript data files for recipes (one-time seed)
- No backend yet

### Adding accounts + AI
- Supabase (Postgres + auth + storage for user photos)
- LLM: Anthropic Claude API for plan generation (structured output: array of {date, breakfast, lunch, dinner})
- Stripe for billing, Stripe customer portal for self-serve

### Going native
- Expo + React Native, share `data/`, `lib/`, types
- Replace Next.js routes with Expo Router
- Web stays alive as marketing site + PWA fallback

## Differentiation vs competitors
| Competitor | Their angle | Our edge |
|---|---|---|
| Mealime, PlateJoy | Recipe library + manual planning | We plan FOR you with AI |
| Eat This Much | Macro-driven | We're preference + life-stage driven (pregnancy, recovery, busy parents) |
| Whisk, Paprika | Recipe organizer | We're outcome-focused (this week's dinner is decided) |
| ChatGPT freeform | Free | We have shopping list, prep guide, photo, mobile UI, learning loop |

## Open questions
- Recipe corpus: scrape + license, partner with a food site, or generate via AI per user?
- How do we handle recipe edits — fork-and-save per user, or shared edit graph?
- Photo replacement at scale — user uploads (storage cost) vs Unsplash search picker
- Pregnancy-specific positioning: lead with it, or general "busy households" with pregnancy as a featured use case?

## Success metrics
- Activation: % of free users who complete onboarding and see week 1
- Retention: % who come back week 2 (the second free week)
- Conversion: % who hit paywall and pay
- North star: weekly plans generated (proxies for "decisions removed")

## 90-day plan
1. **Weeks 1–2**: dietary onboarding flow + Supabase auth
2. **Weeks 3–5**: AI plan generation against current 53-recipe corpus
3. **Weeks 6–7**: Stripe + free-tier limit + paywall
4. **Weeks 8–9**: Recipe edit + favorite/dislike
5. **Weeks 10–12**: launch, recruit 50 beta users, iterate
