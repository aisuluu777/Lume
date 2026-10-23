import path from "node:path";
import { createJsonStore } from "./json-store";
import { createPostgresStore } from "./postgres-store";
import type { Store } from "./store";

export type { Store } from "./store";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function createStore(): Store {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) return createPostgresStore(databaseUrl);

  // Без DATABASE_URL — JSON-файл. На Vercel файловая система доступна
  // только в /tmp и очищается, на бесплатном Render — при каждом рестарте.
  const ephemeralHost = Boolean(process.env.VERCEL || process.env.RENDER);
  const dir =
    process.env.DATA_DIR?.trim() || (process.env.VERCEL ? "/tmp/lume-data" : path.join(process.cwd(), ".data"));

  if (ephemeralHost && !process.env.DATA_DIR) {
    console.warn(
      "[db] DATABASE_URL не задан: заявки сохраняются во временный файл и пропадут при перезапуске. " +
        "Подключите PostgreSQL — см. README.",
    );
  }

  return createJsonStore(dir, { persistent: !ephemeralHost || Boolean(process.env.DATA_DIR) });
}

const globalForStore = globalThis as typeof globalThis & { __lumeStore?: Store };

/** Хранилище-одиночка (переживает hot reload в режиме разработки). */
export function getStore(): Store {
  if (!globalForStore.__lumeStore) globalForStore.__lumeStore = createStore();
  return globalForStore.__lumeStore;
}
