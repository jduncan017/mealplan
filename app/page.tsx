import { Suspense } from "react";
import { calendar } from "@/data/calendar";
import { recipes } from "@/data/recipes";
import { CalendarView } from "@/components/CalendarView";

export default function HomePage() {
  return (
    <Suspense>
      <CalendarView days={calendar} recipes={recipes} />
    </Suspense>
  );
}
