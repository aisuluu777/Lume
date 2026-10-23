import { createSessionToken, getAdminPassword, sessionCookie, verifyPassword } from "@/lib/auth";
import { clientIp, errorJson, isSameOrigin, json, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorJson(403, "Запрос отклонён");

  if (!getAdminPassword()) {
    return errorJson(503, "Вход отключён: задайте переменную окружения ADMIN_PASSWORD на сервере.");
  }

  if (!rateLimit(`login:${clientIp(request)}`, 10, 15 * 60_000)) {
    return errorJson(429, "Слишком много попыток входа. Подождите 15 минут.");
  }

  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success || !verifyPassword(parsed.data.password)) {
    return errorJson(401, "Неверный пароль");
  }

  const token = createSessionToken();
  if (!token) return errorJson(503, "Вход недоступен");

  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token, request) });
}
