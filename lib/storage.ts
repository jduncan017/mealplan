"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalChecklist(key: string) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setChecks(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(checks));
    } catch {}
  }, [key, checks, loaded]);

  const toggle = useCallback((id: string) => {
    setChecks((c) => ({ ...c, [id]: !c[id] }));
  }, []);

  const reset = useCallback(() => setChecks({}), []);

  return { checks, toggle, reset, loaded };
}
