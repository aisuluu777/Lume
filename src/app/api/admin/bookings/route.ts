import { isAuthorized } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { errorJson, json } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET /api/admin/bookings — все заявки (новые сверху). */
export async function GET(request: Request) {
  if (!isAuthorized(request)) return errorJson(401, "Требуется вход");

  try {
    const store = getStore();
    const bookings = await store.listBookings(2000);
    return json({ bookings, storage: { kind: store.kind, persistent: store.persistent } });
  } catch (error) {
    console.error("[admin/bookings]", error);
    return errorJson(500, "Не удалось загрузить заявки. Проверьте подключение к базе данных.");
  }
}
