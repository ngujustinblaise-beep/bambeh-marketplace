interface RateEntry { count: number; resetAt: number; }

export class RateLimiter {
  private counts = new Map<string, RateEntry>();

  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now   = Date.now();
    const entry = this.counts.get(key);
    if (!entry || now > entry.resetAt) {
      this.counts.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= maxRequests) return false;
    entry.count += 1;
    return true;
  }

  reset(key: string): void {
    this.counts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();
export default rateLimiter;

