import { getCategory } from "@/lib/catalog";
import { categoryStyles } from "@/lib/category-styles";
import { cn } from "@/lib/cn";
import type { CategoryId } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";

export function CategoryBadge({ category, className }: { category: CategoryId; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm",
        categoryStyles[category].chip,
        className,
      )}
    >
      <CategoryIcon category={category} className="size-3.5" strokeWidth={1.75} />
      {getCategory(category).short}
    </span>
  );
}
