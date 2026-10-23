"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { buttonClass, inputClass, labelClass } from "../ui/styles";

export function LoginForm({ disabled, devHint }: { disabled: boolean; devHint: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) {
      setError("Введите пароль");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Не удалось войти");
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setSubmitting(false);
    }
  }

  if (disabled) {
    return (
      <p className="rounded-2xl bg-powder px-4 py-3 text-sm text-powder-deep">
        Вход отключён: задайте переменную окружения <code className="font-medium">ADMIN_PASSWORD</code> в настройках
        хостинга и перезапустите сайт.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="admin-password" className={labelClass}>
          Пароль
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={visible ? "text" : "password"}
            className={`${inputClass} pr-12`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            autoFocus
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "admin-password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-smoke hover:bg-ink/5 hover:text-ink"
            aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
          >
            {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
        {error && (
          <p id="admin-password-error" role="alert" className="mt-2 text-sm text-powder-deep">
            {error}
          </p>
        )}
      </div>

      <button type="submit" disabled={submitting} className={buttonClass("primary", "lg", "w-full")}>
        {submitting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
        Войти
      </button>

      {devHint && (
        <p className="text-sm text-smoke">
          Режим разработки: пароль по умолчанию <code className="font-medium text-ink">admin</code>. Для продакшена
          задайте ADMIN_PASSWORD.
        </p>
      )}
    </form>
  );
}
