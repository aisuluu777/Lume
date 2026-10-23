/**
 * Простой ограничитель частоты запросов в памяти процесса.
 * Защищает формы от спама и перебора пароля. В serverless-среде у каждого
 * инстанса свой счётчик — для небольшой клиники этого достаточно.
 */

const buckets = new Map<string, number[]>();
let lastSweep = 0;

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  if (now - lastSweep > 60_000) {
    for (const [bucketKey, hits] of buckets) {
      if (hits.every((time) => now - time > windowMs)) buckets.delete(bucketKey);
    }
    lastSweep = now;
  }

  const hits = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}
