export type RecipeCategory = "dinner" | "soup" | "breakfast" | "lunch" | "snack";

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
