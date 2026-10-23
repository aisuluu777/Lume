import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import type { Booking, BookingStatus, BusySlot, Review, ReviewStatus } from "@/lib/types";
import type { Store } from "./store";

/**
 * Хранилище PostgreSQL. Таблицы создаются автоматически при первом
 * обращении — отдельные миграции запускать не нужно. Работает с Neon,
 * Supabase, Render Postgres и любым другим PostgreSQL 13+.
 */

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  comment         TEXT,
  service_slug    TEXT NOT NULL,
  service_name    TEXT NOT NULL,
  price           INTEGER NOT NULL,
  specialist_id   TEXT NOT NULL,
  specialist_name TEXT NOT NULL,
  date            TEXT NOT NULL,
  time            TEXT NOT NULL,
  duration        INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'confirmed', 'completed', 'cancelled'))
);
CREATE INDEX IF NOT EXISTS bookings_date_specialist_idx ON bookings (date, specialist_id);
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at DESC);

CREATE TABLE IF NOT EXISTS reviews (
  id           UUID PRIMARY KEY,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  name         TEXT NOT NULL,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text         TEXT NOT NULL,
  service_slug TEXT,
  service_name TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'hidden'))
);
CREATE INDEX IF NOT EXISTS reviews_status_created_idx ON reviews (status, created_at DESC);
`;

/** Ключ advisory-блокировки, чтобы два инстанса не создавали схему одновременно. */
const MIGRATION_LOCK = 7_342_001;

type BookingRow = {
  id: string;
  created_at: Date;
  name: string;
  phone: string;
  comment: string | null;
  service_slug: string;
  service_name: string;
  price: number;
  specialist_id: string;
  specialist_name: string;
  date: string;
  time: string;
  duration: number;
  status: BookingStatus;
};

type ReviewRow = {
  id: string;
  created_at: Date;
  name: string;
  rating: number;
  text: string;
  service_slug: string | null;
  service_name: string | null;
  status: ReviewStatus;
};

function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    name: row.name,
    phone: row.phone,
    comment: row.comment,
    serviceSlug: row.service_slug,
    serviceName: row.service_name,
    price: Number(row.price),
    specialistId: row.specialist_id,
    specialistName: row.specialist_name,
    date: row.date,
    time: row.time,
    duration: Number(row.duration),
    status: row.status,
  };
}

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    name: row.name,
    rating: Number(row.rating),
    text: row.text,
    serviceSlug: row.service_slug,
    serviceName: row.service_name,
    status: row.status,
  };
}

const BUSY_SQL = `
  SELECT specialist_id, time, duration
  FROM bookings
  WHERE date = $1 AND specialist_id = ANY($2::text[]) AND status <> 'cancelled'
`;

function toBusy(row: { specialist_id: string; time: string; duration: number }): BusySlot {
  return { specialistId: row.specialist_id, time: row.time, duration: Number(row.duration) };
}

export function createPostgresStore(connectionString: string): Store {
  const pool = new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX ?? 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  pool.on("error", (error) => console.error("[db] Ошибка соединения PostgreSQL:", error.message));

  let schemaReady: Promise<void> | null = null;

  async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  function ensureSchema(): Promise<void> {
    if (!schemaReady) {
      schemaReady = transaction(async (client) => {
        await client.query("SELECT pg_advisory_xact_lock($1)", [MIGRATION_LOCK]);
        await client.query(SCHEMA_SQL);
      }).catch((error) => {
        schemaReady = null;
        throw error;
      });
    }
    return schemaReady;
  }

  return {
    kind: "postgres",
    persistent: true,

    async listBookings(limit = 1000) {
      await ensureSchema();
      const { rows } = await pool.query<BookingRow>("SELECT * FROM bookings ORDER BY created_at DESC LIMIT $1", [
        limit,
      ]);
      return rows.map(toBooking);
    },

    async listBusy(specialistIds, date) {
      await ensureSchema();
      const { rows } = await pool.query(BUSY_SQL, [date, specialistIds]);
      return rows.map(toBusy);
    },

    async createBooking(data, candidateIds, choose) {
      await ensureSchema();
      return transaction(async (client) => {
        // Сериализуем запись на одну дату, чтобы два пациента не заняли одно время
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`booking:${data.date}`]);
        const { rows: busyRows } = await client.query(BUSY_SQL, [data.date, candidateIds]);
        const specialist = choose(busyRows.map(toBusy));
        if (!specialist) return null;

        const { rows } = await client.query<BookingRow>(
          `INSERT INTO bookings
             (id, name, phone, comment, service_slug, service_name, price,
              specialist_id, specialist_name, date, time, duration, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'new')
           RETURNING *`,
          [
            randomUUID(),
            data.name,
            data.phone,
            data.comment,
            data.serviceSlug,
            data.serviceName,
            data.price,
            specialist.id,
            specialist.name,
            data.date,
            data.time,
            data.duration,
          ],
        );
        return toBooking(rows[0]);
      });
    },

    async updateBookingStatus(id, status) {
      await ensureSchema();
      const { rows } = await pool.query<BookingRow>("UPDATE bookings SET status = $2 WHERE id = $1 RETURNING *", [
        id,
        status,
      ]);
      return rows[0] ? toBooking(rows[0]) : null;
    },

    async deleteBooking(id) {
      await ensureSchema();
      const result = await pool.query("DELETE FROM bookings WHERE id = $1", [id]);
      return (result.rowCount ?? 0) > 0;
    },

    async listReviews(status, limit = 500) {
      await ensureSchema();
      const { rows } = status
        ? await pool.query<ReviewRow>("SELECT * FROM reviews WHERE status = $1 ORDER BY created_at DESC LIMIT $2", [
            status,
            limit,
          ])
        : await pool.query<ReviewRow>("SELECT * FROM reviews ORDER BY created_at DESC LIMIT $1", [limit]);
      return rows.map(toReview);
    },

    async createReview(data) {
      await ensureSchema();
      const { rows } = await pool.query<ReviewRow>(
        `INSERT INTO reviews (id, name, rating, text, service_slug, service_name, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [randomUUID(), data.name, data.rating, data.text, data.serviceSlug, data.serviceName],
      );
      return toReview(rows[0]);
    },

    async updateReviewStatus(id, status) {
      await ensureSchema();
      const { rows } = await pool.query<ReviewRow>("UPDATE reviews SET status = $2 WHERE id = $1 RETURNING *", [
        id,
        status,
      ]);
      return rows[0] ? toReview(rows[0]) : null;
    },

    async deleteReview(id) {
      await ensureSchema();
      const result = await pool.query("DELETE FROM reviews WHERE id = $1", [id]);
      return (result.rowCount ?? 0) > 0;
    },

    async ping() {
      await ensureSchema();
      await pool.query("SELECT 1");
    },
  };
}
