import { isAuthorized } from "@/lib/auth";
import { getStore, isUuid } from "@/lib/db";
import { errorJson, isSameOrigin, json, readJson } from "@/lib/http";
import { reviewStatusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** PATCH /api/admin/reviews/:id — опубликовать или скрыть отзыв. */
export async function PATCH(request: Request, { params }: Context) {
  if (!isAuthorized(request)) return errorJson(401, "Требуется вход");
  if (!isSameOrigin(request)) return errorJson(403, "Запрос отклонён");

  const { id } = await params;
  if (!isUuid(id)) return errorJson(404, "Отзыв не найден");

  const parsed = reviewStatusSchema.safeParse(await readJson(request));
  if (!parsed.success) return errorJson(400, "Неизвестный статус");

  try {
    const review = await getStore().updateReviewStatus(id, parsed.data.status);
    if (!review) return errorJson(404, "Отзыв не найден");
    return json({ review });
  } catch (error) {
    console.error("[admin/reviews/:id]", error);
    return errorJson(500, "Не удалось обновить отзыв");
  }
}

/** DELETE /api/admin/reviews/:id — удалить отзыв. */
export async function DELETE(request: Request, { params }: Context) {
  if (!isAuthorized(request)) return errorJson(401, "Требуется вход");
  if (!isSameOrigin(request)) return errorJson(403, "Запрос отклонён");

  const { id } = await params;
  if (!isUuid(id)) return errorJson(404, "Отзыв не найден");

  try {
    const deleted = await getStore().deleteReview(id);
    if (!deleted) return errorJson(404, "Отзыв не найден");
    return json({ ok: true });
  } catch (error) {
    console.error("[admin/reviews/:id]", error);
    return errorJson(500, "Не удалось удалить отзыв");
  }
}
