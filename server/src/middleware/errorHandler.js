import { AppError } from "../utils/AppError.js";
import { createRequestId, fail } from "../utils/response.js";

export function notFoundHandler(req, _res, next) {
  next(
    new AppError(`Route not found: ${req.method} ${req.originalUrl}`, {
      status: 404,
      code: "NOT_FOUND",
    })
  );
}

export function errorHandler(err, req, res, _next) {
  const requestId = req.requestId || createRequestId();

  if (err.name === "ValidationError") {
    const details = Object.values(err.errors || {}).map((item) => ({
      field: item.path,
      message: item.message,
    }));

    return fail(res, {
      status: 422,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details,
      requestId,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return fail(res, {
      status: 409,
      code: "CONFLICT",
      message: `${field} already exists`,
      details: [{ field, message: `${field} must be unique` }],
      requestId,
    });
  }

  if (err.name === "CastError") {
    return fail(res, {
      status: 400,
      code: "BAD_REQUEST",
      message: "Invalid identifier",
      details: [{ field: err.path, message: "Invalid ObjectId" }],
      requestId,
    });
  }

  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 500 ? "INTERNAL_ERROR" : "ERROR");

  if (status >= 500) {
    console.error(err);
  }

  return fail(res, {
    status,
    code: typeof code === "string" ? code : "ERROR",
    message: err.message || "Something went wrong",
    details: err.details || null,
    requestId,
  });
}
