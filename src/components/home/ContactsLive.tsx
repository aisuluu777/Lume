"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { useClinicNow } from "@/hooks/useClinicNow";
import { cn } from "@/lib/cn";
import { getOpenStatus, weekdayOf } from "@/lib/schedule";

const ORDER = [1, 2, 3, 4, 5, 6, 0];
const SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function groupedHours() {
  const groups: { days: number[]; value: string }[] = [];
  for (const day of ORDER) {
    const hours = siteConfig.hours[day];
    const value = hours ? `${hours.open}–${hours.close}` : "выходной";
    const last = groups[groups.length - 1];
    if (last && last.value === value) last.days.push(day);
    else groups.push({ days: [day], value });
  }
  return groups.map((group) => ({
    ...group,
    label:
      group.days.length === 1
        ? SHORT[group.days[0]]
        : `${SHORT[group.days[0]]}–${SHORT[group.days[group.days.length - 1]]}`,
  }));
}

/** Бейдж «Открыто до 21:00» — считается по часовому поясу клиники. */
export function OpenStatus() {
  const now = useClinicNow();
  if (!now) return <span className="inline-block h-8 w-44 rounded-full bg-ink/5" aria-hidden="true" />;
  const status = getOpenStatus(now);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm",
        status.open ? "bg-aloe text-aloe-deep" : "bg-powder text-powder-deep",
      )}
    >
      <span className={cn("size-2 rounded-full", status.open ? "bg-aloe-deep" : "bg-powder-deep")} aria-hidden="true" />
      {status.label}
    </span>
  );
}

/** Часы работы с подсветкой сегодняшнего дня. */
export function WorkingHours() {
  const now = useClinicNow();
  const today = now ? weekdayOf(now.date) : -1;

  return (
    <dl className="divide-y divide-line">
      {groupedHours().map((group) => {
        const isToday = group.days.includes(today);
        return (
          <div key={group.label} className="flex items-center justify-between gap-4 py-2.5">
            <dt className={cn("text-sm", isToday ? "font-medium text-ink" : "text-smoke")}>
              {group.label}
              {isToday && <span className="ml-2 text-xs text-mauve">сегодня</span>}
            </dt>
            <dd className={cn("tabular text-sm", isToday ? "font-medium text-ink" : "text-ink/80")}>{group.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}

export function CopyAddress() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.contacts.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Буфер обмена недоступен (например, в старом браузере) — просто ничего не делаем
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm text-smoke transition-colors hover:bg-ink/5 hover:text-ink"
      aria-live="polite"
    >
      {copied ? (
        <Check className="size-4 text-aloe-deep" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
      {copied ? "Скопировано" : "Скопировать"}
    </button>
  );
}
