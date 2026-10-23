import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Авторизация админ-панели: пароль из ADMIN_PASSWORD и подписанная
 * HMAC-сессия в httpOnly-cookie на 7 дней. Смена пароля автоматически
 * завершает все сессии (если SESSION_SECRET не задан отдельно).
 */

export const SESSION_COOKIE = "lume_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const DEV_PASSWORD = "admin";

export function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (password) return password;
  // В разработке можно войти без настройки; в продакшене пароль обязателен
  return process.env.NODE_ENV === "production" ? null : DEV_PASSWORD;
}

export function usesDevPassword(): boolean {
  return !process.env.ADMIN_PASSWORD?.trim() && process.env.NODE_ENV !== "production";
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function sessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  const password = getAdminPassword();
  return password ? sha256(`lume-session:${password}`).toString("hex") : null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function verifyPassword(input: string): boolean {
  const password = getAdminPassword();
  if (!password) return false;
  return timingSafeEqual(sha256(input), sha256(password));
}

export function createSessionToken(now = Date.now()): string | null {
  const key = sessionSecret();
  if (!key) return null;
  const payload = `v1.${Math.floor(now / 1000) + SESSION_TTL_SECONDS}`;
  return `${payload}.${sign(payload, key)}`;
}

export function verifySessionToken(token: string | null | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const key = sessionSecret();
  if (!key) return false;

  const [version, expires, signature] = token.split(".");
  if (version !== "v1" || !expires || !signature) return false;
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 < now) return false;

  const expected = Buffer.from(sign(`${version}.${expires}`, key));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(index + 1).trim());
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function isAuthorized(request: Request): boolean {
  return verifySessionToken(readCookie(request, SESSION_COOKIE));
}

function isHttps(request: Request): boolean {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
}

export function sessionCookie(token: string, request: Request): string {
  const secure = isHttps(request) ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearedSessionCookie(request: Request): string {
  const secure = isHttps(request) ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
