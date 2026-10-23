import { isAuthorized } from "@/lib/auth";
import { getStore, isUuid } from "@/lib/db";
import { errorJson, isSameOrigin, json, readJson } from "@/lib/http";
import { bookingStatusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** PATCH /api/admin/bookings/:id — сменить статус заявки. */
export async function PATCH(request: Request, { params }: Context) {
  if (!isAuthorized(request)) return errorJson(401, "Требуется вход");
  if (!isSameOrigin(request)) return errorJson(403, "Запрос отклонён");

  const { id } = await params;
  if (!isUuid(id)) return errorJson(404, "Заявка не найдена");

  const parsed = bookingStatusSchema.safeParse(await readJson(request));
  if (!parsed.success) return errorJson(400, "Неизвестный статус");

  try {
    const booking = await getStore().updateBookingStatus(id, parsed.data.status);
    if (!booking) return errorJson(404, "Заявка не найдена");
    return json({ booking });
  } catch (error) {
    console.error("[admin/bookings/:id]", error);
    return errorJson(500, "Не удалось обновить заявку");
  }
}

/** DELETE /api/admin/bookings/:id — удалить заявку. */
export async function DELETE(request: Request, { params }: Context) {
  if (!isAuthorized(request)) return errorJson(401, "Требуется вход");
  if (!isSameOrigin(request)) return errorJson(403, "Запрос отклонён");

  const { id } = await params;
  if (!isUuid(id)) return errorJson(404, "Заявка не найдена");

  try {
    const deleted = await getStore().deleteBooking(id);
    if (!deleted) return errorJson(404, "Заявка не найдена");
    return json({ ok: true });
  } catch (error) {
    console.error("[admin/bookings/:id]", error);
    return errorJson(500, "Не удалось удалить заявку");
  }
}
