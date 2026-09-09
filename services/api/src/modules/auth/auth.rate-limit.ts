import { HttpException, HttpStatus } from "@nestjs/common";

type Bucket = {
  count: number;
  resetAt: number;
};

const CLEANUP_INTERVAL_MS = 60_000;

export class AuthRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private lastCleanupAt = 0;

  assertAllowed(scope: string, key: string, limit: number, windowMs: number, now = Date.now()) {
    this.cleanup(now);
    const bucketKey = `${scope}:${key}`;
    const bucket = this.buckets.get(bucketKey);
    if (!bucket || bucket.resetAt <= now) return;
    if (bucket.count < limit) return;

    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    throw new HttpException({
      message: "Too many authentication attempts. Please try again later.",
      retryAfterSeconds,
    }, HttpStatus.TOO_MANY_REQUESTS);
  }

  record(scope: string, key: string, windowMs: number, now = Date.now()) {
    this.cleanup(now);
    const bucketKey = `${scope}:${key}`;
    const current = this.buckets.get(bucketKey);
    if (!current || current.resetAt <= now) {
      this.buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
      return;
    }
    current.count += 1;
  }

  clear(scope: string, key: string) {
    this.buckets.delete(`${scope}:${key}`);
  }

  private cleanup(now: number) {
    if (now - this.lastCleanupAt < CLEANUP_INTERVAL_MS) return;
    this.lastCleanupAt = now;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}