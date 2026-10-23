"use client";

import { ChevronDown, Download, Inbox, Phone, RefreshCw, Search, Trash } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useClinicNow } from "@/hooks/useClinicNow";
import { getService } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatDateNumeric, formatDayMonth, formatPrice, formatTimestamp } from "@/lib/format";
import { BOOKING_STATUSES, type Booking, type BookingStatus } from "@/lib/types";
import { buttonClass } from "../ui/styles";
import { useAdminData } from "./useAdminData";

const STATUS_META: Record<BookingStatus, { label: string; filter: string; className: string }> = {
  new: { label: "Новая", filter: "Новые", className: "bg-ink text-porcelain" },
  confirmed: { label: "Подтверждена", filter: "Подтверждённые", className: "bg-aloe text-aloe-deep" },
  completed: { label: "Завершена", filter: "Завершённые", className: "bg-porcelain text-smoke" },
  cancelled: { label: "Отменена", filter: "Отменённые", className: "bg-powder text-powder-deep" },
};

type Period = "upcoming" | "today" | "past" | "all";
const PERIODS: [Period, string][] = [
  ["upcoming", "Предстоящие"],
  ["today", "Сегодня"],
  ["past", "Прошедшие"],
  ["all", "Все даты"],
];

interface BookingsResponse {
  bookings: Booking[];
  storage: { kind: "postgres" | "json"; persistent: boolean };
}

function priceOf(booking: Booking): string {
  return formatPrice({ price: booking.price, priceFrom: getService(booking.serviceSlug)?.priceFrom });
}

function csvCell(value: string | number): string {
  let text = String(value);
  // Защита от формул при открытии в Excel
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function exportCsv(rows: Booking[]) {
  const header = [
    "Дата визита",
    "Время",
    "Пациент",
    "Телефон",
    "Процедура",
    "Специалист",
    "Стоимость",
    "Статус",
    "Комментарий",
    "Заявка создана",
  ];
  const lines = [
    header.map(csvCell).join(";"),
    ...rows.map((b) =>
      [
        formatDateNumeric(b.date),
        b.time,
        b.name,
        b.phone,
        b.serviceName,
        b.specialistName,
        priceOf(b),
        STATUS_META[b.status].label,
        b.comment ?? "",
        formatTimestamp(b.createdAt),
      ]
        .map(csvCell)
        .join(";"),
    ),
  ];
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `zayavki-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function BookingsPanel() {
  const { data, error, loading, reload, update } = useAdminData<BookingsResponse>("/api/admin/bookings");
  const now = useClinicNow();
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [period, setPeriod] = useState<Period>("upcoming");
  const [query, setQuery] = useState("");
  const [actionError, setActionError] = useState("");

  const today = now?.date ?? "";
  const bookings = data?.bookings ?? [];

  const inPeriod = (booking: Booking) => {
    if (period === "all" || !today) return true;
    if (period === "today") return booking.date === today;
    if (period === "upcoming") return booking.date >= today;
    return booking.date < today;
  };

  const periodRows = bookings.filter(inPeriod);
  const counts = Object.fromEntries(
    BOOKING_STATUSES.map((value) => [value, periodRows.filter((b) => b.status === value).length]),
  ) as Record<BookingStatus, number>;

  const needle = query.trim().toLowerCase();
  const digits = needle.replace(/\D/g, "");
  const rows = periodRows
    .filter((b) => status === "all" || b.status === status)
    .filter(
      (b) =>
        !needle ||
        `${b.name} ${b.serviceName} ${b.specialistName}`.toLowerCase().includes(needle) ||
        (digits.length >= 3 && b.phone.replace(/\D/g, "").includes(digits)),
    )
    .sort((a, b) => {
      const key = (x: Booking) => `${x.date} ${x.time}`;
      return period === "upcoming" || period === "today" ? key(a).localeCompare(key(b)) : key(b).localeCompare(key(a));
    });

  async function changeStatus(booking: Booking, next: BookingStatus) {
    setActionError("");
    const previous = booking.status;
    update((d) => ({ ...d, bookings: d.bookings.map((b) => (b.id === booking.id ? { ...b, status: next } : b)) }));
    const response = await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => null);
    if (!response?.ok) {
      update((d) => ({
        ...d,
        bookings: d.bookings.map((b) => (b.id === booking.id ? { ...b, status: previous } : b)),
      }));
      setActionError("Не удалось изменить статус. Проверьте соединение и попробуйте ещё раз.");
    }
  }

  async function remove(booking: Booking) {
    if (!window.confirm(`Удалить заявку: ${booking.name}, ${formatDayMonth(booking.date)} в ${booking.time}?`)) return;
    setActionError("");
    const response = await fetch(`/api/admin/bookings/${booking.id}`, { method: "DELETE" }).catch(() => null);
    if (response?.ok) {
      update((d) => ({ ...d, bookings: d.bookings.filter((b) => b.id !== booking.id) }));
    } else {
      setActionError("Не удалось удалить заявку.");
    }
  }

  return (
    <div>
      {data && !data.storage.persistent && (
        <p className="mb-6 rounded-2xl bg-powder px-4 py-3 text-sm text-powder-deep">
          База данных не подключена: заявки хранятся во временном файле и пропадут при перезапуске сервера. Добавьте
          переменную DATABASE_URL с адресом PostgreSQL (инструкция в README).
        </p>
      )}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Период">
          {PERIODS.map(([value, label]) => (
            <Chip key={value} active={period === value} onClick={() => setPeriod(value)}>
              {label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Поиск по имени, телефону или услуге</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-smoke"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Имя, телефон, услуга"
              className="h-10 w-full rounded-full border border-line bg-pearl pl-10 pr-4 text-sm focus:border-mauve focus:outline-none focus:ring-4 focus:ring-mauve/15"
            />
          </label>
          <button type="button" onClick={reload} className={buttonClass("secondary", "sm")} disabled={loading}>
            <RefreshCw className={cn("size-4", loading && "animate-spin")} aria-hidden="true" />
            Обновить
          </button>
          <button
            type="button"
            onClick={() => exportCsv(rows)}
            className={buttonClass("secondary", "sm")}
            disabled={rows.length === 0}
          >
            <Download className="size-4" aria-hidden="true" />
            CSV
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Статус">
        <Chip active={status === "all"} onClick={() => setStatus("all")}>
          Все <span className="tabular opacity-60">{periodRows.length}</span>
        </Chip>
        {BOOKING_STATUSES.map((value) => (
          <Chip key={value} active={status === value} onClick={() => setStatus(value)}>
            {STATUS_META[value].filter} <span className="tabular opacity-60">{counts[value]}</span>
          </Chip>
        ))}
      </div>

      {(error || actionError) && (
        <p role="alert" className="mt-4 rounded-2xl bg-powder px-4 py-3 text-sm text-powder-deep">
          {actionError || error}
        </p>
      )}

      <div className="mt-6">
        {!data && loading && <div className="h-64 animate-pulse rounded-panel bg-pearl" aria-label="Загрузка" />}

        {data && rows.length === 0 && (
          <div className="flex flex-col items-center rounded-panel border border-line bg-pearl px-6 py-16 text-center">
            <Inbox className="size-8 text-smoke" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-4 text-lg">Заявок нет</p>
            <p className="mt-1 text-sm text-smoke">
              {bookings.length === 0
                ? "Новые записи с сайта появятся здесь автоматически."
                : "Под выбранные фильтры ничего не подходит."}
            </p>
          </div>
        )}

        {rows.length > 0 && (
          <>
            {/* Таблица для широких экранов */}
            <div className="hidden overflow-hidden rounded-panel border border-line bg-pearl lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line text-smoke">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 font-normal">
                      Визит
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-normal">
                      Пациент
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-normal">
                      Процедура
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-normal">
                      Стоимость
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-normal">
                      Статус
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-normal">
                      Создана
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-normal">
                      <span className="sr-only">Действия</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((booking) => (
                    <tr key={booking.id} className={cn("align-top", booking.status === "cancelled" && "text-ink/50")}>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="block font-medium text-ink">{formatDayMonth(booking.date)}</span>
                        <span className="tabular text-smoke">{booking.time}</span>
                        {booking.date === today && <span className="ml-2 text-xs text-mauve">сегодня</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="block text-ink">{booking.name}</span>
                        <a
                          href={`tel:${booking.phone.replace(/[^\d+]/g, "")}`}
                          className="tabular text-smoke hover:text-ink"
                        >
                          {booking.phone}
                        </a>
                        {booking.comment && <p className="mt-1 max-w-xs text-xs text-smoke">«{booking.comment}»</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="block text-ink">{booking.serviceName}</span>
                        <span className="text-smoke">{booking.specialistName}</span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 tabular">{priceOf(booking)}</td>
                      <td className="px-5 py-4">
                        <StatusSelect booking={booking} onChange={changeStatus} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 tabular text-smoke">
                        {formatTimestamp(booking.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => remove(booking)}
                          className="inline-flex size-9 items-center justify-center rounded-full text-smoke hover:bg-powder hover:text-powder-deep"
                          aria-label={`Удалить заявку ${booking.name}`}
                        >
                          <Trash className="size-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Карточки для телефонов и планшетов */}
            <ul className="space-y-3 lg:hidden">
              {rows.map((booking) => (
                <li key={booking.id} className="rounded-panel border border-line bg-pearl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">
                        {formatDayMonth(booking.date)}, <span className="tabular">{booking.time}</span>
                      </p>
                      <p className="mt-0.5 text-sm text-smoke">
                        {booking.serviceName}. {booking.specialistName}
                      </p>
                    </div>
                    <span className="tabular text-sm">{priceOf(booking)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                    <div className="min-w-0">
                      <p className="truncate text-ink">{booking.name}</p>
                      <a
                        href={`tel:${booking.phone.replace(/[^\d+]/g, "")}`}
                        className="inline-flex items-center gap-1.5 text-sm text-smoke"
                      >
                        <Phone className="size-3.5" aria-hidden="true" />
                        {booking.phone}
                      </a>
                    </div>
                    <StatusSelect booking={booking} onChange={changeStatus} />
                  </div>
                  {booking.comment && <p className="mt-3 text-sm text-smoke">«{booking.comment}»</p>}
                  <div className="mt-3 flex items-center justify-between text-xs text-smoke">
                    <span>Создана {formatTimestamp(booking.createdAt)}</span>
                    <button type="button" onClick={() => remove(booking)} className="text-powder-deep hover:underline">
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function StatusSelect({
  booking,
  onChange,
}: {
  booking: Booking;
  onChange: (booking: Booking, next: BookingStatus) => void;
}) {
  return (
    <span className="relative inline-flex">
      <select
        value={booking.status}
        onChange={(event) => onChange(booking, event.target.value as BookingStatus)}
        aria-label={`Статус заявки ${booking.name}`}
        className={cn(
          "h-8 cursor-pointer appearance-none rounded-full border-0 pl-3 pr-8 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-mauve/20",
          STATUS_META[booking.status].className,
        )}
      >
        {BOOKING_STATUSES.map((value) => (
          <option key={value} value={value} className="bg-pearl text-ink">
            {STATUS_META[value].label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 opacity-70"
        aria-hidden="true"
      />
    </span>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors",
        active ? "border-ink bg-ink text-porcelain" : "border-line bg-pearl text-ink hover:border-ink/30",
      )}
    >
      {children}
    </button>
  );
}
