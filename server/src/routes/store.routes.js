import { Router } from "express";
import * as storeController from "../controllers/store.controller.js";

const router = Router();

router.get("/:slug", storeController.getStoreBySlug);

export default router;
