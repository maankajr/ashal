import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import { validateUpdateProfile } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.get("/me", userController.getMe);
router.patch("/me", validateUpdateProfile, userController.updateMe);

export default router;
