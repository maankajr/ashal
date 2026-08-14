import { Router } from "express";
import * as cartController from "../controllers/cart.controller.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validateCartItem } from "../middleware/validate.js";

const router = Router();

router.use(protect, requireRole("customer", "admin"));

router.get("/", cartController.getCart);
router.post("/items", validateCartItem, cartController.addItem);
router.patch("/items/:productId", cartController.updateItem);
router.delete("/items/:productId", cartController.removeItem);
router.delete("/", cartController.clearCart);

export default router;
