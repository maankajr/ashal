import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";

const base = "http://localhost:5000/api";
const email = `auth-test-${Date.now()}@ashal.test`;
const password = "TestPass123!";

function parseSetCookie(res) {
  const raw =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : res.headers.get("set-cookie")
        ? [res.headers.get("set-cookie")]
        : [];
  const jar = {};
  for (const line of raw) {
    const [pair] = line.split(";");
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    jar[pair.slice(0, idx)] = pair.slice(idx + 1);
  }
  return jar;
}

function mergeJar(jar, incoming) {
  return { ...jar, ...incoming };
}

function cookieHeader(jar) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function req(method, path, { jar = {}, body, bearer } = {}) {
  const headers = { Origin: "http://localhost:5173" };
  const cookie = cookieHeader(jar);
  if (cookie) headers.Cookie = cookie;
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const nextJar = mergeJar(jar, parseSetCookie(res));
  const data = await res.json().catch(() => null);
  return { status: res.status, data, jar: nextJar };
}

await connectDB();

let admin = await User.findOne({ email: "demo-admin@ashal.com" });
if (!admin) {
  await User.create({
    name: "Demo Admin",
    email: "demo-admin@ashal.com",
    passwordHash: await bcrypt.hash("AdminPass123!", 10),
    role: "admin",
  });
  console.log("Created demo admin");
} else {
  console.log("Demo admin exists");
}

let vendor = await User.findOne({ email: "demo-vendor@ashal.com" });
if (!vendor) {
  vendor = await User.create({
    name: "Demo Vendor",
    email: "demo-vendor@ashal.com",
    passwordHash: await bcrypt.hash("VendorPass123!", 10),
    role: "vendor",
  });
  console.log("Created demo vendor");
} else {
  vendor.passwordHash = await bcrypt.hash("VendorPass123!", 10);
  vendor.role = "vendor";
  vendor.status = "active";
  await vendor.save();
  console.log("Reset demo vendor password");
}

const { Store } = await import("../src/models/Store.js");
let store = await Store.findOne({ vendorId: vendor._id });
if (!store) {
  store = await Store.create({
    vendorId: vendor._id,
    name: "Demo Vendor Store",
    slug: `demo-vendor-store-${Date.now()}`,
    description: "Smoke-test store",
    status: "active",
  });
  vendor.storeId = store._id;
  await vendor.save();
  console.log("Created demo vendor store");
} else if (!vendor.storeId) {
  vendor.storeId = store._id;
  await vendor.save();
}

console.log("\n--- CUSTOMER REGISTER ---");
let r = await req("POST", "/auth/register", {
  body: { name: "Auth Test", email, password },
});
console.log(r.status, JSON.stringify(r.data));
console.log("cookies", Object.keys(r.jar));
let jar = r.jar;

console.log("\n--- CUSTOMER /auth/me ---");
r = await req("GET", "/auth/me", { jar });
console.log(r.status, JSON.stringify(r.data));

console.log("\n--- CUSTOMER /cart ---");
r = await req("GET", "/cart", { jar });
console.log(r.status, r.data?.success, r.data?.error?.code || "ok");

console.log("\n--- REFRESH ---");
r = await req("POST", "/auth/refresh", { jar });
console.log(r.status, JSON.stringify(r.data));
jar = r.jar;

console.log("\n--- LOGOUT ---");
r = await req("POST", "/auth/logout", { jar });
console.log(r.status, JSON.stringify(r.data));
jar = r.jar;

console.log("\n--- CART AFTER LOGOUT ---");
r = await req("GET", "/cart", { jar });
console.log(r.status, r.data?.error?.code);

console.log("\n--- VENDOR LOGIN ---");
r = await req("POST", "/auth/login", {
  body: { email: "demo-vendor@ashal.com", password: "VendorPass123!" },
});
console.log(r.status, r.data?.data?.user?.role, Object.keys(r.jar));
r = await req("GET", "/vendor/dashboard", { jar: r.jar });
console.log("vendor dash", r.status, r.data?.success, r.data?.error?.code || "ok");

console.log("\n--- ADMIN LOGIN ---");
r = await req("POST", "/auth/login", {
  body: { email: "demo-admin@ashal.com", password: "AdminPass123!" },
});
console.log(r.status, r.data?.data?.user?.role, Object.keys(r.jar));
r = await req("GET", "/admin/dashboard", { jar: r.jar });
console.log("admin dash", r.status, r.data?.success, r.data?.error?.code || "ok");

console.log("\n--- BEARER FALLBACK ---");
r = await req("POST", "/auth/login", { body: { email, password } });
const access = r.jar.ashal_access;
r = await req("GET", "/auth/me", { bearer: access });
console.log(r.status, r.data?.data?.user?.email);

console.log("\n--- BODY HAS NO TOKEN ---");
r = await req("POST", "/auth/login", { body: { email, password } });
console.log("hasTokenField", Object.prototype.hasOwnProperty.call(r.data?.data || {}, "token"));

process.exit(0);
