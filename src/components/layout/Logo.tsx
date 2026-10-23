import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

/** Знак — ампула, наполовину заполненная сывороткой, и название клиники. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-ink", className)}>
      <svg viewBox="0 0 16 28" className="h-7 w-4 shrink-0" aria-hidden="true">
        <rect x="1" y="1" width="14" height="26" rx="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 15h11v5a5.5 5.5 0 0 1-11 0z" fill="#86637F" />
      </svg>
      <span className="font-display text-2xl leading-none tracking-tight">{siteConfig.name}</span>
    </span>
  );
}
