// Simple in-memory rate limiter (per process). Not suitable for multi-instance production.
// Sliding window approximation using an array of timestamps per key.

interface Bucket { times: number[] }
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function checkRateLimit(key: string, limit: number, intervalMs: number): RateLimitResult {
  const now = Date.now();
  const start = now - intervalMs;
  let bucket = buckets.get(key);
  if (!bucket) { bucket = { times: [] }; buckets.set(key, bucket); }
  // Drop old timestamps
  bucket.times = bucket.times.filter(t => t >= start);
  if (bucket.times.length >= limit) {
    const earliest = bucket.times[0];
    const resetMs = intervalMs - (now - earliest);
    return { allowed: false, remaining: 0, resetMs };
  }
  bucket.times.push(now);
  return { allowed: true, remaining: limit - bucket.times.length, resetMs: intervalMs };
}
