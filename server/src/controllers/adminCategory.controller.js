import * as adminCategoryService from "../services/adminCategory.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const listCategories = asyncHandler(async (req, res) => {
  const result = await adminCategoryService.listCategories(req.query);
  return success(res, result.items, result.meta);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await adminCategoryService.createCategory(req.body);
  return success(res, category, undefined, 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await adminCategoryService.updateCategory(req.params.id, req.body);
  return success(res, category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await adminCategoryService.deleteCategory(req.params.id);
  return success(res, result);
});
