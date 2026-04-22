import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import type { Recipe } from "@/data/types";
import { RecipeImage } from "./RecipeImage";
import { Tag } from "./Tag";

const categoryLabel: Record<Recipe["category"], string> = {
  dinner: "Dinner",
  soup: "Soup",
  breakfast: "Breakfast",
  lunch: "Lunch",
  snack: "Snack",
};

function formatMin(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatDateChip(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RecipeCard({
  recipe,
  priority = false,
  scheduledDates = [],
}: {
  recipe: Recipe;
  priority?: boolean;
  scheduledDates?: string[];
}) {
  const total = (recipe.prepMin || 0) + (recipe.cookMin || 0);
  const upcoming = scheduledDates.slice(0, 3);
  const extra = scheduledDates.length - upcoming.length;

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-card border border-app-border bg-surface shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] w-full">
        <RecipeImage
          recipe={recipe}
          sizes="(max-width: 640px) 50vw, 33vw"
          priority={priority}
          fill
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-mpneutral-400/60 to-transparent" />
        <div className="absolute left-2 top-2">
          <Tag tone="cream">{categoryLabel[recipe.category]}</Tag>
        </div>
        {total > 0 && (
          <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-pill bg-white/95 px-2 py-1 text-xs font-bold text-[#1e150e] shadow-card">
            <Clock className="h-3.5 w-3.5" /> {formatMin(total)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-tight text-mpneutral-400 group-hover:text-primary-400">
          {recipe.name}
        </h3>
        {upcoming.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-mpneutral-300" />
            {upcoming.map((d) => (
              <span
                key={d}
                className="rounded-pill border border-app-border bg-background px-1.5 py-0.5 text-[0.7rem] font-semibold text-mpneutral-400"
              >
                {formatDateChip(d)}
              </span>
            ))}
            {extra > 0 && (
              <span className="text-[0.7rem] font-medium text-mpneutral-300">
                +{extra}
              </span>
            )}
          </div>
        ) : (
          <div className="mt-2 text-xs text-mpneutral-300">
            Not scheduled this month
          </div>
        )}
      </div>
    </Link>
  );
}
