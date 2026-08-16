import { Router } from "express";
import * as contactController from "../controllers/contact.controller.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const router = Router();

const contactRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: "contact",
  message: "Too many contact messages. Please try again in a few minutes.",
});

router.post("/", contactRateLimit, contactController.create);

export default router;
