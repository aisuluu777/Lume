import { Clock } from "lucide-react";
import Link from "next/link";
import { getCategory } from "@/lib/catalog";
import { categoryStyles } from "@/lib/category-styles";
import { cn } from "@/lib/cn";
import { formatDuration, formatPrice } from "@/lib/format";
import type { Service } from "@/lib/types";
import { CategoryIcon } from "../ui/CategoryIcon";
import { buttonClass } from "../ui/styles";

/** Карточка услуги, окрашенная в цвет своей категории. */
export function ServiceCard({ service, headingLevel = "h3" }: { service: Service; headingLevel?: "h2" | "h3" }) {
  const styles = categoryStyles[service.category];
  const Heading = headingLevel;

  return (
    <article className={cn("relative flex flex-col rounded-panel p-6 sm:p-7", styles.panel)}>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className={cn("inline-flex items-center gap-2", styles.text)}>
          <CategoryIcon category={service.category} className="size-4" strokeWidth={1.75} />
          {getCategory(service.category).short}
        </span>
        <span className="inline-flex items-center gap-1.5 text-ink/70">
          <Clock className="size-3.5" aria-hidden="true" />
          {formatDuration(service.duration)}
        </span>
      </div>

      <Heading className="mt-10 text-2xl">
        <Link
          href={`/services/${service.slug}`}
          className="after:absolute after:inset-0 after:rounded-panel hover:underline hover:decoration-ink/30 hover:underline-offset-4"
        >
          {service.name}
        </Link>
      </Heading>
      <p className="mt-2 flex-1 text-ink/70">{service.short}</p>

      <div className="mt-8 flex items-end justify-between gap-4 border-t border-ink/10 pt-5">
        <p className="flex min-h-12 flex-col justify-end tabular">
          <span className="text-xl font-medium">{formatPrice(service)}</span>
          {service.priceUnit && service.price > 0 && (
            <span className="block text-sm text-ink/60">{service.priceUnit}</span>
          )}
        </p>
        <Link
          href={`/booking?service=${service.slug}`}
          className={buttonClass("primary", "sm", "relative z-10")}
          aria-label={`Записаться: ${service.name}`}
        >
          Записаться
        </Link>
      </div>
    </article>
  );
}
