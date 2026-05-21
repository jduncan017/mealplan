export type RecipeCategory = "dinner" | "soup" | "breakfast" | "lunch" | "snack";

export type IngredientSection =
  | "Proteins"
  | "Produce"
  | "Dairy/Refrigerated"
  | "Pantry/Dry"
  | "Bakery"
  | "Frozen"
  | "Snacks"
  | "Other";

export interface IngredientItem {
  name: string;             // canonical name, e.g., "Ground turkey (93/7)"
  qty: number;              // numeric quantity per recipe (per default servings)
  unit: string;             // "lb", "oz", "tsp", "tbsp", "cup", "ea", "clove", "bunch", "head", "can", "jar", etc.
  section: IngredientSection;
  pantry?: boolean;         // true = staple, skip on weekly shopping (already on hand)
  derivedFromBase?: boolean; // true = supplied by a base recipe (IP shredded chicken, pulled pork, pot roast). Skip on shopping aggregation.
  prep?: string;            // "diced", "minced", "thinly sliced" — display only
}

export interface RecipeProduces {
  name: string;             // canonical name of the cooked output, e.g., "Shredded cooked chicken"
  qty: number;              // cooked qty that the recipe's standalone ingredients yield (e.g., 6 cups)
  unit: string;             // unit of the cooked output, e.g., "cup"
  sourceIngredient: string; // exact ingredientItem name to scale when downstream demand exceeds base output (e.g., "Boneless skinless chicken thighs")
  rawPerCookedQty: number;  // qty of sourceIngredient (in its declared unit) needed per 1 unit of cooked output (e.g., 0.5 lb raw chicken per 1 cup shredded)
}

export interface Recipe {
  slug: string;
  name: string;
  category: RecipeCategory;
  tool?: string | null;
  proteinGrams: number;
  servings?: number | null;
  prepMin?: number | null;
  cookMin?: number | null;
  tags: string[];
  ingredients: string[];
  ingredientItems?: IngredientItem[]; // structured, used for shopping aggregation
  produces?: RecipeProduces;          // for IP/oven base recipes that feed downstream meals
  steps: string[];
  notes?: string | null;
}

export interface CalendarDay {
  date: string;
  dayName: string;
  week: number;
  weekIndex: number;
  breakfast: string;
  lunch: string;
  dinner: string;
  dinnerSlug: string;
  notes: string;
  isFreezerBackup: boolean;
}

export interface ShoppingItem {
  name: string;
  qty: string;
  for: string;
}

export interface ShoppingSection {
  name: string;
  items: ShoppingItem[];
}

export interface ShoppingWeek {
  week: number;
  dateLabel: string;
  sections: ShoppingSection[];
}

export interface PrepStep {
  label: string;
  action: string;
  approx?: string | null;
}

export interface PrepWeek {
  week: number;
  dateLabel: string;
  steps: PrepStep[];
}

export interface NutritionItem {
  label: string;
  value: string;
}

export interface NutritionSection {
  title: string;
  items: NutritionItem[];
}

export interface Nutrition {
  intro: string;
  sections: NutritionSection[];
}

export interface RecipeImageAttribution {
  name: string;
  username: string;
  photoLink: string;
  userLink: string;
}

export interface RecipeImageData {
  url: string;
  smallUrl: string;
  blurColor?: string;
  alt?: string;
  attribution: RecipeImageAttribution;
}
