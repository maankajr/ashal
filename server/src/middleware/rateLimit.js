import { AppError } from "../utils/AppError.js";

/**
 * Lightweight in-memory rate limiter (no extra dependencies).
 * Suitable for single-process Node. Resets on server restart.
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 5,
  keyPrefix = "rl",
  message = "Too many requests. Please try again later.",
} = {}) {
  const hits = new Map();

  function prune(now) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }

  return function rateLimit(req, _res, next) {
    const now = Date.now();
    if (hits.size > 5000) prune(now);

    const ip =
      req.ip ||
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    const key = `${keyPrefix}:${ip}`;
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      return next(
        new AppError(message, {
          status: 429,
          code: "RATE_LIMITED",
          details: [
            {
              field: "form",
              message: `Limit is ${max} submissions per ${Math.round(windowMs / 60000)} minutes`,
            },
          ],
        })
      );
    }

    return next();
  };
}
