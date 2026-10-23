import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Booking, BusySlot, Review } from "@/lib/types";
import type { Store } from "./store";

interface Data {
  bookings: Booking[];
  reviews: Review[];
}

/**
 * Хранилище в JSON-файле (по умолчанию .data/db.json). Подходит для
 * локальной разработки и демо. Запись сериализуется очередью, файл
 * перезаписывается атомарно через временный файл.
 */
export function createJsonStore(dir: string, options: { persistent: boolean }): Store {
  const file = path.join(dir, "db.json");
  let queue: Promise<unknown> = Promise.resolve();

  function exclusive<T>(task: () => Promise<T>): Promise<T> {
    const run = queue.then(task, task);
    queue = run.catch(() => undefined);
    return run;
  }

  async function read(): Promise<Data> {
    try {
      const parsed = JSON.parse(await fs.readFile(file, "utf8")) as Partial<Data>;
      return {
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
        reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { bookings: [], reviews: [] };
      throw error;
    }
  }

  async function write(data: Data): Promise<void> {
    await fs.mkdir(dir, { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tmp, file);
  }

  const byCreatedDesc = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);

  return {
    kind: "json",
    persistent: options.persistent,

    async listBookings(limit = 1000) {
      const { bookings } = await read();
      return [...bookings].sort(byCreatedDesc).slice(0, limit);
    },

    async listBusy(specialistIds, date) {
      const { bookings } = await read();
      return bookings
        .filter((b) => b.date === date && b.status !== "cancelled" && specialistIds.includes(b.specialistId))
        .map<BusySlot>((b) => ({ specialistId: b.specialistId, time: b.time, duration: b.duration }));
    },

    createBooking(data, candidateIds, choose) {
      return exclusive(async () => {
        const db = await read();
        const busy = db.bookings
          .filter((b) => b.date === data.date && b.status !== "cancelled" && candidateIds.includes(b.specialistId))
          .map<BusySlot>((b) => ({ specialistId: b.specialistId, time: b.time, duration: b.duration }));
        const specialist = choose(busy);
        if (!specialist) return null;

        const booking: Booking = {
          ...data,
          id: randomUUID(),
          createdAt: new Date().toISOString(),
          specialistId: specialist.id,
          specialistName: specialist.name,
          status: "new",
        };
        db.bookings.push(booking);
        await write(db);
        return booking;
      });
    },

    updateBookingStatus(id, status) {
      return exclusive(async () => {
        const db = await read();
        const booking = db.bookings.find((b) => b.id === id);
        if (!booking) return null;
        booking.status = status;
        await write(db);
        return booking;
      });
    },

    deleteBooking(id) {
      return exclusive(async () => {
        const db = await read();
        const next = db.bookings.filter((b) => b.id !== id);
        if (next.length === db.bookings.length) return false;
        await write({ ...db, bookings: next });
        return true;
      });
    },

    async listReviews(status, limit = 500) {
      const { reviews } = await read();
      return reviews
        .filter((r) => !status || r.status === status)
        .sort(byCreatedDesc)
        .slice(0, limit);
    },

    createReview(data) {
      return exclusive(async () => {
        const db = await read();
        const review: Review = { ...data, id: randomUUID(), createdAt: new Date().toISOString(), status: "pending" };
        db.reviews.push(review);
        await write(db);
        return review;
      });
    },

    updateReviewStatus(id, status) {
      return exclusive(async () => {
        const db = await read();
        const review = db.reviews.find((r) => r.id === id);
        if (!review) return null;
        review.status = status;
        await write(db);
        return review;
      });
    },

    deleteReview(id) {
      return exclusive(async () => {
        const db = await read();
        const next = db.reviews.filter((r) => r.id !== id);
        if (next.length === db.reviews.length) return false;
        await write({ ...db, reviews: next });
        return true;
      });
    },

    async ping() {
      await read();
    },
  };
}
