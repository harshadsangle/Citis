import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

type Bucket = { count: number; resetAt: number };

@Injectable()
export class LmsContentRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  assertAllowed(scope: string, key: string, limit = 120, windowMs = 60_000) {
    const now = Date.now();
    const bucketKey = `${scope}:${key}`;
    const existing = this.buckets.get(bucketKey);
    const bucket = !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : existing;

    if (bucket.count >= limit) {
      throw new HttpException("Too many learning content requests. Try again shortly.", HttpStatus.TOO_MANY_REQUESTS);
    }

    bucket.count += 1;
    this.buckets.set(bucketKey, bucket);

    if (this.buckets.size > 10_000) {
      for (const [key, value] of this.buckets) {
        if (value.resetAt <= now) this.buckets.delete(key);
      }
    }
  }
}