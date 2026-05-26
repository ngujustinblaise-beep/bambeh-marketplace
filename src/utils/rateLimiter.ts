class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  checkLimit(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];

    // Remove old attempts outside window
    const recentAttempts = userAttempts.filter((time) => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return false; // Rate limit exceeded
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// USAGE:
// if (!rateLimiter.checkLimit(userId, 5, 60000)) {
//   alert('Too many attempts. Please wait 1 minute.');
//   return;
// }
