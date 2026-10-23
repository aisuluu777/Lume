"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { formatDayParts, formatDateLong, formatMonth } from "@/lib/format";

interface DatePickerProps {
  dates: string[];
  selected: string;
  isEnabled: (date: string) => boolean;
  onSelect: (date: string) => void;
}

/** Лента дат на ближайший месяц. Недоступные дни видны, но неактивны. */
export function DatePicker({ dates, selected, isEnabled, onSelect }: DatePickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (dates.length === 0) {
    return (
      <div className="flex gap-2 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-[84px] w-16 shrink-0 animate-pulse rounded-2xl bg-porcelain" />
        ))}
      </div>
    );
  }

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-smoke">{formatMonth(selected || dates[0])}</p>
        <div className="hidden gap-1 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="inline-flex size-9 items-center justify-center rounded-full border border-line hover:border-ink/30"
            aria-label="Предыдущие дни"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="inline-flex size-9 items-center justify-center rounded-full border border-line hover:border-ink/30"
            aria-label="Следующие дни"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        role="radiogroup"
        aria-label="Дата визита"
        className="scrollbar-none -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0"
      >
        {dates.map((date) => {
          const enabled = isEnabled(date);
          const active = date === selected;
          const parts = formatDayParts(date);
          return (
            <button
              key={date}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${formatDateLong(date)}${enabled ? "" : ", нет приёма"}`}
              disabled={!enabled}
              onClick={() => onSelect(date)}
              className={cn(
                "flex h-[84px] w-16 shrink-0 snap-start flex-col items-center justify-center rounded-2xl border text-center transition-colors",
                active
                  ? "border-ink bg-ink text-porcelain"
                  : enabled
                    ? "border-line bg-pearl text-ink hover:border-ink/40"
                    : "border-transparent bg-porcelain text-ink/30",
              )}
            >
              <span className={cn("text-xs", active ? "text-porcelain/70" : "text-smoke", !enabled && "text-ink/30")}>
                {parts.weekday}
              </span>
              <span className="mt-0.5 text-xl font-medium tabular leading-none">{parts.day}</span>
              <span
                className={cn("mt-1 text-xs", active ? "text-porcelain/70" : "text-smoke", !enabled && "text-ink/30")}
              >
                {parts.month}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
