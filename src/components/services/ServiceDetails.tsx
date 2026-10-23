import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDuration, formatPriceWithUnit } from "@/lib/format";
import type { Service } from "@/lib/types";
import { CategoryBadge } from "../ui/CategoryBadge";

/** Подробности услуги — используются и в модальном окне каталога, и на странице услуги. */
export function ServiceDetails({ service, showTitle = true }: { service: Service; showTitle?: boolean }) {
  return (
    <div>
      <CategoryBadge category={service.category} />
      {showTitle && <p className="mt-4 font-display text-3xl leading-tight sm:text-4xl">{service.name}</p>}
      <p className="mt-3 text-lg text-smoke">{service.short}</p>

      <dl
        className={cn(
          "mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line",
          service.sessions ? "sm:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        <div className="bg-pearl p-4">
          <dt className="text-sm text-smoke">Стоимость</dt>
          <dd className="mt-1 font-medium tabular text-ink">{formatPriceWithUnit(service)}</dd>
        </div>
        <div className="bg-pearl p-4">
          <dt className="text-sm text-smoke">Длительность</dt>
          <dd className="mt-1 font-medium text-ink">{formatDuration(service.duration)}</dd>
        </div>
        {service.sessions && (
          <div className="bg-pearl p-4">
            <dt className="text-sm text-smoke">Курс</dt>
            <dd className="mt-1 font-medium text-ink">{service.sessions}</dd>
          </div>
        )}
      </dl>

      <p className="mt-6 text-ink/90">{service.description}</p>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <DetailList title="Эффект" items={service.effects} />
        <DetailList title="Показания" items={service.indications} />
      </div>

      {service.contraindications.length > 0 && (
        <div className="mt-8 rounded-2xl bg-porcelain p-5">
          <h3 className="font-sans text-sm font-medium tracking-normal text-ink">Противопоказания</h3>
          <p className="mt-2 text-sm text-smoke">
            {sentenceList(service.contraindications)}. Полный список врач уточнит на консультации перед процедурой.
          </p>
        </div>
      )}
    </div>
  );
}

/** «Беременность, герпес в активной фазе, …» — первая буква только у первого пункта. */
function sentenceList(items: string[]): string {
  return items.map((item, index) => (index === 0 ? item : item.charAt(0).toLowerCase() + item.slice(1))).join(", ");
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-sans text-sm font-medium tracking-normal text-ink">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-ink/85">
            <Check className="mt-1 size-4 shrink-0 text-mauve" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
