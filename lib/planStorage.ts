"use client";

import { useCallback, useEffect, useState } from "react";
import { calendar } from "@/data/calendar";

export type RecipeStance = "again" | "skip" | "neutral";

export interface DayMeals {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface PlanState {
  monthISO: string; // YYYY-MM-01 (first of target month)
  dayMeals: Record<string, DayMeals>; // keyed by YYYY-MM-DD
  stances: Record<string, RecipeStance>; // recipe slug → stance
  addRecipes: string[]; // slugs to surface
  notes: string;
  proteinTarget: string;
  calorieTarget: string;
  themes: string;
}

const STORAGE_KEY = "plan:wizard:v1";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function dayNameFromISO(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return dayNames[d.getDay()];
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function defaultMonthISO(): string {
  let latest = "";
  for (const d of calendar) if (d.date > latest) latest = d.date;
  if (!latest) {
    const today = new Date();
    return isoDate(today.getFullYear(), today.getMonth() + 2, 1);
  }
  const [y, m] = latest.split("-").map(Number);
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  return isoDate(nextYear, nextMonth, 1);
}

export function listDates(monthISO: string): string[] {
  const [y, m] = monthISO.split("-").map(Number);
  const total = daysInMonth(y, m);
  const out: string[] = [];
  for (let d = 1; d <= total; d++) out.push(isoDate(y, m, d));
  return out;
}

export function emptyDayMeals(): DayMeals {
  return { breakfast: true, lunch: true, dinner: true };
}

function defaultState(): PlanState {
  const monthISO = defaultMonthISO();
  const dates = listDates(monthISO);
  const dayMeals: Record<string, DayMeals> = {};
  for (const d of dates) dayMeals[d] = emptyDayMeals();
  return {
    monthISO,
    dayMeals,
    stances: {},
    addRecipes: [],
    notes: "",
    proteinTarget: "35-45g per main meal",
    calorieTarget: "1800-2200/day",
    themes: "",
  };
}

export function usePlanState() {
  const [state, setState] = useState<PlanState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...defaultState(), ...parsed });
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, loaded]);

  const setMonth = useCallback((monthISO: string) => {
    setState((s) => {
      const dates = listDates(monthISO);
      const dayMeals: Record<string, DayMeals> = {};
      for (const d of dates) dayMeals[d] = s.dayMeals[d] || emptyDayMeals();
      return { ...s, monthISO, dayMeals };
    });
  }, []);

  const updateDay = useCallback(
    (date: string, patch: Partial<DayMeals>) => {
      setState((s) => ({
        ...s,
        dayMeals: {
          ...s.dayMeals,
          [date]: { ...(s.dayMeals[date] || emptyDayMeals()), ...patch },
        },
      }));
    },
    []
  );

  const setAllMeals = useCallback((value: boolean) => {
    setState((s) => {
      const next: Record<string, DayMeals> = {};
      for (const date of Object.keys(s.dayMeals)) {
        next[date] = {
          ...s.dayMeals[date],
          breakfast: value,
          lunch: value,
          dinner: value,
        };
      }
      return { ...s, dayMeals: next };
    });
  }, []);

  const setStance = useCallback(
    (slug: string, stance: RecipeStance) => {
      setState((s) => {
        const next = { ...s.stances };
        if (stance === "neutral") delete next[slug];
        else next[slug] = stance;
        return { ...s, stances: next };
      });
    },
    []
  );

  const toggleAddRecipe = useCallback((slug: string) => {
    setState((s) => {
      const has = s.addRecipes.includes(slug);
      return {
        ...s,
        addRecipes: has
          ? s.addRecipes.filter((x) => x !== slug)
          : [...s.addRecipes, slug],
      };
    });
  }, []);

  const setField = useCallback(<K extends keyof PlanState>(key: K, value: PlanState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState());
  }, []);

  return {
    state,
    loaded,
    setMonth,
    updateDay,
    setAllMeals,
    setStance,
    toggleAddRecipe,
    setField,
    resetAll,
  };
}

export function monthLabel(monthISO: string): string {
  const d = new Date(monthISO + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
