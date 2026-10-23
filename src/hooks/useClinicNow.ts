"use client";

import { useSyncExternalStore } from "react";
import { getClinicNow, type ClinicNow } from "@/lib/schedule";

/**
 * Текущие дата и время клиники, обновляются раз в минуту.
 * На сервере возвращает null — так разметка при гидратации совпадает,
 * а зависящие от времени блоки появляются уже в браузере.
 */

let snapshot: ClinicNow | null = null;
let snapshotMinute = -1;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function read(): ClinicNow {
  const minute = Math.floor(Date.now() / 60_000);
  if (!snapshot || minute !== snapshotMinute) {
    snapshot = getClinicNow();
    snapshotMinute = minute;
  }
  return snapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      const previous = snapshot;
      if (read() !== previous) listeners.forEach((notify) => notify());
    }, 15_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useClinicNow(): ClinicNow | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
