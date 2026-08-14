import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { requireVendor } from "../middleware/vendor.js";
import * as vendorDashboardController from "../controllers/vendorDashboard.controller.js";
import * as vendorStoreController from "../controllers/vendorStore.controller.js";
import * as vendorOrderController from "../controllers/vendorOrder.controller.js";
import * as vendorProductController from "../controllers/vendorProduct.controller.js";

const router = Router();

router.use(protect, requireVendor);

router.get("/dashboard", vendorDashboardController.getDashboard);

router.get("/store", vendorStoreController.getStoreOrNull);
router.post("/store", vendorStoreController.createStore);
router.patch("/store", vendorStoreController.updateStore);

router.get("/orders", vendorOrderController.listOrders);
router.patch("/orders/:id/status", vendorOrderController.updateOrderStatus);

router.get("/products", vendorProductController.listProducts);
router.post("/products", vendorProductController.createProduct);
router.get("/products/:id", vendorProductController.getProduct);
router.patch("/products/:id/stock", vendorProductController.updateProductStock);
router.patch("/products/:id", vendorProductController.updateProduct);
router.delete("/products/:id", vendorProductController.deleteProduct);

export default router;
