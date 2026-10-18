/**
 * Production In-Memory Token Bucket / Sliding Window Rate Limiter
 * Provides IP and Key-based rate limiting to prevent brute-force attacks,
 * credential stuffing, and high-frequency abuse.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number; // Maximum allowed requests within window
  windowMs: number;    // Window duration in milliseconds
}

// In-memory storage with periodic automated cleanup
const storage = new Map<string, RateLimitRecord>();

// Cleanup stale records every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of storage.entries()) {
      if (record.resetAt <= now) {
        storage.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

/**
 * Checks and increments rate limit for a given identifier key (e.g., "login:192.168.1.1" or "reset:user@domain.com")
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const record = storage.get(key);

  if (!record || record.resetAt <= now) {
    // New or expired window
    storage.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
      retryAfterSeconds: 0,
    };
  }

  // Active window
  if (record.count >= config.maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfterSeconds,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
    retryAfterSeconds: 0,
  };
}

/**
 * Extract client IP address securely from headers (respecting standard reverse proxies)
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the left-most client IP if a chain is present
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Reset rate limit on successful event (e.g. valid password resets failed attempt counter)
 */
export function resetRateLimit(key: string): void {
  storage.delete(key);
}
