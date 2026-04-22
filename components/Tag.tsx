export function Tag({
  children,
  tone = "neutral",
  size = "sm",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "secondary" | "tertiary" | "cream";
  size?: "sm" | "md";
}) {
  const tones = {
    neutral: "bg-mpneutral-100 text-mpneutral-400 border-mpneutral-200",
    primary: "bg-primary-100 text-primary-400 border-primary-200",
    secondary: "bg-secondary-100 text-secondary-400 border-secondary-200",
    tertiary: "bg-tertiary-100 text-tertiary-400 border-tertiary-200",
    /* cream sits on top of photos; keep text dark regardless of theme */
    cream: "bg-white/95 text-[#1e150e] border-white backdrop-blur",
  } as const;
  const sizes = { sm: "px-2 py-0.5 text-xs", md: "px-2.5 py-1 text-sm" };
  return (
    <span
      className={`inline-flex items-center rounded-pill border ${tones[tone]} ${sizes[size]} font-semibold`}
    >
      {children}
    </span>
  );
}
