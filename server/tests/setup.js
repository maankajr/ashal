import "dotenv/config";
import mongoose from "mongoose";

export async function setupTestDB() {
  if (mongoose.connection.readyState === 0) {
    const baseUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ashal";
    const testUri =
      process.env.TEST_MONGODB_URI ||
      (baseUri.includes("/ashal") ? baseUri.replace(/\/ashal(\?|$)/, "/ashal_test$1") : baseUri);

    mongoose.set("strictQuery", true);
    await mongoose.connect(testUri);
  }
}

export async function teardownTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export function extractCookies(res) {
  const headers = res.headers["set-cookie"] || [];
  const jar = {};
  for (const str of headers) {
    const [part] = str.split(";");
    const [key, val] = part.split("=");
    if (key && val) jar[key.trim()] = val.trim();
  }
  return jar;
}

export function cookieString(jar = {}) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}
