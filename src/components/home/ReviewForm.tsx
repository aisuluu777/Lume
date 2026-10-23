"use client";

import { CircleCheck, Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { services } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { fieldErrors, reviewSchema } from "@/lib/validation";
import { Modal } from "../ui/Modal";
import { buttonClass, inputClass, labelClass } from "../ui/styles";

const ratingLabels = ["", "Плохо", "Так себе", "Нормально", "Хорошо", "Отлично"];

export function ReviewForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [serviceSlug, setServiceSlug] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleClose = () => {
    onClose();
    if (sent) {
      setSent(false);
      setName("");
      setRating(0);
      setText("");
      setServiceSlug("");
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const payload = { name, rating, text, serviceSlug: serviceSlug || undefined, website };
    const parsed = reviewSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSent(true);
      } else {
        if (data.fields) setErrors(data.fields);
        setFormError(data.error ?? "Не удалось отправить отзыв. Попробуйте позже.");
      }
    } catch {
      setFormError("Нет соединения с сервером. Проверьте интернет и попробуйте снова.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={sent ? "Спасибо за отзыв" : "Отзыв о клинике"}>
      {sent ? (
        <div className="py-4">
          <CircleCheck className="size-10 text-aloe-deep" strokeWidth={1.5} aria-hidden="true" />
          <p className="mt-4 text-lg">Отзыв отправлен. Он появится на сайте после проверки администратором.</p>
          <button type="button" onClick={handleClose} className={buttonClass("primary", "md", "mt-8")}>
            Закрыть
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5 pt-2">
          <fieldset>
            <legend className={labelClass}>Оценка</legend>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Оценка от 1 до 5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} — ${ratingLabels[value]}`}
                  onClick={() => setRating(value)}
                  className="rounded-full p-1.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn("size-7", value <= rating ? "fill-mauve text-mauve" : "text-ink/25")}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-smoke">{ratingLabels[rating]}</span>
            </div>
            {errors.rating && <p className="mt-2 text-sm text-powder-deep">{errors.rating}</p>}
          </fieldset>

          <div>
            <label htmlFor="review-name" className={labelClass}>
              Имя
            </label>
            <input
              id="review-name"
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="given-name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "review-name-error" : undefined}
            />
            {errors.name && (
              <p id="review-name-error" className="mt-2 text-sm text-powder-deep">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="review-service" className={labelClass}>
              Процедура <span className="font-normal text-smoke">(необязательно)</span>
            </label>
            <select
              id="review-service"
              className={inputClass}
              value={serviceSlug}
              onChange={(event) => setServiceSlug(event.target.value)}
            >
              <option value="">Не указывать</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="review-text" className={labelClass}>
              Отзыв
            </label>
            <textarea
              id="review-text"
              rows={5}
              className={cn(inputClass, "resize-y")}
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={1000}
              aria-invalid={Boolean(errors.text)}
              aria-describedby={errors.text ? "review-text-error" : undefined}
            />
            {errors.text && (
              <p id="review-text-error" className="mt-2 text-sm text-powder-deep">
                {errors.text}
              </p>
            )}
          </div>

          {/* Ловушка для ботов: поле скрыто от людей */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="review-website">Сайт</label>
            <input
              id="review-website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          {formError && (
            <p role="alert" className="rounded-2xl bg-powder px-4 py-3 text-sm text-powder-deep">
              {formError}
            </p>
          )}

          <button type="submit" disabled={submitting} className={buttonClass("primary", "lg", "w-full sm:w-auto")}>
            {submitting ? "Отправляем…" : "Отправить отзыв"}
          </button>
        </form>
      )}
    </Modal>
  );
}
