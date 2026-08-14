import crypto from "crypto";

export function createRequestId() {
  return crypto.randomUUID();
}

export function success(res, data = null, meta = undefined, status = 200) {
  const payload = {
    success: true,
    data,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(status).json(payload);
}

export function fail(
  res,
  {
    status = 500,
    code = "INTERNAL_ERROR",
    message = "Something went wrong",
    details = null,
    requestId = null,
  }
) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details,
      requestId,
    },
  });
}
