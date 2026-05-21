"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Apple,
  CalendarDays,
  ChefHat,
  ClipboardList,
  ShoppingCart,
} from "lucide-react";

const items = [
  { href: "/", label: "Calendar", icon: CalendarDays, match: (p: string) => p === "/" },
  { href: "/recipes", label: "Recipes", icon: ChefHat, match: (p: string) => p.startsWith("/recipes") },
  { href: "/shopping", label: "Shopping", icon: ShoppingCart, match: (p: string) => p.startsWith("/shopping") },
  { href: "/prep", label: "Prep", icon: ClipboardList, match: (p: string) => p.startsWith("/prep") },
  { href: "/nutrition", label: "Nutrition", icon: Apple, match: (p: string) => p.startsWith("/nutrition") },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/plan")) return null;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t-2 border-app-border bg-surface shadow-navTop no-print pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-2">
        {items.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={`relative flex min-h-[3.25rem] flex-col items-center gap-1 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "text-primary-400"
                    : "text-mpneutral-300 hover:text-mpneutral-400"
                }`}
              >
                {active && (
                  <span className="absolute top-0 h-1 w-10 rounded-b-full bg-primary-300" />
                )}
                <Icon
                  className="h-6 w-6"
                  strokeWidth={active ? 2.4 : 1.9}
                />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
