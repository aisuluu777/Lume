"use client";

import { ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { categories, getService, services } from "@/lib/catalog";
import { categoryStyles } from "@/lib/category-styles";
import { cn } from "@/lib/cn";
import { formatDuration, formatPrice } from "@/lib/format";
import type { CategoryId, Service } from "@/lib/types";
import { CategoryIcon } from "../ui/CategoryIcon";
import { Modal } from "../ui/Modal";
import { buttonClass } from "../ui/styles";
import { ServiceDetails } from "./ServiceDetails";

type Filter = CategoryId | "all";

function normalize(value: string): string {
  return value.toLowerCase().replace(/ё/g, "е");
}

function syncUrl(filter: Filter, openSlug: string | null) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("category", filter);
  if (openSlug) params.set("service", openSlug);
  const query = params.toString();
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

export function ServiceCatalog({
  initialCategory,
  initialService,
}: {
  initialCategory: Filter;
  initialService: string | null;
}) {
  const [filter, setFilter] = useState<Filter>(initialCategory);
  const [query, setQuery] = useState("");
  const [openSlug, setOpenSlug] = useState<string | null>(initialService);

  const openService = getService(openSlug);

  const groups = useMemo(() => {
    const needle = normalize(query.trim());
    const matches = (service: Service) =>
      !needle || normalize(`${service.name} ${service.short} ${service.description}`).includes(needle);

    return categories
      .filter((category) => filter === "all" || category.id === filter)
      .map((category) => ({
        category,
        items: services.filter((service) => service.category === category.id && matches(service)),
      }))
      .filter((group) => group.items.length > 0);
  }, [filter, query]);

  const changeFilter = (next: Filter) => {
    setFilter(next);
    syncUrl(next, openSlug);
  };

  const open = (slug: string | null) => {
    setOpenSlug(slug);
    syncUrl(filter, slug);
  };

  const counts = Object.fromEntries(
    categories.map((category) => [category.id, services.filter((s) => s.category === category.id).length]),
  ) as Record<CategoryId, number>;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0"
          role="group"
          aria-label="Категории"
        >
          <FilterChip active={filter === "all"} onClick={() => changeFilter("all")}>
            Все услуги
            <span className="tabular opacity-60">{services.length}</span>
          </FilterChip>
          {categories.map((category) => (
            <FilterChip key={category.id} active={filter === category.id} onClick={() => changeFilter(category.id)}>
              <span className={cn("size-2 rounded-full", categoryStyles[category.id].dot)} aria-hidden="true" />
              {category.short}
              <span className="tabular opacity-60">{counts[category.id]}</span>
            </FilterChip>
          ))}
        </div>

        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">Поиск по услугам</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-smoke"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти процедуру"
            className="h-11 w-full rounded-full border border-line bg-pearl pl-11 pr-10 text-sm text-ink placeholder:text-smoke/70 focus:border-mauve focus:outline-none focus:ring-4 focus:ring-mauve/15"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-smoke hover:bg-ink/5 hover:text-ink"
              aria-label="Очистить поиск"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </label>
      </div>

      <div className="mt-10 space-y-8">
        {groups.length === 0 && (
          <div className="rounded-panel border border-line bg-pearl p-10 text-center">
            <p className="text-lg text-ink">По запросу «{query}» ничего не нашлось.</p>
            <p className="mt-2 text-smoke">
              Попробуйте другое слово или запишитесь на консультацию — врач подберёт процедуру.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => setQuery("")} className={buttonClass("secondary", "md")}>
                Сбросить поиск
              </button>
              <Link href="/booking?service=consultation" className={buttonClass("primary", "md")}>
                Записаться на консультацию
              </Link>
            </div>
          </div>
        )}

        {groups.map(({ category, items }) => (
          <section
            key={category.id}
            aria-labelledby={`cat-${category.id}`}
            className="overflow-hidden rounded-panel border border-line bg-pearl"
          >
            <header
              className={cn(
                "flex flex-col gap-1 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8",
                categoryStyles[category.id].panel,
              )}
            >
              <h2 id={`cat-${category.id}`} className="flex items-center gap-3 text-2xl">
                <CategoryIcon
                  category={category.id}
                  className={cn("size-5", categoryStyles[category.id].text)}
                  strokeWidth={1.6}
                />
                {category.name}
              </h2>
              <p className="max-w-md text-sm text-ink/70 sm:text-right">{category.description}</p>
            </header>
            <ul className="divide-y divide-line px-5 sm:px-8">
              {items.map((service) => (
                <li key={service.slug}>
                  <button
                    type="button"
                    onClick={() => open(service.slug)}
                    className="group grid w-full grid-cols-[1fr_auto] items-center gap-x-6 py-5 text-left sm:grid-cols-[1fr_7rem_10rem_2.5rem]"
                  >
                    <span className="min-w-0">
                      <span className="block text-lg text-ink transition-colors group-hover:text-mauve">
                        {service.name}
                      </span>
                      <span className="mt-0.5 block text-sm text-smoke">{service.short}</span>
                      <span className="mt-1 block text-sm text-smoke sm:hidden">
                        {formatDuration(service.duration)}
                      </span>
                    </span>
                    <span className="hidden text-sm text-smoke sm:block">{formatDuration(service.duration)}</span>
                    <span className="text-right tabular sm:text-left">
                      <span className="block font-medium text-ink">{formatPrice(service)}</span>
                      {service.priceUnit && service.price > 0 && (
                        <span className="block text-xs text-smoke">{service.priceUnit}</span>
                      )}
                    </span>
                    <span className="hidden size-10 items-center justify-center rounded-full border border-line text-ink transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-porcelain sm:inline-flex">
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Modal
        open={Boolean(openService)}
        onClose={() => open(null)}
        title={openService?.name ?? ""}
        footer={
          openService && (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link href={`/services/${openService.slug}`} className={buttonClass("secondary", "md")}>
                Страница услуги
              </Link>
              <Link href={`/booking?service=${openService.slug}`} className={buttonClass("primary", "md")}>
                Записаться на процедуру
              </Link>
            </div>
          )
        }
      >
        {openService && <ServiceDetails service={openService} showTitle={false} />}
      </Modal>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-colors",
        active ? "border-ink bg-ink text-porcelain" : "border-line bg-pearl text-ink hover:border-ink/30",
      )}
    >
      {children}
    </button>
  );
}
