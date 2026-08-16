import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import * as reviewController from "../controllers/review.controller.js";
import { optionalProtect, protect, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", productController.listProducts);

router.get("/:slug/reviews", optionalProtect, reviewController.listForProduct);
router.get(
  "/:slug/reviews/eligibility",
  protect,
  requireRole("customer"),
  reviewController.getEligibility
);
router.post(
  "/:slug/reviews",
  protect,
  requireRole("customer"),
  reviewController.createForProduct
);

router.get("/:slug", productController.getProduct);

export default router;
