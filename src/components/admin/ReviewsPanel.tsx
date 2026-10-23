"use client";

import { Eye, EyeOff, MessageSquareText, RefreshCw, Trash } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatTimestamp } from "@/lib/format";
import { REVIEW_STATUSES, type Review, type ReviewStatus } from "@/lib/types";
import { Stars } from "../home/Reviews";
import { buttonClass } from "../ui/styles";
import { Chip } from "./BookingsPanel";
import { useAdminData } from "./useAdminData";

const REVIEW_META: Record<ReviewStatus, { label: string; filter: string; className: string }> = {
  pending: { label: "На проверке", filter: "На проверке", className: "bg-lilac text-lilac-deep" },
  approved: { label: "Опубликован", filter: "Опубликованные", className: "bg-aloe text-aloe-deep" },
  hidden: { label: "Скрыт", filter: "Скрытые", className: "bg-porcelain text-smoke" },
};

export function ReviewsPanel() {
  const { data, error, loading, reload, update } = useAdminData<{ reviews: Review[] }>("/api/admin/reviews");
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [actionError, setActionError] = useState("");

  const reviews = data?.reviews ?? [];
  const rows = reviews.filter((review) => filter === "all" || review.status === filter);
  const count = (status: ReviewStatus) => reviews.filter((review) => review.status === status).length;

  async function setStatus(review: Review, status: ReviewStatus) {
    setActionError("");
    const response = await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => null);
    if (response?.ok) {
      update((d) => ({ reviews: d.reviews.map((item) => (item.id === review.id ? { ...item, status } : item)) }));
    } else {
      setActionError("Не удалось изменить отзыв. Попробуйте ещё раз.");
    }
  }

  async function remove(review: Review) {
    if (!window.confirm(`Удалить отзыв от «${review.name}»?`)) return;
    const response = await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" }).catch(() => null);
    if (response?.ok) update((d) => ({ reviews: d.reviews.filter((item) => item.id !== review.id) }));
    else setActionError("Не удалось удалить отзыв.");
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Статус отзыва">
          {REVIEW_STATUSES.map((status) => (
            <Chip key={status} active={filter === status} onClick={() => setFilter(status)}>
              {REVIEW_META[status].filter} <span className="tabular opacity-60">{count(status)}</span>
            </Chip>
          ))}
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>
            Все <span className="tabular opacity-60">{reviews.length}</span>
          </Chip>
        </div>
        <button
          type="button"
          onClick={reload}
          className={buttonClass("secondary", "sm", "self-start")}
          disabled={loading}
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} aria-hidden="true" />
          Обновить
        </button>
      </div>

      {(error || actionError) && (
        <p role="alert" className="mt-4 rounded-2xl bg-powder px-4 py-3 text-sm text-powder-deep">
          {actionError || error}
        </p>
      )}

      <div className="mt-6">
        {!data && loading && <div className="h-48 animate-pulse rounded-panel bg-pearl" aria-label="Загрузка" />}

        {data && rows.length === 0 && (
          <div className="flex flex-col items-center rounded-panel border border-line bg-pearl px-6 py-16 text-center">
            <MessageSquareText className="size-8 text-smoke" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-4 text-lg">{filter === "pending" ? "Новых отзывов нет" : "Отзывов нет"}</p>
            <p className="mt-1 text-sm text-smoke">
              Отзывы с сайта попадают сюда и публикуются только после вашей проверки.
            </p>
          </div>
        )}

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rows.map((review) => (
            <li key={review.id} className="flex flex-col rounded-panel border border-line bg-pearl p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{review.name}</p>
                  <p className="text-sm text-smoke">
                    {review.serviceName ?? "Процедура не указана"}, {formatTimestamp(review.createdAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                    REVIEW_META[review.status].className,
                  )}
                >
                  {REVIEW_META[review.status].label}
                </span>
              </div>
              <Stars rating={review.rating} className="mt-4" />
              <p className="mt-3 flex-1 whitespace-pre-line text-ink/90">{review.text}</p>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                {review.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => setStatus(review, "approved")}
                    className={buttonClass("primary", "sm")}
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    Опубликовать
                  </button>
                )}
                {review.status !== "hidden" && (
                  <button
                    type="button"
                    onClick={() => setStatus(review, "hidden")}
                    className={buttonClass("secondary", "sm")}
                  >
                    <EyeOff className="size-4" aria-hidden="true" />
                    Скрыть
                  </button>
                )}
                <button type="button" onClick={() => remove(review)} className={buttonClass("danger", "sm", "ml-auto")}>
                  <Trash className="size-4" aria-hidden="true" />
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
