"use client";

import { ChevronLeft, ChevronRight, MessageSquareText, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatTimestamp } from "@/lib/format";
import { buttonClass, container } from "../ui/styles";
import { ReviewForm } from "./ReviewForm";

interface PublicReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  serviceName: string | null;
  createdAt: string;
}

type LoadState = { status: "loading" } | { status: "error" } | { status: "ready"; reviews: PublicReview[] };

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`Оценка ${rating} из 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden="true"
          className={cn("size-4", value <= rating ? "fill-mauve text-mauve" : "text-line")}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

/**
 * Отзывы показываются только настоящие: пациенты оставляют их через форму,
 * администратор публикует их в админ-панели.
 */
export function Reviews() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [formOpen, setFormOpen] = useState(false);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/reviews", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: { reviews: PublicReview[] }) => setState({ status: "ready", reviews: data.reviews }))
      .catch((error: Error) => {
        if (error.name !== "AbortError") setState({ status: "error" });
      });
    return () => controller.abort();
  }, []);

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: "smooth" });
  };

  const reviews = state.status === "ready" ? state.reviews : [];
  const hasMany = reviews.length > 1;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-20 py-16 lg:scroll-mt-24 lg:py-28">
      <div className={container}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="reviews-title" className="text-3xl sm:text-4xl">
              Отзывы пациентов
            </h2>
            <p className="mt-4 text-smoke">Отзывы публикуются после проверки администратором клиники.</p>
          </div>
          <div className="flex items-center gap-2">
            {hasMany && (
              <>
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  className="hidden size-11 items-center justify-center rounded-full border border-line bg-pearl hover:border-ink/30 sm:inline-flex"
                  aria-label="Предыдущие отзывы"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
                  className="hidden size-11 items-center justify-center rounded-full border border-line bg-pearl hover:border-ink/30 sm:inline-flex"
                  aria-label="Следующие отзывы"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </>
            )}
            {reviews.length > 0 && (
              <button type="button" onClick={() => setFormOpen(true)} className={buttonClass("secondary", "md")}>
                Оставить отзыв
              </button>
            )}
          </div>
        </div>

        {state.status === "loading" && (
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-56 animate-pulse rounded-panel bg-pearl" />
            ))}
          </div>
        )}

        {state.status === "error" && (
          <p className="mt-10 rounded-panel border border-line bg-pearl p-8 text-smoke">
            Не удалось загрузить отзывы. Обновите страницу чуть позже.
          </p>
        )}

        {state.status === "ready" && reviews.length === 0 && (
          <div className="mt-10 flex flex-col items-start gap-5 rounded-panel border border-dashed border-mauve/30 bg-pearl p-8 sm:flex-row sm:items-center sm:p-10">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-powder text-powder-deep">
              <MessageSquareText className="size-5" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="text-lg text-ink">Здесь будут отзывы наших пациентов.</p>
              <p className="mt-1 text-smoke">Были у нас на процедуре? Расскажите, как всё прошло.</p>
            </div>
            <button type="button" onClick={() => setFormOpen(true)} className={buttonClass("primary", "md")}>
              Написать первый отзыв
            </button>
          </div>
        )}

        {reviews.length > 0 && (
          <ul
            ref={trackRef}
            className="scrollbar-none -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"
            aria-label="Отзывы"
          >
            {reviews.map((review) => (
              <li
                key={review.id}
                className="flex w-[85%] shrink-0 snap-start flex-col rounded-panel border border-line bg-pearl p-6 sm:w-[46%] sm:p-7 lg:w-[calc((100%-2rem)/3)]"
              >
                <Stars rating={review.rating} />
                <blockquote className="mt-5 flex-1 text-ink/90">
                  <p className="whitespace-pre-line">{review.text}</p>
                </blockquote>
                <footer className="mt-6 border-t border-line pt-4 text-sm">
                  <p className="font-medium text-ink">{review.name}</p>
                  <p className="mt-0.5 text-smoke">
                    {review.serviceName ? `${review.serviceName}, ` : ""}
                    {formatTimestamp(review.createdAt).split(",")[0]}
                  </p>
                </footer>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ReviewForm open={formOpen} onClose={() => setFormOpen(false)} />
    </section>
  );
}
