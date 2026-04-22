import type { RecipeImageAttribution } from "@/data/types";

export function Attribution({
  attribution,
  className = "",
}: {
  attribution?: RecipeImageAttribution;
  className?: string;
}) {
  if (!attribution || !attribution.name) return null;
  const ref = "?utm_source=may_meal_plan&utm_medium=referral";
  return (
    <p className={`text-xs text-mpneutral-300 ${className}`}>
      Photo by{" "}
      <a
        href={`${attribution.userLink}${ref}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-mpneutral-200 hover:text-primary-400 hover:decoration-primary-300"
      >
        {attribution.name}
      </a>{" "}
      on{" "}
      <a
        href={`https://unsplash.com/${ref}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-mpneutral-200 hover:text-primary-400 hover:decoration-primary-300"
      >
        Unsplash
      </a>
    </p>
  );
}
