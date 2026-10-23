import { getService } from "./catalog";
import { formatDateLong, formatPrice } from "./format";
import type { Booking } from "./types";

/**
 * Уведомление о новой записи в Telegram (необязательно).
 * Нужны переменные TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID — см. README.
 * Ошибка отправки не мешает сохранению заявки.
 */

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function notifyNewBooking(booking: Booking): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return;

  const lines = [
    "<b>Новая запись на сайте</b>",
    "",
    `<b>${escapeHtml(booking.serviceName)}</b> — ${escapeHtml(formatPrice({ price: booking.price, priceFrom: getService(booking.serviceSlug)?.priceFrom }))}`,
    `${escapeHtml(formatDateLong(booking.date))}, ${booking.time}`,
    `Специалист: ${escapeHtml(booking.specialistName)}`,
    "",
    `Пациент: ${escapeHtml(booking.name)}`,
    `Телефон: ${escapeHtml(booking.phone)}`,
  ];
  if (booking.comment) lines.push(`Комментарий: ${escapeHtml(booking.comment)}`);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lines.join("\n"), parse_mode: "HTML" }),
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) console.error("[notify] Telegram ответил", response.status, await response.text());
  } catch (error) {
    console.error("[notify] Не удалось отправить уведомление в Telegram:", (error as Error).message);
  }
}
