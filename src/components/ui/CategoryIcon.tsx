import { Droplets, Syringe, WavesHorizontal, Zap, type LucideProps } from "lucide-react";
import type { CategoryId } from "@/lib/types";

const icons = {
  injection: Syringe,
  hardware: WavesHorizontal,
  care: Droplets,
  laser: Zap,
} as const;

export function CategoryIcon({ category, ...props }: { category: CategoryId } & LucideProps) {
  const Icon = icons[category];
  return <Icon aria-hidden="true" {...props} />;
}
