import { notFound } from "next/navigation";
import Link from "next/link";
import { ChefHat, Clock, Flame, Users, Wrench } from "lucide-react";
import { recipes } from "@/data/recipes";
import { calendar } from "@/data/calendar";
import { Tag } from "@/components/Tag";
import { RecipeImage } from "@/components/RecipeImage";
import { Attribution } from "@/components/Attribution";
import { BackButton } from "@/components/BackButton";
import { getRecipeImage } from "@/lib/image";
import { formatDayShort } from "@/lib/week";

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export default function RecipePage({ params }: { params: { slug: string } }) {
  const recipe = recipes.find((r) => r.slug === params.slug);
  if (!recipe) notFound();

  const scheduled = calendar.filter((d) => d.dinnerSlug === recipe.slug);
  const total = (recipe.prepMin || 0) + (recipe.cookMin || 0);
  const image = getRecipeImage(recipe);

  return (
    <article className="pb-12">
      <div className="no-print mb-3">
        <BackButton />
      </div>

      <div className="relative overflow-hidden rounded-card shadow-card">
        <div className="relative aspect-[16/10] w-full">
          <RecipeImage
            recipe={recipe}
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            fill
          />
          <div className="absolute inset-0 scrim-bottom" />
          <div className="absolute left-4 right-4 bottom-4 text-white">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {recipe.tags.slice(0, 4).map((t) => (
                <Tag key={t} tone="cream">
                  {t}
                </Tag>
              ))}
            </div>
            <h1 className="text-hero font-display text-3xl font-semibold leading-tight text-balance sm:text-4xl">
              {recipe.name}
            </h1>
          </div>
        </div>
      </div>

      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Meta icon={<Flame className="h-4 w-4" />} label="Protein" value={`${recipe.proteinGrams}g`} />
        {recipe.servings && <Meta icon={<Users className="h-4 w-4" />} label="Servings" value={`${recipe.servings}`} />}
        {total > 0 && <Meta icon={<Clock className="h-4 w-4" />} label="Total time" value={`${total} min`} />}
        {recipe.tool && <Meta icon={<Wrench className="h-4 w-4" />} label="Tool" value={recipe.tool} />}
      </section>

      {recipe.notes && (
        <p className="mt-5 rounded-card border-l-4 border-tertiary-300 bg-tertiary-100 p-4 text-base font-medium text-tertiary-400">
          {recipe.notes}
        </p>
      )}

      {recipe.ingredients.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-display text-2xl font-semibold text-mpneutral-400">
            Ingredients
          </h2>
          <ul className="space-y-2 rounded-card bg-surface p-5 shadow-card">
            {recipe.ingredients.map((ing, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-mpneutral-400"
              >
                <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary-300" />
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recipe.steps.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-semibold text-mpneutral-400">
            <ChefHat className="h-6 w-6 text-primary-300" /> Method
          </h2>
          <ol className="space-y-3">
            {recipe.steps.map((step, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-card bg-surface p-4 shadow-card"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-300 text-sm font-semibold text-white font-display">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-mpneutral-400">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {scheduled.length > 0 && (
        <section className="no-print mt-8">
          <h2 className="mb-3 font-display text-xl font-semibold text-mpneutral-400">
            Scheduled for
          </h2>
          <div className="flex flex-wrap gap-2">
            {scheduled.map((d) => (
              <Link
                key={d.date}
                href={`/?view=day&date=${d.date}`}
                className="rounded-pill bg-surface px-3 py-1.5 text-sm font-medium text-primary-400 shadow-card hover:bg-primary-100"
              >
                {d.dayName}, {formatDayShort(d.date)}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8">
        <Attribution attribution={image.attribution} />
      </div>
    </article>
  );
}

function Meta({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "neutral" | "primary";
}) {
  const tones = {
    neutral: "bg-surface",
    primary: "bg-primary-100 text-primary-400",
  };
  return (
    <div className={`rounded-card p-3 shadow-card ${tones[tone]}`}>
      <div className="flex items-center gap-1.5 text-[0.7rem] uppercase tracking-wider text-mpneutral-300">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-mpneutral-400">
        {value}
      </div>
    </div>
  );
}
