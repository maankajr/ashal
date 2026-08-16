import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import { setupTestDB, teardownTestDB, extractCookies, cookieString } from "./setup.js";
import { User } from "../src/models/User.js";

describe("2. Authentication Lifecycle & Protection", () => {
  const ts = Date.now();
  const testEmail = `auth-spec-${ts}@ashal.test`;
  const password = "ValidPassword123!";
  let cookies = {};

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: `@ashal.test` } });
    await teardownTestDB();
  });

  it("registers a new customer and returns httpOnly auth cookies", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Auth Test User",
        email: testEmail,
        password,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.role).toBe("customer");

    cookies = extractCookies(res);
    expect(cookies.ashal_access).toBeDefined();
    expect(cookies.ashal_refresh).toBeDefined();
  });

  it("authenticates via GET /api/auth/me with valid cookie", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookieString(cookies))
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
  });

  it("rejects protected route when cookies/tokens are missing", async () => {
    const res = await request(app).get("/api/auth/me").expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rotates refresh token and issues fresh access token on POST /api/auth/refresh", async () => {
    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `ashal_refresh=${cookies.ashal_refresh}`)
      .expect(200);

    expect(refreshRes.body.success).toBe(true);
    const newCookies = extractCookies(refreshRes);

    expect(newCookies.ashal_access).toBeDefined();
    expect(newCookies.ashal_refresh).toBeDefined();
    cookies = { ...cookies, ...newCookies };
  });

  it("logs out, clears cookies, and prevents further refresh with revoked token", async () => {
    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookieString(cookies))
      .expect(200);

    expect(logoutRes.body.success).toBe(true);

    // Refresh with old cookie should now fail
    const revokedRefreshRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `ashal_refresh=${cookies.ashal_refresh}`)
      .expect(401);

    expect(revokedRefreshRes.body.success).toBe(false);
  });
});
