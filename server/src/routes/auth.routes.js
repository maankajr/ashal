import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { optionalProtect, protect } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import { validateLogin, validateRegister } from "../middleware/validate.js";

const router = Router();

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: "rl:auth:login",
  message: "Too many login attempts. Please try again in 15 minutes.",
});

const registerLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: "rl:auth:register",
  message: "Too many registration attempts. Please try again in 15 minutes.",
});

router.post("/register", registerLimiter, validateRegister, authController.register);
router.post("/register/vendor", registerLimiter, validateRegister, authController.registerVendor);
router.post("/login", loginLimiter, validateLogin, authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", protect, authController.me);
router.post("/logout", optionalProtect, authController.logout);

export default router;
