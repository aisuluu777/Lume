import { siteConfig, type WorkingHours } from "@/config/site";
import type { BusySlot, Specialist } from "./types";

/**
 * Расписание и свободные слоты. Все даты — строки YYYY-MM-DD в часовом
 * поясе клиники, время — HH:MM. Функции чистые и одинаково работают
 * на сервере и в браузере.
 */

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const DAY_MS = 86_400_000;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function fromMinutes(total: number): string {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

function toUtc(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** Проверяет формат и существование даты (2026-02-30 — невалидна). */
export function isValidDate(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export function isValidTime(time: string): boolean {
  return TIME_RE.test(time);
}

export function weekdayOf(date: string): number {
  return new Date(toUtc(date)).getUTCDay();
}

export function addDays(date: string, days: number): string {
  const next = new Date(toUtc(date) + days * DAY_MS);
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

export function diffDays(a: string, b: string): number {
  return Math.round((toUtc(a) - toUtc(b)) / DAY_MS);
}

export interface ClinicNow {
  date: string;
  minutes: number;
}

/** Текущие дата и время в часовом поясе клиники. */
export function getClinicNow(at: Date = new Date(), timeZone: string = siteConfig.timezone): ClinicNow {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function getWorkingHours(date: string): WorkingHours {
  return siteConfig.hours[weekdayOf(date)] ?? null;
}

const WEEKDAY_ACCUSATIVE = [
  "в воскресенье",
  "в понедельник",
  "во вторник",
  "в среду",
  "в четверг",
  "в пятницу",
  "в субботу",
];

/** «Открыто до 21:00» / «Откроемся завтра в 09:00». */
export function getOpenStatus(now: ClinicNow): { open: boolean; label: string } {
  const today = getWorkingHours(now.date);
  if (today) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (now.minutes >= open && now.minutes < close) return { open: true, label: `Открыто до ${today.close}` };
    if (now.minutes < open) return { open: false, label: `Откроемся сегодня в ${today.open}` };
  }
  for (let offset = 1; offset <= 7; offset++) {
    const date = addDays(now.date, offset);
    const hours = getWorkingHours(date);
    if (!hours) continue;
    const day = offset === 1 ? "завтра" : WEEKDAY_ACCUSATIVE[weekdayOf(date)];
    return { open: false, label: `Откроемся ${day} в ${hours.open}` };
  }
  return { open: false, label: "Сейчас закрыто" };
}

/** Даты, на которые открыта запись: сегодня и следующие N дней. */
export function bookingDates(now: ClinicNow, days: number = siteConfig.booking.windowDays): string[] {
  return Array.from({ length: days + 1 }, (_, index) => addDays(now.date, index));
}

export function isWithinBookingWindow(date: string, now: ClinicNow): boolean {
  if (!isValidDate(date)) return false;
  const offset = diffDays(date, now.date);
  return offset >= 0 && offset <= siteConfig.booking.windowDays;
}

export function overlaps(aStart: number, aDuration: number, bStart: number, bDuration: number): boolean {
  return aStart < bStart + bDuration && bStart < aStart + aDuration;
}

export function isSpecialistFree(specialistId: string, busy: BusySlot[], start: number, duration: number): boolean {
  return !busy.some(
    (slot) => slot.specialistId === specialistId && overlaps(start, duration, toMinutes(slot.time), slot.duration),
  );
}

export function worksOn(specialist: Specialist, date: string): boolean {
  return specialist.workDays.includes(weekdayOf(date));
}

/**
 * Сетка возможного начала процедуры в этот день: с открытия клиники до
 * момента, когда процедура ещё успевает закончиться до закрытия. Для
 * сегодняшнего дня отбрасывает прошедшее время с учётом запаса.
 */
export function candidateStarts(date: string, duration: number, now: ClinicNow): number[] {
  const hours = getWorkingHours(date);
  if (!hours) return [];
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  const step = siteConfig.booking.slotStepMinutes;
  const earliest = date === now.date ? now.minutes + siteConfig.booking.minLeadMinutes : -Infinity;

  const starts: number[] = [];
  for (let start = open; start + duration <= close; start += step) {
    if (start >= earliest) starts.push(start);
  }
  return starts;
}

export function isBookableTime(date: string, time: string, duration: number, now: ClinicNow): boolean {
  if (!isWithinBookingWindow(date, now) || !isValidTime(time)) return false;
  return candidateStarts(date, duration, now).includes(toMinutes(time));
}

/** Свободное время, когда хотя бы один из специалистов может принять. */
export function availableSlots(params: {
  date: string;
  duration: number;
  specialists: Specialist[];
  busy: BusySlot[];
  now: ClinicNow;
}): string[] {
  const { date, duration, busy, now } = params;
  if (!isWithinBookingWindow(date, now)) return [];
  const working = params.specialists.filter((specialist) => worksOn(specialist, date));
  if (working.length === 0) return [];

  return candidateStarts(date, duration, now)
    .filter((start) => working.some((specialist) => isSpecialistFree(specialist.id, busy, start, duration)))
    .map(fromMinutes);
}

/**
 * Выбирает специалиста для записи: среди работающих в этот день и
 * свободных в это время — наименее загруженного.
 */
export function pickSpecialist(params: {
  candidates: Specialist[];
  busy: BusySlot[];
  date: string;
  time: string;
  duration: number;
}): Specialist | null {
  const start = toMinutes(params.time);
  const load = (specialist: Specialist) => params.busy.filter((slot) => slot.specialistId === specialist.id).length;
  const free = params.candidates
    .filter((specialist) => worksOn(specialist, params.date))
    .filter((specialist) => isSpecialistFree(specialist.id, params.busy, start, params.duration));
  free.sort((a, b) => load(a) - load(b));
  return free[0] ?? null;
}
