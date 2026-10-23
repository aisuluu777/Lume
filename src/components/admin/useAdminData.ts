"use client";

import { useCallback, useEffect, useState } from "react";

type Result<T> = { key: number; data?: T; error?: string };

/**
 * Загрузка данных админ-панели с автообновлением раз в минуту.
 * При истёкшей сессии (401) отправляет на страницу входа.
 */
export function useAdminData<T>(url: string, intervalMs = 60_000) {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          // Сессия истекла — полная перезагрузка на страницу входа
          window.location.assign("/admin/login");
          return;
        }
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "Не удалось загрузить данные");
        setResult({ key: reloadKey, data: body as T });
      })
      .catch((error: Error) => {
        if (error.name === "AbortError") return;
        setResult((previous) => ({ key: reloadKey, data: previous?.data, error: error.message }));
      });
    return () => controller.abort();
  }, [url, reloadKey]);

  useEffect(() => {
    if (!intervalMs) return;
    const id = setInterval(() => setReloadKey((value) => value + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const reload = useCallback(() => setReloadKey((value) => value + 1), []);
  const update = useCallback(
    (change: (data: T) => T) =>
      setResult((previous) => (previous?.data ? { ...previous, data: change(previous.data) } : previous)),
    [],
  );

  return {
    data: result?.data,
    error: result?.error,
    loading: result?.key !== reloadKey,
    reload,
    update,
  };
}
