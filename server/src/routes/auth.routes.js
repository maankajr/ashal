import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validateLogin, validateRegister } from "../middleware/validate.js";

const router = Router();

router.post("/register", validateRegister, authController.register);
router.post("/register/vendor", validateRegister, authController.registerVendor);
router.post("/login", validateLogin, authController.login);
router.post("/logout", authController.logout);

export default router;
