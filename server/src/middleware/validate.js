import { AppError } from "../utils/AppError.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(req, _res, next) {
  const errors = [];
  const { name, email, password } = req.body || {};

  if (!name || String(name).trim().length < 2) {
    errors.push({ field: "name", message: "Name is required (min 2 characters)" });
  }

  if (!email || !emailPattern.test(String(email).trim().toLowerCase())) {
    errors.push({ field: "email", message: "A valid email is required" });
  }

  if (!password || String(password).length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters" });
  }

  if (errors.length) {
    return next(
      new AppError("Validation failed", {
        status: 422,
        code: "VALIDATION_ERROR",
        details: errors,
      })
    );
  }

  next();
}

export function validateLogin(req, _res, next) {
  const errors = [];
  const { email, password } = req.body || {};

  if (!email || !emailPattern.test(String(email).trim().toLowerCase())) {
    errors.push({ field: "email", message: "A valid email is required" });
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  }

  if (errors.length) {
    return next(
      new AppError("Validation failed", {
        status: 422,
        code: "VALIDATION_ERROR",
        details: errors,
      })
    );
  }

  next();
}

export function validateCartItem(req, _res, next) {
  const errors = [];
  const { productId, quantity } = req.body || {};

  if (!productId) {
    errors.push({ field: "productId", message: "productId is required" });
  }

  if (quantity !== undefined && (Number(quantity) < 1 || !Number.isFinite(Number(quantity)))) {
    errors.push({ field: "quantity", message: "quantity must be a positive number" });
  }

  if (errors.length) {
    return next(
      new AppError("Validation failed", {
        status: 422,
        code: "VALIDATION_ERROR",
        details: errors,
      })
    );
  }

  next();
}

export function validateUpdateProfile(req, _res, next) {
  const errors = [];
  const { name, phone, addresses, email, role } = req.body || {};

  if (email !== undefined) {
    errors.push({ field: "email", message: "Email cannot be changed here" });
  }

  if (role !== undefined) {
    errors.push({ field: "role", message: "Role cannot be changed here" });
  }

  if (name !== undefined && String(name).trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters" });
  }

  if (phone !== undefined && phone !== null && String(phone).length > 30) {
    errors.push({ field: "phone", message: "Phone number is too long" });
  }

  if (addresses !== undefined) {
    if (!Array.isArray(addresses)) {
      errors.push({ field: "addresses", message: "addresses must be an array" });
    } else {
      addresses.forEach((address, index) => {
        const prefix = `addresses[${index}]`;
        if (!address?.label || !String(address.label).trim()) {
          errors.push({ field: `${prefix}.label`, message: "Label is required" });
        }
        if (!address?.line1 || !String(address.line1).trim()) {
          errors.push({ field: `${prefix}.line1`, message: "Address line is required" });
        }
        if (!address?.city || !String(address.city).trim()) {
          errors.push({ field: `${prefix}.city`, message: "City is required" });
        }
        if (!address?.country || !String(address.country).trim()) {
          errors.push({ field: `${prefix}.country`, message: "Country is required" });
        }
      });
    }
  }

  const hasUpdatableField =
    name !== undefined || phone !== undefined || addresses !== undefined;

  if (!hasUpdatableField && errors.length === 0) {
    errors.push({ field: "body", message: "At least one updatable field is required" });
  }

  if (errors.length) {
    return next(
      new AppError("Validation failed", {
        status: 422,
        code: "VALIDATION_ERROR",
        details: errors,
      })
    );
  }

  next();
}

export function validateAdminStatus(req, _res, next) {
  const status = req.body?.status;

  if (!status || !String(status).trim()) {
    return next(
      new AppError("Validation failed", {
        status: 422,
        code: "VALIDATION_ERROR",
        details: [{ field: "status", message: "status is required" }],
      })
    );
  }

  next();
}
