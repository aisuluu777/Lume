import { clearedSessionCookie } from "@/lib/auth";
import { errorJson, isSameOrigin, json } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorJson(403, "Запрос отклонён");
  return json({ ok: true }, 200, { "Set-Cookie": clearedSessionCookie(request) });
}
