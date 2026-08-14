import * as productService from "../services/product.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);
  return success(res, result.items, result.meta);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  return success(res, product);
});

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await productService.listCategories();
  return success(res, categories);
});
