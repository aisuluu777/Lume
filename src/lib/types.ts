export type CategoryId = "injection" | "hardware" | "care" | "laser";

export interface Category {
  id: CategoryId;
  name: string;
  /** Короткое название для фильтров и меток. */
  short: string;
  description: string;
}

export interface Service {
  slug: string;
  name: string;
  category: CategoryId;
  short: string;
  description: string;
  effects: string[];
  indications: string[];
  contraindications: string[];
  /** Длительность процедуры в минутах — по ней считаются слоты записи. */
  duration: number;
  /** Цена в рублях. 0 — бесплатно. */
  price: number;
  /** Показывать «от» перед ценой. */
  priceFrom?: boolean;
  /** Единица цены, например «за зону» или «за 1 мл». */
  priceUnit?: string;
  /** Рекомендуемый курс. */
  sessions?: string;
  popular?: boolean;
  /** Явный список специалистов. Если не задан — все, кто работает в категории. */
  specialistIds?: string[];
}

export interface Specialist {
  id: string;
  name: string;
  role: string;
  /** Стаж в годах. */
  experience: number;
  categories: CategoryId[];
  /** Рабочие дни: 0 — воскресенье … 6 — суббота. */
  workDays: number[];
  bio: string;
}

export interface Concern {
  id: string;
  label: string;
  note: string;
  services: string[];
}

export type BookingStatus = "new" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  comment: string | null;
  serviceSlug: string;
  serviceName: string;
  price: number;
  specialistId: string;
  specialistName: string;
  /** YYYY-MM-DD в часовом поясе клиники. */
  date: string;
  /** HH:MM */
  time: string;
  duration: number;
  status: BookingStatus;
}

export type NewBooking = Omit<Booking, "id" | "createdAt" | "status" | "specialistId" | "specialistName">;

export interface BusySlot {
  specialistId: string;
  time: string;
  duration: number;
}

export type ReviewStatus = "pending" | "approved" | "hidden";

export interface Review {
  id: string;
  createdAt: string;
  name: string;
  rating: number;
  text: string;
  serviceSlug: string | null;
  serviceName: string | null;
  status: ReviewStatus;
}

export type NewReview = Pick<Review, "name" | "rating" | "text" | "serviceSlug" | "serviceName">;

export const BOOKING_STATUSES: BookingStatus[] = ["new", "confirmed", "completed", "cancelled"];
export const REVIEW_STATUSES: ReviewStatus[] = ["pending", "approved", "hidden"];
