import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { formatDateLong, formatDuration, formatPriceWithUnit } from "@/lib/format";
import type { Service, Specialist } from "@/lib/types";

interface BookingSummaryProps {
  service: Service | undefined;
  specialist: Specialist | null | undefined;
  date: string;
  time: string;
  onEdit: (step: number) => void;
}

export function BookingSummary({ service, specialist, date, time, onEdit }: BookingSummaryProps) {
  const rows = [
    { step: 1, label: "Процедура", value: service?.name },
    { step: 2, label: "Специалист", value: service ? (specialist ? specialist.name : "Любой свободный") : undefined },
    { step: 3, label: "Дата и время", value: date && time ? `${formatDateLong(date)}, ${time}` : undefined },
  ];

  return (
    <div className="rounded-panel border border-line bg-pearl p-6 lg:sticky lg:top-28">
      <h2 className="text-xl">Ваша запись</h2>
      <dl className="mt-4 divide-y divide-line">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 py-3.5">
            <div className="min-w-0">
              <dt className="text-sm text-smoke">{row.label}</dt>
              <dd className={cn("mt-0.5", row.value ? "text-ink" : "text-ink/40")}>{row.value ?? "Не выбрано"}</dd>
            </div>
            {row.value && (
              <button
                type="button"
                onClick={() => onEdit(row.step)}
                className="shrink-0 rounded-full px-2 py-1 text-sm text-mauve hover:bg-ink/5"
                aria-label={`Изменить: ${row.label.toLowerCase()}`}
              >
                Изменить
              </button>
            )}
          </div>
        ))}
        {service && (
          <div className="grid grid-cols-2 gap-4 py-3.5">
            <div>
              <dt className="text-sm text-smoke">Длительность</dt>
              <dd className="mt-0.5 text-ink">{formatDuration(service.duration)}</dd>
            </div>
            <div>
              <dt className="text-sm text-smoke">Стоимость</dt>
              <dd className="mt-0.5 tabular text-ink">{formatPriceWithUnit(service)}</dd>
            </div>
          </div>
        )}
      </dl>
      <p className="mt-4 text-sm text-smoke">
        Точную стоимость врач назовёт после осмотра. Перенести или отменить запись можно по телефону{" "}
        <a href={`tel:${siteConfig.contacts.phoneHref}`} className="whitespace-nowrap text-ink hover:text-mauve">
          {siteConfig.contacts.phone}
        </a>
        .
      </p>
    </div>
  );
}
