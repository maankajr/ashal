const DEV_PORTS = ["5173", "5174", "5175", "5176"];

const DEFAULT_DEV_ORIGINS = DEV_PORTS.flatMap((port) => [
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
]);

function isLocalDevOrigin(origin) {
  try {
    const url = new URL(origin);
    const isLocalHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return isLocalHost && DEV_PORTS.includes(url.port);
  } catch {
    return false;
  }
}

export function getAllowedOrigins() {
  const fromEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const clientUrl = process.env.CLIENT_URL?.trim();
  const combined = new Set([...fromEnv, ...(clientUrl ? [clientUrl] : [])]);

  if (combined.size === 0) {
    return DEFAULT_DEV_ORIGINS;
  }

  return [...combined];
}

export function createCorsOptions() {
  const allowedOrigins = getAllowedOrigins();
  const isDev = process.env.NODE_ENV !== "production";

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (isDev && isLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  };
}
