import { siteConfig } from "@/config/site";
import type { Service } from "./types";

const numberFormatter = new Intl.NumberFormat("ru-RU");

export function formatMoney(value: number): string {
  return `${numberFormatter.format(value)} ${siteConfig.currency}`;
}

/** «от 18 000 ₽», «Бесплатно». */
export function formatPrice(service: Pick<Service, "price" | "priceFrom">): string {
  if (service.price === 0) return "Бесплатно";
  return `${service.priceFrom ? "от " : ""}${formatMoney(service.price)}`;
}

/** «от 18 000 ₽ за 1 мл». */
export function formatPriceWithUnit(service: Pick<Service, "price" | "priceFrom" | "priceUnit">): string {
  const base = formatPrice(service);
  return service.priceUnit && service.price > 0 ? `${base} ${service.priceUnit}` : base;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} мин`;
  if (rest === 0) return `${hours} ч`;
  return `${hours} ч ${rest} мин`;
}

/** Склонение: plural(5, ["год", "года", "лет"]) → «лет». */
export function plural(value: number, forms: [string, string, string]): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export function formatExperience(years: number): string {
  return `${years} ${plural(years, ["год", "года", "лет"])}`;
}

function toUtcDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

const longDate = new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const dayMonth = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" });
const weekdayShort = new Intl.DateTimeFormat("ru-RU", { weekday: "short", timeZone: "UTC" });
const monthShort = new Intl.DateTimeFormat("ru-RU", { month: "short", timeZone: "UTC" });
const monthLong = new Intl.DateTimeFormat("ru-RU", { month: "long", timeZone: "UTC" });
const numericDate = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

/** «пятница, 23 октября» */
export function formatDateLong(date: string): string {
  return longDate.format(toUtcDate(date));
}

/** «23 октября» */
export function formatDayMonth(date: string): string {
  return dayMonth.format(toUtcDate(date));
}

/** «23.10.2026» */
export function formatDateNumeric(date: string): string {
  return numericDate.format(toUtcDate(date));
}

export function formatDayParts(date: string): { weekday: string; day: number; month: string } {
  const value = toUtcDate(date);
  return {
    weekday: weekdayShort.format(value).replace(".", ""),
    day: value.getUTCDate(),
    month: monthShort.format(value).replace(".", ""),
  };
}

export function formatMonth(date: string): string {
  const month = monthLong.format(toUtcDate(date));
  return month.charAt(0).toUpperCase() + month.slice(1);
}

const createdAtFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: siteConfig.timezone,
});

/** Момент времени (ISO) в часовом поясе клиники: «23.10.26, 12:24». */
export function formatTimestamp(iso: string): string {
  return createdAtFormatter.format(new Date(iso));
}

export function phoneHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

const WEEKDAY_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Рабочие дни: [1,2,3,4,5] → «Пн–Пт», [1,3,5] → «Пн, Ср, Пт». */
export function formatWeekdays(days: number[]): string {
  const ordered = WEEK_ORDER.filter((day) => days.includes(day));
  const runs: number[][] = [];
  for (const day of ordered) {
    const run = runs.length > 0 ? runs[runs.length - 1] : null;
    if (run && WEEK_ORDER.indexOf(day) === WEEK_ORDER.indexOf(run[run.length - 1]) + 1) run.push(day);
    else runs.push([day]);
  }
  return runs
    .map((run) =>
      run.length >= 3
        ? `${WEEKDAY_SHORT[run[0]]}–${WEEKDAY_SHORT[run[run.length - 1]]}`
        : run.map((day) => WEEKDAY_SHORT[day]).join(", "),
    )
    .join(", ");
}
