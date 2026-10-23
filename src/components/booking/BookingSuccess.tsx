"use client";

import { CalendarPlus, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { siteConfig } from "@/config/site";
import { formatDateLong, formatDuration } from "@/lib/format";
import { buildIcs } from "@/lib/ics";
import { buttonClass } from "../ui/styles";

export interface Confirmation {
  id: string;
  serviceName: string;
  specialistName: string;
  date: string;
  time: string;
  duration: number;
}

export function BookingSuccess({ confirmation }: { confirmation: Confirmation }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const downloadIcs = () => {
    const ics = buildIcs({
      uid: `${confirmation.id}@lume-clinic`,
      title: `${confirmation.serviceName} — ${siteConfig.name}`,
      date: confirmation.date,
      time: confirmation.time,
      duration: confirmation.duration,
      location: siteConfig.contacts.address,
      description: `Специалист: ${confirmation.specialistName}. Телефон клиники: ${siteConfig.contacts.phone}`,
      timezone: siteConfig.timezone,
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "lume-zapis.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-up rounded-panel border border-line bg-pearl p-6 sm:p-10">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-aloe text-aloe-deep">
        <CircleCheck className="size-7" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="mt-6 text-3xl outline-none sm:text-4xl">
        Вы записаны
      </h2>
      <p className="mt-4 text-lg text-smoke">
        Ждём вас {formatDateLong(confirmation.date)} в {confirmation.time}. Администратор позвонит, чтобы подтвердить
        запись и ответить на вопросы.
      </p>

      <dl className="mt-8 divide-y divide-line border-y border-line">
        {[
          ["Процедура", confirmation.serviceName],
          ["Специалист", confirmation.specialistName],
          ["Длительность", formatDuration(confirmation.duration)],
          ["Адрес", siteConfig.contacts.address],
        ].map(([label, value]) => (
          <div key={label} className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[10rem_1fr]">
            <dt className="text-sm text-smoke">{label}</dt>
            <dd className="text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={downloadIcs} className={buttonClass("primary", "lg")}>
          <CalendarPlus className="size-4" aria-hidden="true" />
          Добавить в календарь
        </button>
        <Link href="/" className={buttonClass("secondary", "lg")}>
          На главную
        </Link>
      </div>
    </div>
  );
}
