import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

router.patch("/:id", protect, requireRole("customer"), reviewController.updateOwn);
router.delete("/:id", protect, requireRole("customer"), reviewController.deleteOwn);

export default router;
