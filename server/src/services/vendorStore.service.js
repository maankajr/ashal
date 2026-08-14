import { Store } from "../models/Store.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { uniqueSlug } from "../utils/slugify.js";
import { resolveVendorStore } from "../middleware/vendor.js";

export async function getMyStore(user) {
  const store = await resolveVendorStore(user);

  if (!store) {
    throw new AppError("Store not found", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return store;
}

export async function createStore(user, payload) {
  const existing = await Store.findOne({ vendorId: user._id });

  if (existing) {
    throw new AppError("You already have a store", {
      status: 409,
      code: "CONFLICT",
      details: [{ field: "store", message: "Vendor already has a store" }],
    });
  }

  const { name, description = "", contactEmail = "", contactPhone = "" } = payload;

  if (!name || String(name).trim().length < 2) {
    throw new AppError("Validation failed", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [{ field: "name", message: "Store name is required (min 2 characters)" }],
    });
  }

  const slug = await uniqueSlug(Store, name);
  const store = await Store.create({
    vendorId: user._id,
    name: name.trim(),
    slug,
    description,
    contactEmail: String(contactEmail).trim(),
    contactPhone: String(contactPhone).trim(),
    status: "active",
  });

  await User.findByIdAndUpdate(user._id, { storeId: store._id });

  return store;
}

export async function updateStore(user, payload) {
  const store = await getMyStore(user);
  const allowed = ["name", "description", "contactEmail", "contactPhone", "logoUrl", "bannerUrl"];

  for (const key of allowed) {
    if (payload[key] !== undefined) {
      store[key] = typeof payload[key] === "string" ? payload[key].trim() : payload[key];
    }
  }

  if (payload.name && payload.name.trim() !== store.name) {
    store.slug = await uniqueSlug(Store, payload.name, "slug", store._id);
  }

  await store.save();
  return store;
}
