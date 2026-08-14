import { Store } from "../models/Store.js";
import { Product } from "../models/Product.js";
import { SubOrder } from "../models/SubOrder.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireVendor = (req, _res, next) => {
  if (!req.user || req.user.role !== "vendor") {
    return next(
      new AppError("Vendor access required", {
        status: 403,
        code: "FORBIDDEN",
      })
    );
  }
  return next();
};

export async function resolveVendorStore(user) {
  if (!user.storeId) {
    const store = await Store.findOne({ vendorId: user._id });
    if (!store) return null;
    return store;
  }

  const store = await Store.findById(user.storeId);
  if (!store || String(store.vendorId) !== String(user._id)) {
    return null;
  }

  return store;
}

export const requireVendorStore = asyncHandler(async (req, _res, next) => {
  const store = await resolveVendorStore(req.user);

  if (!store) {
    throw new AppError("Vendor store not found", {
      status: 404,
      code: "STORE_REQUIRED",
    });
  }

  req.vendorStore = store;
  next();
});

export const requireProductOwnership = asyncHandler(async (req, _res, next) => {
  const store = req.vendorStore || (await resolveVendorStore(req.user));

  if (!store) {
    throw new AppError("Vendor store not found", {
      status: 404,
      code: "STORE_REQUIRED",
    });
  }

  const product = await Product.findById(req.params.id);

  if (!product || product.status === "deleted") {
    throw new AppError("Product not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (String(product.storeId) !== String(store._id)) {
    throw new AppError("You do not own this product", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  req.vendorStore = store;
  req.vendorProduct = product;
  next();
});

export const requireSubOrderOwnership = asyncHandler(async (req, _res, next) => {
  const store = req.vendorStore || (await resolveVendorStore(req.user));

  if (!store) {
    throw new AppError("Vendor store not found", {
      status: 404,
      code: "STORE_REQUIRED",
    });
  }

  const subOrder = await SubOrder.findById(req.params.id);

  if (!subOrder) {
    throw new AppError("Order not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  if (String(subOrder.storeId) !== String(store._id)) {
    throw new AppError("You do not have access to this order", {
      status: 403,
      code: "FORBIDDEN",
    });
  }

  req.vendorStore = store;
  req.vendorSubOrder = subOrder;
  next();
});
