import { Router } from "express";
import * as wishlistController from "../controllers/wishlist.controller.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(protect, requireRole("customer", "admin"));

router.get("/", wishlistController.getWishlist);
router.post("/:productId/move-to-cart", wishlistController.moveProductToCart);
router.post("/:productId", wishlistController.addProduct);
router.delete("/:productId", wishlistController.removeProduct);

export default router;
