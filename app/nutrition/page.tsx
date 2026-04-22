import { Baby } from "lucide-react";
import { nutrition } from "@/data/nutrition";
import { PageHeader } from "@/components/PageHeader";

export default function NutritionPage() {
  return (
    <>
      <PageHeader title="Nutrition" subtitle="Second trimester reference" />

      {nutrition.intro && (
        <div className="mb-5 flex items-start gap-3 rounded-card border-l-4 border-tertiary-300 bg-surface p-4 text-base text-mpneutral-400 shadow-card">
          <Baby className="mt-0.5 h-5 w-5 shrink-0 text-tertiary-300" />
          <p>{nutrition.intro}</p>
        </div>
      )}

      <div className="space-y-4">
        {nutrition.sections.map((section, idx) => {
          const dotColors = [
            "bg-primary-300",
            "bg-secondary-300",
            "bg-tertiary-300",
            "bg-primary-300",
          ];
          return (
            <section
              key={section.title}
              className="overflow-hidden rounded-card border border-app-border bg-surface shadow-card"
            >
              <div className="flex items-center gap-2 border-b border-app-border px-4 py-3">
                <span
                  className={`h-2 w-2 rounded-full ${dotColors[idx % dotColors.length]}`}
                />
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-mpneutral-400">
                  {section.title}
                </h2>
              </div>
              <dl className="divide-y divide-app-border px-4">
                {section.items.map((item) => (
                  <div key={item.label} className="py-3 first:pt-3 last:pb-4">
                    <dt className="text-sm font-semibold text-mpneutral-400">
                      {item.label}
                    </dt>
                    <dd className="mt-0.5 text-sm leading-relaxed text-mpneutral-300">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </>
  );
}
