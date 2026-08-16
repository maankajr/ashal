import * as vendorProductService from "../services/vendorProduct.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";

export const listProducts = asyncHandler(async (req, res) => {
  const products = await vendorProductService.listVendorProducts(req.user);
  return success(res, products);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await vendorProductService.getVendorProduct(req.user, req.params.id);
  return success(res, product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await vendorProductService.createVendorProduct(req.user, req.body);
  return success(res, product, undefined, 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await vendorProductService.updateVendorProduct(
    req.user,
    req.params.id,
    req.body
  );
  return success(res, product);
});

export const updateProductStock = asyncHandler(async (req, res) => {
  const product = await vendorProductService.updateVendorProductStock(
    req.user,
    req.params.id,
    req.body.stock
  );
  return success(res, product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await vendorProductService.deleteVendorProduct(req.user, req.params.id);
  return success(res, product);
});

export const uploadProductImages = asyncHandler(async (req, res) => {
  const replace =
    req.body?.replace === true ||
    req.body?.replace === "true" ||
    req.body?.replace === "1";

  const product = await vendorProductService.uploadVendorProductImages(
    req.user,
    req.params.id,
    req.files || [],
    { replace }
  );
  return success(res, product);
});
