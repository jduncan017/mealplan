import type { CalendarDay } from "@/data/types";

export interface MonthInfo {
  key: string; // "YYYY-MM"
  label: string; // "June 2026"
  weekIndexes: number[]; // sorted ascending, unique, global weekIndex values
}

export function monthsInCalendar(calendar: CalendarDay[]): MonthInfo[] {
  const map: Record<string, Set<number>> = {};
  for (const d of calendar) {
    const key = d.date.slice(0, 7);
    if (!map[key]) map[key] = new Set<number>();
    map[key].add(d.weekIndex);
  }
  const out: MonthInfo[] = [];
  for (const key of Object.keys(map)) {
    const [y, m] = key.split("-").map(Number);
    const label = new Date(y, m - 1, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const weekIndexes: number[] = [];
    map[key].forEach((v) => weekIndexes.push(v));
    weekIndexes.sort((a, b) => a - b);
    out.push({ key, label, weekIndexes });
  }
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

export function currentMonthKey(months: MonthInfo[]): string {
  if (months.length === 0) return "";
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (months.some((m) => m.key === key)) return key;
  return months[months.length - 1].key;
}

export function monthForWeekIndex(
  weekIndex: number,
  months: MonthInfo[]
): MonthInfo | null {
  for (const m of months) {
    if (m.weekIndexes.includes(weekIndex)) return m;
  }
  return null;
}

export function localWeekNumber(weekIndex: number, month: MonthInfo): number {
  const i = month.weekIndexes.indexOf(weekIndex);
  return i >= 0 ? i + 1 : weekIndex;
}
