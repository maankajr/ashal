import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(protect, requireRole("customer", "admin"));

router.post("/checkout", orderController.checkout);
router.get("/", orderController.listOrders);
router.get("/:id", orderController.getOrder);

export default router;
