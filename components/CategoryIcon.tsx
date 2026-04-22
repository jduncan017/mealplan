import { Apple, Drumstick, Egg, Sandwich, Soup } from "lucide-react";
import type { RecipeCategory } from "@/data/types";

const map = {
  dinner: Drumstick,
  soup: Soup,
  breakfast: Egg,
  lunch: Sandwich,
  snack: Apple,
} as const;

export function CategoryIcon({
  category,
  className = "",
}: {
  category: RecipeCategory;
  className?: string;
}) {
  const Icon = map[category];
  return <Icon className={className} strokeWidth={1.75} />;
}

export function CategoryTile({ category }: { category: RecipeCategory }) {
  const palette: Record<RecipeCategory, string> = {
    dinner: "bg-gradient-to-br from-primary-200 to-primary-300 text-white",
    soup: "bg-gradient-to-br from-secondary-200 to-secondary-300 text-secondary-400",
    breakfast:
      "bg-gradient-to-br from-secondary-100 to-secondary-200 text-secondary-400",
    lunch: "bg-gradient-to-br from-tertiary-200 to-tertiary-300 text-white",
    snack: "bg-gradient-to-br from-primary-100 to-secondary-200 text-primary-400",
  };
  return (
    <div
      className={`flex h-24 w-full items-center justify-center rounded-card ${palette[category]}`}
    >
      <CategoryIcon category={category} className="h-10 w-10" />
    </div>
  );
}
