import type { Recipe, RecipeCategory, RecipeImageData } from "@/data/types";

let imageMap: Record<string, RecipeImageData> = {};
try {
  // Loaded lazily to tolerate missing file during early dev.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  imageMap = require("@/data/images").images as Record<string, RecipeImageData>;
} catch {
  imageMap = {};
}

export interface ResolvedImage {
  kind: "remote" | "placeholder";
  url?: string;
  smallUrl?: string;
  blurColor?: string;
  alt: string;
  category: RecipeCategory;
  attribution?: RecipeImageData["attribution"];
}

export function getRecipeImage(recipe: Recipe): ResolvedImage {
  const hit = imageMap[recipe.slug];
  if (hit?.url) {
    return {
      kind: "remote",
      url: hit.url,
      smallUrl: hit.smallUrl || hit.url,
      blurColor: hit.blurColor,
      alt: hit.alt || recipe.name,
      category: recipe.category,
      attribution: hit.attribution,
    };
  }
  return {
    kind: "placeholder",
    alt: recipe.name,
    category: recipe.category,
  };
}

export function getImageBySlug(
  slug: string,
  category: RecipeCategory,
  name: string
): ResolvedImage {
  const hit = imageMap[slug];
  if (hit?.url) {
    return {
      kind: "remote",
      url: hit.url,
      smallUrl: hit.smallUrl || hit.url,
      blurColor: hit.blurColor,
      alt: hit.alt || name,
      category,
      attribution: hit.attribution,
    };
  }
  return { kind: "placeholder", alt: name, category };
}
