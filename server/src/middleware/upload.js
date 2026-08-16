import multer from "multer";
import { AppError } from "../utils/AppError.js";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGE_COUNT = 5;
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const storage = multer.memoryStorage();

function imageFileFilter(_req, file, cb) {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new AppError("Invalid file type", {
        status: 422,
        code: "INVALID_FILE_TYPE",
        details: [
          {
            field: "images",
            message: "Only JPEG, PNG, WebP, and GIF images are allowed",
          },
        ],
      })
    );
  }

  return cb(null, true);
}

export const productImagesUpload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: MAX_IMAGE_COUNT,
  },
  fileFilter: imageFileFilter,
}).array("images", MAX_IMAGE_COUNT);

export function handleMulterUpload(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (!err) return next();

      if (err instanceof AppError) return next(err);

      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError("File too large", {
              status: 422,
              code: "FILE_TOO_LARGE",
              details: [
                {
                  field: "images",
                  message: `Each image must be ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB or smaller`,
                },
              ],
            })
          );
        }

        if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
          return next(
            new AppError("Too many files", {
              status: 422,
              code: "TOO_MANY_FILES",
              details: [
                {
                  field: "images",
                  message: `You can upload up to ${MAX_IMAGE_COUNT} images at a time`,
                },
              ],
            })
          );
        }

        return next(
          new AppError(err.message || "Upload failed", {
            status: 400,
            code: "UPLOAD_ERROR",
            details: [{ field: "images", message: err.message }],
          })
        );
      }

      return next(err);
    });
  };
}
