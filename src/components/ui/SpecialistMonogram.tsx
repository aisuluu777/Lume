import { categoryStyles } from "@/lib/category-styles";
import { cn } from "@/lib/cn";
import type { Specialist } from "@/lib/types";

const sizes = {
  sm: "size-10 text-sm",
  md: "size-12 text-base",
  lg: "size-16 text-xl",
};

/** Монограмма специалиста в цвете его основного направления. */
export function SpecialistMonogram({ specialist, size = "md" }: { specialist: Specialist; size?: keyof typeof sizes }) {
  const initials = specialist.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display tracking-wide",
        categoryStyles[specialist.categories[0]].monogram,
        sizes[size],
      )}
    >
      {initials}
    </span>
  );
}
