import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import ImageKit, { toFile } from "@imagekit/nodejs";
import { AppError } from "./AppError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "../../public/uploads");

let client;

function getImageKitClient() {
  if (client) return client;

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return null;
  }

  // Official SDK auth uses the private key; public key + URL endpoint are validated
  client = new ImageKit({ privateKey });
  return client;
}

/**
 * Upload a single multer file buffer to ImageKit (or local uploads directory fallback).
 * @returns {Promise<{ url: string, fileId: string }>}
 */
export async function uploadImageBuffer(file, { folder = "/ashal/products" } = {}) {
  const imagekit = getImageKitClient();
  const ext = path.extname(file.originalname || "") || ".jpg";
  const uniqueName = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  // 1. Try ImageKit CDN upload if configured
  if (imagekit) {
    try {
      const fileName = file.originalname || uniqueName;
      const result = await imagekit.files.upload({
        file: await toFile(file.buffer, fileName),
        fileName,
        folder,
        useUniqueFileName: true,
      });

      if (result?.url) {
        return {
          url: result.url,
          fileId: result.fileId || "",
        };
      }
    } catch (error) {
      console.warn("[ImageKit] Cloud upload failed, using local storage:", error.message);
    }
  }

  // 2. Reliable local static file fallback
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const filePath = path.join(UPLOADS_DIR, uniqueName);
    await fs.writeFile(filePath, file.buffer);

    const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
    const url = `${apiUrl.replace(/\/+$/, "")}/uploads/${uniqueName}`;

    return {
      url,
      fileId: uniqueName,
    };
  } catch (err) {
    throw new AppError(err.message || "Image upload failed", {
      status: 500,
      code: "UPLOAD_ERROR",
      details: [{ field: "images", message: "Failed to save uploaded image" }],
    });
  }
}

export async function uploadImageBuffers(files, options) {
  const uploaded = [];
  for (const file of files) {
    uploaded.push(await uploadImageBuffer(file, options));
  }
  return uploaded;
}

