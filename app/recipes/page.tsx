import { recipes } from "@/data/recipes";
import { calendar } from "@/data/calendar";
import { RecipesBrowser } from "@/components/RecipesBrowser";
import { PageHeader } from "@/components/PageHeader";
import { buildScheduleMap } from "@/lib/schedule";

export default function RecipesPage() {
  const schedule = buildScheduleMap(calendar, recipes);
  const scheduleObj: Record<string, string[]> = {};
  schedule.forEach((v, k) => (scheduleObj[k] = v));
  return (
    <>
      <PageHeader
        title="Recipes"
        subtitle={`${recipes.length} options for May`}
      />
      <RecipesBrowser recipes={recipes} schedule={scheduleObj} />
    </>
  );
}
