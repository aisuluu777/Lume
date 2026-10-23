import { isAuthorized } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { errorJson, json } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET /api/admin/reviews — все отзывы, включая ожидающие проверки. */
export async function GET(request: Request) {
  if (!isAuthorized(request)) return errorJson(401, "Требуется вход");

  try {
    const reviews = await getStore().listReviews(undefined, 1000);
    return json({ reviews });
  } catch (error) {
    console.error("[admin/reviews]", error);
    return errorJson(500, "Не удалось загрузить отзывы");
  }
}
