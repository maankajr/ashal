import { Router } from "express";
import { protect, requireRole } from "../middleware/auth.js";
import { validateAdminStatus } from "../middleware/validate.js";
import * as adminDashboardController from "../controllers/adminDashboard.controller.js";
import * as adminUserController from "../controllers/adminUser.controller.js";
import * as adminStoreController from "../controllers/adminStore.controller.js";
import * as adminProductController from "../controllers/adminProduct.controller.js";
import * as adminOrderController from "../controllers/adminOrder.controller.js";

const router = Router();

router.use(protect, requireRole("admin"));

router.get("/dashboard", adminDashboardController.getDashboard);

router.get("/users", adminUserController.listUsers);
router.patch("/users/:id/status", validateAdminStatus, adminUserController.updateUserStatus);

router.get("/stores", adminStoreController.listStores);
router.patch("/stores/:id/status", validateAdminStatus, adminStoreController.updateStoreStatus);

router.get("/products", adminProductController.listProducts);
router.patch("/products/:id/status", validateAdminStatus, adminProductController.updateProductStatus);

router.get("/orders", adminOrderController.listOrders);
router.get("/orders/:id", adminOrderController.getOrder);
router.patch(
  "/sub-orders/:id/status",
  validateAdminStatus,
  adminOrderController.updateSubOrderStatus
);

export default router;
