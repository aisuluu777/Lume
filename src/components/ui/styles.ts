import { cn } from "@/lib/cn";

/** Ширина и поля контейнера страницы. */
export const container = "mx-auto w-full max-w-site px-5 sm:px-8 lg:px-10";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-porcelain hover:bg-ink-soft",
  secondary: "border border-ink/15 bg-pearl text-ink hover:border-ink/40",
  quiet: "text-ink hover:bg-ink/5",
  danger: "border border-powder-deep/30 bg-pearl text-powder-deep hover:bg-powder",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string): string {
  return cn(base, variants[variant], sizes[size], extra);
}

export const inputClass =
  "block w-full rounded-2xl border border-line bg-pearl px-4 py-3 text-base text-ink placeholder:text-smoke/60 transition-colors focus:border-mauve focus:outline-none focus:ring-4 focus:ring-mauve/15 aria-[invalid=true]:border-powder-deep";

export const labelClass = "mb-2 block text-sm font-medium text-ink";
