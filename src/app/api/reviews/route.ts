import { getService } from "@/lib/catalog";
import { getStore } from "@/lib/db";
import { clientIp, errorJson, json, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { fieldErrors, reviewSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/reviews — опубликованные (одобренные) отзывы. */
export async function GET() {
  try {
    const reviews = await getStore().listReviews("approved", 30);
    return json({
      reviews: reviews.map(({ id, name, rating, text, serviceName, createdAt }) => ({
        id,
        name,
        rating,
        text,
        serviceName,
        createdAt,
      })),
    });
  } catch (error) {
    console.error("[reviews]", error);
    return errorJson(500, "Не удалось загрузить отзывы");
  }
}

/** POST /api/reviews — новый отзыв. Публикуется после проверки в админ-панели. */
export async function POST(request: Request) {
  if (!rateLimit(`review:${clientIp(request)}`, 3, 60 * 60_000)) {
    return errorJson(429, "Вы уже отправили несколько отзывов. Попробуйте позже.");
  }

  const parsed = reviewSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return errorJson(400, "Проверьте данные в форме", { fields: fieldErrors(parsed.error) });
  }
  const input = parsed.data;
  if (input.website) return json({ ok: true }, 201);

  const service = getService(input.serviceSlug);

  try {
    await getStore().createReview({
      name: input.name,
      rating: input.rating,
      text: input.text,
      serviceSlug: service?.slug ?? null,
      serviceName: service?.name ?? null,
    });
    return json({ ok: true }, 201);
  } catch (error) {
    console.error("[reviews] Не удалось сохранить отзыв:", error);
    return errorJson(500, "Не удалось отправить отзыв. Попробуйте позже.");
  }
}
