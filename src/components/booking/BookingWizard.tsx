"use client";

import { ArrowLeft, Check, LoaderCircle, RefreshCw, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { useClinicNow } from "@/hooks/useClinicNow";
import { categories, getService, getSpecialist, services, specialistsForService } from "@/lib/catalog";
import { categoryStyles } from "@/lib/category-styles";
import { cn } from "@/lib/cn";
import { formatDateLong, formatDuration, formatExperience, formatPrice, formatWeekdays } from "@/lib/format";
import { bookingDates, getWorkingHours, worksOn } from "@/lib/schedule";
import type { CategoryId, Service, Specialist } from "@/lib/types";
import { bookingSchema, fieldErrors } from "@/lib/validation";
import { SpecialistMonogram } from "../ui/SpecialistMonogram";
import { buttonClass, inputClass, labelClass } from "../ui/styles";
import { BookingSuccess, type Confirmation } from "./BookingSuccess";
import { BookingSummary } from "./BookingSummary";
import { DatePicker } from "./DatePicker";
import { StepIndicator } from "./StepIndicator";
import { TimeSlots } from "./TimeSlots";

const STEPS = ["Услуга", "Специалист", "Дата и время", "Контакты"];

type SlotsResult = { url: string; slots: string[]; error?: string };

interface FormState {
  name: string;
  phone: string;
  comment: string;
  consent: boolean;
  website: string;
}

function candidatesFor(service: Service | undefined, specialistId: string): Specialist[] {
  if (!service) return [];
  const eligible = specialistsForService(service);
  return specialistId === "any" ? eligible : eligible.filter((item) => item.id === specialistId);
}

function isDayOpen(date: string, candidates: Specialist[]): boolean {
  return Boolean(getWorkingHours(date)) && candidates.some((specialist) => worksOn(specialist, date));
}

export function BookingWizard({
  initialService,
  initialSpecialist,
}: {
  initialService: string | null;
  initialSpecialist: string | null;
}) {
  const now = useClinicNow();
  const presetService = getService(initialService);
  const lockedSpecialist = getSpecialist(initialSpecialist);

  const [serviceSlug, setServiceSlug] = useState(presetService?.slug ?? "");
  const [specialistId, setSpecialistId] = useState(() => {
    if (!lockedSpecialist) return "any";
    if (presetService && !specialistsForService(presetService).some((s) => s.id === lockedSpecialist.id)) return "any";
    return lockedSpecialist.id;
  });
  const [step, setStep] = useState(presetService ? 2 : 1);
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | "all">(presetService?.category ?? "all");
  const [onlyForSpecialist, setOnlyForSpecialist] = useState(Boolean(lockedSpecialist));
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [slotNotice, setSlotNotice] = useState("");
  const [slotsResult, setSlotsResult] = useState<SlotsResult | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", phone: "", comment: "", consent: false, website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const service = getService(serviceSlug);
  const eligible = service ? specialistsForService(service) : [];
  const chosenSpecialist = specialistId === "any" ? null : getSpecialist(specialistId);
  const candidates = candidatesFor(service, specialistId);
  const dates = now ? bookingDates(now) : [];

  // ——— Свободное время: загружается при выборе даты на шаге 3 и дальше
  const slotsUrl =
    step >= 3 && service && date
      ? `/api/availability?${new URLSearchParams({ service: service.slug, specialist: specialistId, date })}&r=${refreshKey}`
      : null;

  useEffect(() => {
    if (!slotsUrl) return;
    const controller = new AbortController();
    fetch(slotsUrl, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Ошибка загрузки");
        return data as { slots: string[] };
      })
      .then((data) => setSlotsResult({ url: slotsUrl, slots: data.slots }))
      .catch((error: Error) => {
        if (error.name === "AbortError") return;
        setSlotsResult({
          url: slotsUrl,
          slots: [],
          error: "Не удалось загрузить расписание. Проверьте интернет и попробуйте ещё раз.",
        });
      });
    return () => controller.abort();
  }, [slotsUrl]);

  const currentSlots = slotsUrl !== null && slotsResult !== null && slotsResult.url === slotsUrl ? slotsResult : null;
  const slotsReady = currentSlots !== null;
  const slots = currentSlots?.slots ?? [];
  const slotsError = currentSlots?.error;
  const slotsLoading = slotsUrl !== null && !slotsReady;
  const selectedTime = slotsReady && slots.includes(time) ? time : "";

  // ——— Навигация по шагам
  const canOpen = (target: number) => {
    if (target === 1) return true;
    if (target === 2 || target === 3) return Boolean(service);
    return Boolean(service && date && selectedTime);
  };

  const scrollToTop = () => {
    const top = topRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const enterDateStep = (nextService: Service, nextSpecialistId: string) => {
    const nextCandidates = candidatesFor(nextService, nextSpecialistId);
    setDate((current) => {
      if (current && isDayOpen(current, nextCandidates)) return current;
      return dates.find((item) => isDayOpen(item, nextCandidates)) ?? "";
    });
    setStep(3);
    scrollToTop();
  };

  const goTo = (target: number) => {
    if (!canOpen(target)) return;
    if (target === 3 && service) {
      enterDateStep(service, specialistId);
      return;
    }
    setStep(target);
    scrollToTop();
  };

  const selectService = (slug: string) => {
    const nextService = getService(slug);
    if (!nextService) return;
    const nextEligible = specialistsForService(nextService);
    const keepSpecialist = specialistId !== "any" && nextEligible.some((s) => s.id === specialistId);
    const nextSpecialistId = keepSpecialist ? specialistId : "any";

    setServiceSlug(slug);
    setSpecialistId(nextSpecialistId);
    setTime("");
    setSlotNotice("");

    if (lockedSpecialist && nextSpecialistId === lockedSpecialist.id) {
      enterDateStep(nextService, nextSpecialistId);
    } else {
      setStep(2);
      scrollToTop();
    }
  };

  const selectSpecialist = (id: string) => {
    if (!service) return;
    setSpecialistId(id);
    setTime("");
    setSlotNotice("");
    enterDateStep(service, id);
  };

  const selectDate = (value: string) => {
    setDate(value);
    setTime("");
    setSlotNotice("");
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!service) return;
    setSubmitError("");

    const payload = {
      serviceSlug: service.slug,
      specialistId,
      date,
      time: selectedTime,
      name: form.name,
      phone: form.phone,
      comment: form.comment,
      consent: form.consent,
      website: form.website,
    };

    const parsed = bookingSchema.safeParse(payload);
    if (!parsed.success) {
      const found = fieldErrors(parsed.error);
      setErrors(found);
      const first = ["name", "phone", "comment", "consent"].find((key) => found[key]);
      if (first) document.getElementById(`booking-${first}`)?.focus();
      if (found.time || found.date) goTo(3);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 201) {
        setConfirmation(
          data.booking ?? {
            id: Math.random().toString(36).slice(2),
            serviceName: service.name,
            specialistName: chosenSpecialist?.name ?? "Любой специалист",
            date,
            time: selectedTime,
            duration: service.duration,
          },
        );
        return;
      }
      if (response.status === 409) {
        setTime("");
        setRefreshKey((value) => value + 1);
        setSlotNotice(data.error ?? "Это время уже заняли. Выберите другое.");
        setStep(3);
        scrollToTop();
        return;
      }
      if (response.status === 400 && data.fields) setErrors(data.fields);
      setSubmitError(data.error ?? `Не удалось отправить заявку. Позвоните нам: ${siteConfig.contacts.phone}`);
    } catch {
      setSubmitError("Нет соединения с сервером. Проверьте интернет и попробуйте снова.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) return <BookingSuccess confirmation={confirmation} />;

  // ——— Список услуг для шага 1
  const servicePool =
    onlyForSpecialist && lockedSpecialist
      ? services.filter((item) => specialistsForService(item).some((s) => s.id === lockedSpecialist.id))
      : services;
  const visibleCategories = categories.filter((category) => servicePool.some((item) => item.category === category.id));
  const visibleServices = servicePool.filter((item) => categoryFilter === "all" || item.category === categoryFilter);

  return (
    <div ref={topRef} className="grid scroll-mt-24 grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-8">
        <StepIndicator steps={STEPS} current={step} canOpen={canOpen} onSelect={goTo} />

        <div className="mt-6 rounded-panel border border-line bg-pearl p-5 sm:p-8">
          {step === 1 && (
            <section aria-labelledby="step-service">
              <h2 id="step-service" className="text-2xl">
                Выберите процедуру
              </h2>
              {lockedSpecialist && onlyForSpecialist ? (
                <p className="mt-2 text-smoke">
                  Процедуры, которые проводит {lockedSpecialist.name}.{" "}
                  <button
                    type="button"
                    onClick={() => setOnlyForSpecialist(false)}
                    className="text-ink underline decoration-mauve/40 underline-offset-4 hover:decoration-mauve"
                  >
                    Показать все
                  </button>
                </p>
              ) : (
                <p className="mt-2 text-smoke">
                  Не знаете, что выбрать?{" "}
                  <button
                    type="button"
                    onClick={() => selectService("consultation")}
                    className="text-ink underline decoration-mauve/40 underline-offset-4 hover:decoration-mauve"
                  >
                    Запишитесь на бесплатную консультацию
                  </button>
                </p>
              )}

              <div className="scrollbar-none -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
                {[{ id: "all" as const, short: "Все" }, ...visibleCategories].map((category) => {
                  const active = categoryFilter === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategoryFilter(category.id)}
                      className={cn(
                        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-colors",
                        active ? "border-ink bg-ink text-porcelain" : "border-line bg-pearl hover:border-ink/30",
                      )}
                    >
                      {category.id !== "all" && (
                        <span
                          className={cn("size-2 rounded-full", categoryStyles[category.id].dot)}
                          aria-hidden="true"
                        />
                      )}
                      {category.short}
                    </button>
                  );
                })}
              </div>

              <ul
                className="mt-5 divide-y divide-line border-y border-line"
                role="radiogroup"
                aria-labelledby="step-service"
              >
                {visibleServices.map((item) => {
                  const active = item.slug === serviceSlug;
                  return (
                    <li key={item.slug}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => selectService(item.slug)}
                        className="group flex w-full items-center gap-4 py-4 text-left"
                      >
                        <span
                          className={cn("size-2.5 shrink-0 rounded-full", categoryStyles[item.category].dot)}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-ink group-hover:text-mauve">{item.name}</span>
                          <span className="block text-sm text-smoke">{formatDuration(item.duration)}</span>
                        </span>
                        <span className="text-right text-sm font-medium tabular">
                          {formatPrice(item)}
                          {item.priceUnit && item.price > 0 && (
                            <span className="block text-xs font-normal text-smoke">{item.priceUnit}</span>
                          )}
                        </span>
                        <RadioMark checked={active} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {step === 2 && service && (
            <section aria-labelledby="step-specialist">
              <h2 id="step-specialist" className="text-2xl">
                Выберите специалиста
              </h2>
              <p className="mt-2 text-smoke">{service.name}</p>

              <div
                className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
                role="radiogroup"
                aria-labelledby="step-specialist"
              >
                <OptionCard checked={specialistId === "any"} onClick={() => selectSpecialist("any")}>
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-porcelain text-ink">
                    <Users className="size-5" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">Любой специалист</span>
                    <span className="mt-0.5 block text-sm text-smoke">Покажем всё свободное время</span>
                  </span>
                </OptionCard>
                {eligible.map((specialist) => (
                  <OptionCard
                    key={specialist.id}
                    checked={specialistId === specialist.id}
                    onClick={() => selectSpecialist(specialist.id)}
                  >
                    <SpecialistMonogram specialist={specialist} />
                    <span className="min-w-0">
                      <span className="block font-medium text-ink">{specialist.name}</span>
                      <span className="mt-0.5 block text-sm text-smoke">{specialist.role}</span>
                      <span className="mt-1 block text-xs text-smoke">
                        Стаж {formatExperience(specialist.experience)}. Приём: {formatWeekdays(specialist.workDays)}
                      </span>
                    </span>
                  </OptionCard>
                ))}
              </div>

              <StepNav onBack={() => goTo(1)} />
            </section>
          )}

          {step === 3 && service && (
            <section aria-labelledby="step-datetime">
              <h2 id="step-datetime" className="text-2xl">
                Дата и время
              </h2>
              <p className="mt-2 text-smoke">
                {service.name}, {formatDuration(service.duration)}
                {chosenSpecialist ? `. ${chosenSpecialist.name}` : ""}
              </p>

              <div className="mt-6">
                <DatePicker
                  dates={dates}
                  selected={date}
                  isEnabled={(value) => isDayOpen(value, candidates)}
                  onSelect={selectDate}
                />
              </div>

              <div className="mt-8 border-t border-line pt-6">
                {slotNotice && (
                  <p role="alert" className="mb-5 rounded-2xl bg-powder px-4 py-3 text-sm text-powder-deep">
                    {slotNotice}
                  </p>
                )}

                {!date && dates.length > 0 && (
                  <p className="text-smoke">Выберите дату, чтобы увидеть свободное время.</p>
                )}

                {date && (
                  <>
                    <h3 className="mb-4 font-sans text-base font-medium tracking-normal">{formatDateLong(date)}</h3>
                    {slotsLoading && (
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6" aria-label="Загружаем свободное время">
                        {Array.from({ length: 12 }, (_, index) => (
                          <div key={index} className="h-11 animate-pulse rounded-full bg-porcelain" />
                        ))}
                      </div>
                    )}
                    {slotsError && (
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-powder-deep">{slotsError}</p>
                        <button
                          type="button"
                          onClick={() => setRefreshKey((value) => value + 1)}
                          className={buttonClass("secondary", "sm")}
                        >
                          <RefreshCw className="size-4" aria-hidden="true" />
                          Повторить
                        </button>
                      </div>
                    )}
                    {slotsReady && !slotsError && slots.length === 0 && (
                      <p className="text-smoke">
                        На этот день свободного времени нет. Выберите другую дату
                        {specialistId !== "any" ? " или любого специалиста" : ""}.
                      </p>
                    )}
                    {slotsReady && slots.length > 0 && (
                      <TimeSlots slots={slots} selected={selectedTime} onSelect={setTime} />
                    )}
                  </>
                )}
              </div>

              <StepNav
                onBack={() => goTo(2)}
                next={
                  <button
                    type="button"
                    disabled={!selectedTime}
                    onClick={() => goTo(4)}
                    className={buttonClass("primary", "lg")}
                  >
                    Продолжить
                  </button>
                }
              />
            </section>
          )}

          {step === 4 && service && (
            <section aria-labelledby="step-contacts">
              <h2 id="step-contacts" className="text-2xl">
                Ваши контакты
              </h2>
              <p className="mt-2 text-smoke">Администратор позвонит, чтобы подтвердить запись.</p>

              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field id="booking-name" label="Имя" error={errors.name}>
                    <input
                      id="booking-name"
                      className={inputClass}
                      value={form.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "booking-name-error" : undefined}
                    />
                  </Field>
                  <Field id="booking-phone" label="Телефон" error={errors.phone}>
                    <input
                      id="booking-phone"
                      type="tel"
                      inputMode="tel"
                      className={inputClass}
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      autoComplete="tel"
                      placeholder="+7 900 000-00-00"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "booking-phone-error" : undefined}
                    />
                  </Field>
                </div>

                <Field id="booking-comment" label="Комментарий" hint="необязательно" error={errors.comment}>
                  <textarea
                    id="booking-comment"
                    rows={3}
                    maxLength={500}
                    className={cn(inputClass, "resize-y")}
                    value={form.comment}
                    onChange={(event) => updateField("comment", event.target.value)}
                    placeholder="Например, удобно ли звонить в рабочее время"
                    aria-invalid={Boolean(errors.comment)}
                  />
                </Field>

                <div className="hidden" aria-hidden="true">
                  <label htmlFor="booking-website">Сайт</label>
                  <input
                    id="booking-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(event) => updateField("website", event.target.value)}
                  />
                </div>

                <div>
                  <label className="flex items-start gap-3 text-sm text-ink/85">
                    <input
                      id="booking-consent"
                      type="checkbox"
                      checked={form.consent}
                      onChange={(event) => updateField("consent", event.target.checked)}
                      className="mt-0.5 size-5 shrink-0 rounded accent-ink"
                      aria-invalid={Boolean(errors.consent)}
                      aria-describedby={errors.consent ? "booking-consent-error" : undefined}
                    />
                    <span>
                      Согласен(на) на обработку персональных данных в соответствии с{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="text-ink underline decoration-mauve/40 underline-offset-4 hover:decoration-mauve"
                      >
                        политикой конфиденциальности
                      </Link>
                    </span>
                  </label>
                  {errors.consent && (
                    <p id="booking-consent-error" className="mt-2 text-sm text-powder-deep">
                      {errors.consent}
                    </p>
                  )}
                </div>

                {submitError && (
                  <p role="alert" className="rounded-2xl bg-powder px-4 py-3 text-sm text-powder-deep">
                    {submitError}
                  </p>
                )}

                <StepNav
                  onBack={() => goTo(3)}
                  next={
                    <button type="submit" disabled={submitting} className={buttonClass("primary", "lg")}>
                      {submitting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                      {submitting ? "Отправляем" : "Записаться"}
                    </button>
                  }
                />
              </form>
            </section>
          )}
        </div>
      </div>

      <aside className="lg:col-span-4" aria-label="Детали записи">
        <BookingSummary service={service} specialist={chosenSpecialist} date={date} time={selectedTime} onEdit={goTo} />
      </aside>
    </div>
  );
}

function RadioMark({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
        checked ? "border-ink bg-ink text-porcelain" : "border-line",
      )}
    >
      {checked && <Check className="size-3.5" strokeWidth={2.5} />}
    </span>
  );
}

function OptionCard({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
        checked ? "border-ink bg-porcelain" : "border-line hover:border-ink/30",
      )}
    >
      {children}
      <span className="ml-auto">
        <RadioMark checked={checked} />
      </span>
    </button>
  );
}

function StepNav({ onBack, next }: { onBack: () => void; next?: ReactNode }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
      <button type="button" onClick={onBack} className={buttonClass("quiet", "lg", "-ml-4")}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Назад
      </button>
      {next}
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {hint && <span className="font-normal text-smoke"> ({hint})</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-powder-deep">
          {error}
        </p>
      )}
    </div>
  );
}
