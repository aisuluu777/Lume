import type {
  Booking,
  BookingStatus,
  BusySlot,
  NewBooking,
  NewReview,
  Review,
  ReviewStatus,
  Specialist,
} from "@/lib/types";

/**
 * Единый интерфейс хранилища. Реализации:
 * - PostgreSQL (если задан DATABASE_URL) — для продакшена;
 * - JSON-файл — для локального запуска без настройки базы.
 */
export interface Store {
  readonly kind: "postgres" | "json";
  /** false — данные пропадут при перезапуске (JSON на Vercel/Render без диска). */
  readonly persistent: boolean;

  listBookings(limit?: number): Promise<Booking[]>;
  /** Занятые интервалы специалистов на дату (без отменённых записей). */
  listBusy(specialistIds: string[], date: string): Promise<BusySlot[]>;
  /**
   * Атомарно создаёт запись: под блокировкой читает занятость кандидатов
   * на дату и вызывает `choose`, который выбирает свободного специалиста.
   * Возвращает null, если время уже заняли.
   */
  createBooking(
    data: NewBooking,
    candidateIds: string[],
    choose: (busy: BusySlot[]) => Specialist | null,
  ): Promise<Booking | null>;
  updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null>;
  deleteBooking(id: string): Promise<boolean>;

  listReviews(status?: ReviewStatus, limit?: number): Promise<Review[]>;
  createReview(data: NewReview): Promise<Review>;
  updateReviewStatus(id: string, status: ReviewStatus): Promise<Review | null>;
  deleteReview(id: string): Promise<boolean>;

  ping(): Promise<void>;
}
