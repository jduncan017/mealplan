import { redirect } from "next/navigation";
import { calendar } from "@/data/calendar";
import { prep } from "@/data/prep";
import { todayISO } from "@/lib/week";

export const dynamic = "force-dynamic";

export default function PrepIndex() {
  const todayWeek = calendar.find((d) => d.date === todayISO())?.weekIndex;
  const target =
    (todayWeek && prep.find((p) => p.week === todayWeek)?.week) ||
    prep[0]?.week ||
    1;
  redirect(`/prep/${target}`);
}
