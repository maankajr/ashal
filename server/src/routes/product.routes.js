import { Router } from "express";
import * as productController from "../controllers/product.controller.js";

const router = Router();

router.get("/", productController.listProducts);
router.get("/:slug", productController.getProduct);

export default router;
