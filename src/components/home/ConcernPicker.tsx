"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { concerns, getService } from "@/lib/catalog";
import { categoryStyles } from "@/lib/category-styles";
import { cn } from "@/lib/cn";
import { formatDuration, formatPrice } from "@/lib/format";
import type { Service } from "@/lib/types";

/**
 * «Что хотите изменить?» — пациент выбирает запрос, а не процедуру,
 * и сразу видит, что предложит врач, сколько это стоит и сколько длится.
 */
export function ConcernPicker() {
  const [activeId, setActiveId] = useState(concerns[0].id);
  const active = concerns.find((concern) => concern.id === activeId) ?? concerns[0];
  const matches = active.services
    .map((slug) => getService(slug))
    .filter((service): service is Service => Boolean(service));

  return (
    <div className="rounded-panel border border-line bg-pearl p-5 shadow-[0_30px_60px_-40px_rgb(42_33_48/0.35)] sm:p-7">
      <h2 id="concern-title" className="text-2xl">
        Что хотите изменить?
      </h2>

      <div role="group" aria-labelledby="concern-title" className="mt-5 flex flex-wrap gap-2">
        {concerns.map((concern) => {
          const selected = concern.id === active.id;
          return (
            <button
              key={concern.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setActiveId(concern.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                selected ? "border-ink bg-ink text-porcelain" : "border-line bg-porcelain text-ink hover:border-ink/30",
              )}
            >
              {concern.label}
            </button>
          );
        })}
      </div>

      <div key={active.id} className="animate-fade-up" aria-live="polite">
        <p className="mt-5 text-smoke">{active.note}</p>

        <ul className="mt-4 divide-y divide-line border-y border-line">
          {matches.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/booking?service=${service.slug}`}
                className="group -mx-3 flex items-center gap-4 rounded-2xl px-3 py-3.5 transition-colors hover:bg-porcelain"
              >
                <span
                  className={cn("size-2.5 shrink-0 rounded-full", categoryStyles[service.category].dot)}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-base text-ink">{service.name}</span>
                  <span className="block text-sm text-smoke">{formatDuration(service.duration)}</span>
                </span>
                <span className="text-right text-sm font-medium tabular text-ink">
                  {formatPrice(service)}
                  {service.priceUnit && service.price > 0 && (
                    <span className="block text-xs font-normal text-smoke">{service.priceUnit}</span>
                  )}
                </span>
                <ArrowUpRight
                  className="size-4 shrink-0 text-smoke transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  aria-hidden="true"
                />
                <span className="sr-only">Записаться</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-sm text-smoke">
        Не уверены, что подойдёт?{" "}
        <Link
          href="/booking?service=consultation"
          className="text-ink underline decoration-mauve/40 underline-offset-4 hover:decoration-mauve"
        >
          Врач подберёт план на бесплатной консультации
        </Link>
      </p>
    </div>
  );
}
