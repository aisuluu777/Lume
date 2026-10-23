import { getStore } from "@/lib/db";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET /api/health — проверка работоспособности (для мониторинга и Render). */
export async function GET() {
  const store = getStore();
  try {
    await store.ping();
    return json({ status: "ok", storage: store.kind, persistent: store.persistent });
  } catch (error) {
    console.error("[health]", error);
    return json({ status: "error", storage: store.kind }, 503);
  }
}
