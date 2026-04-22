import Image from "next/image";
import { getRecipeImage, getImageBySlug, type ResolvedImage } from "@/lib/image";
import type { Recipe, RecipeCategory } from "@/data/types";
import { CategoryIcon } from "./CategoryIcon";

const placeholderTone: Record<RecipeCategory, string> = {
  dinner: "bg-gradient-to-br from-primary-200 to-primary-300 text-white",
  soup: "bg-gradient-to-br from-secondary-200 to-secondary-300 text-white",
  breakfast:
    "bg-gradient-to-br from-secondary-100 to-secondary-200 text-secondary-400",
  lunch: "bg-gradient-to-br from-tertiary-200 to-tertiary-300 text-white",
  snack: "bg-gradient-to-br from-primary-100 to-tertiary-200 text-primary-400",
};

type BaseProps = {
  sizes?: string;
  priority?: boolean;
  className?: string;
  fill?: boolean;
};

type Props =
  | (BaseProps & { recipe: Recipe })
  | (BaseProps & { slug: string; category: RecipeCategory; name: string });

function resolve(p: Props): ResolvedImage {
  if ("recipe" in p) return getRecipeImage(p.recipe);
  return getImageBySlug(p.slug, p.category, p.name);
}

export function RecipeImage(props: Props) {
  const img = resolve(props);
  const sizes = props.sizes || "(max-width: 768px) 50vw, 33vw";
  const priority = props.priority;
  const className = props.className || "";
  const position = props.fill ? "absolute inset-0" : "relative";

  if (img.kind === "remote" && img.url) {
    return (
      <div
        className={`${position} overflow-hidden ${className}`}
        style={{ backgroundColor: img.blurColor || "#eadfcb" }}
      >
        <Image
          src={img.url}
          alt={img.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${position} flex items-center justify-center ${placeholderTone[img.category]} ${className}`}
    >
      <CategoryIcon category={img.category} className="h-12 w-12 opacity-90" />
    </div>
  );
}
