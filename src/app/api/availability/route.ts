import { getService, resolveCandidates } from "@/lib/catalog";
import { getStore } from "@/lib/db";
import { errorJson, json } from "@/lib/http";
import { availableSlots, getClinicNow, isValidDate, isWithinBookingWindow } from "@/lib/schedule";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability?service=slug&specialist=id|any&date=YYYY-MM-DD
 * Свободное время для записи на выбранную дату.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const service = getService(params.get("service"));
  const specialistId = params.get("specialist") || "any";
  const date = params.get("date") ?? "";

  if (!service) return errorJson(400, "Неизвестная услуга");
  if (!isValidDate(date)) return errorJson(400, "Неверная дата");

  const candidates = resolveCandidates(service, specialistId);
  if (!candidates) return errorJson(400, "Этот специалист не проводит выбранную процедуру");

  const now = getClinicNow();
  if (!isWithinBookingWindow(date, now)) return json({ date, slots: [] });

  try {
    const busy = await getStore().listBusy(
      candidates.map((specialist) => specialist.id),
      date,
    );
    const slots = availableSlots({ date, duration: service.duration, specialists: candidates, busy, now });
    return json({ date, slots });
  } catch (error) {
    console.error("[availability]", error);
    return errorJson(500, "Не удалось загрузить расписание");
  }
}
