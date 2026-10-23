import { siteConfig } from "@/config/site";
import { getService, resolveCandidates } from "@/lib/catalog";
import { getStore } from "@/lib/db";
import { clientIp, errorJson, json, readJson } from "@/lib/http";
import { notifyNewBooking } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";
import { getClinicNow, isBookableTime, pickSpecialist } from "@/lib/schedule";
import { bookingSchema, fieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** POST /api/bookings — создать запись на процедуру. */
export async function POST(request: Request) {
  if (!rateLimit(`booking:${clientIp(request)}`, 6, 10 * 60_000)) {
    return errorJson(429, "Слишком много заявок подряд. Попробуйте через несколько минут или позвоните нам.");
  }

  const parsed = bookingSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return errorJson(400, "Проверьте данные в форме", { fields: fieldErrors(parsed.error) });
  }
  const input = parsed.data;

  // Скрытое поле заполнил бот — отвечаем как обычно, но ничего не сохраняем
  if (input.website) return json({ booking: null }, 201);

  const service = getService(input.serviceSlug);
  if (!service) {
    return errorJson(400, "Услуга не найдена", { fields: { serviceSlug: "Выберите услугу из списка" } });
  }

  const candidates = resolveCandidates(service, input.specialistId);
  if (!candidates || candidates.length === 0) {
    return errorJson(400, "Этот специалист не проводит выбранную процедуру", {
      fields: { specialistId: "Выберите другого специалиста" },
    });
  }

  if (!isBookableTime(input.date, input.time, service.duration, getClinicNow())) {
    return errorJson(409, "Это время недоступно для записи. Выберите другое.", { code: "slot_unavailable" });
  }

  try {
    const booking = await getStore().createBooking(
      {
        name: input.name,
        phone: input.phone,
        comment: input.comment ? input.comment : null,
        serviceSlug: service.slug,
        serviceName: service.name,
        price: service.price,
        date: input.date,
        time: input.time,
        duration: service.duration,
      },
      candidates.map((specialist) => specialist.id),
      (busy) => pickSpecialist({ candidates, busy, date: input.date, time: input.time, duration: service.duration }),
    );

    if (!booking) {
      return errorJson(409, "Это время только что заняли. Выберите другое, пожалуйста.", { code: "slot_taken" });
    }

    await notifyNewBooking(booking);

    return json(
      {
        booking: {
          id: booking.id,
          serviceName: booking.serviceName,
          specialistName: booking.specialistName,
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
        },
      },
      201,
    );
  } catch (error) {
    console.error("[bookings] Не удалось сохранить запись:", error);
    return errorJson(500, `Не удалось сохранить запись. Позвоните нам: ${siteConfig.contacts.phone}`);
  }
}
