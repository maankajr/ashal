import crypto from "crypto";

export const ACCESS_COOKIE = "ashal_access";
export const REFRESH_COOKIE = "ashal_refresh";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function parseDurationToMs(value, fallbackMs) {
  if (!value || typeof value !== "string") return fallbackMs;

  const match = /^(\d+)([smhd])$/i.exec(value.trim());
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * multipliers[unit];
}

function baseCookieOptions({ maxAge, path = "/" } = {}) {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path,
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function setAuthCookies(res, { accessToken, refreshToken }) {
  const accessMaxAge = parseDurationToMs(process.env.JWT_EXPIRES_IN, 15 * 60_000);
  const refreshMaxAge = parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN, 7 * 86_400_000);

  res.cookie(ACCESS_COOKIE, accessToken, baseCookieOptions({ maxAge: accessMaxAge, path: "/" }));
  res.cookie(
    REFRESH_COOKIE,
    refreshToken,
    baseCookieOptions({ maxAge: refreshMaxAge, path: "/api/auth" })
  );
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, baseCookieOptions({ path: "/" }));
  res.clearCookie(REFRESH_COOKIE, baseCookieOptions({ path: "/api/auth" }));
}
