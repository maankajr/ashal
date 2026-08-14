import { Product } from "../models/Product.js";
import { SubOrder } from "../models/SubOrder.js";
import { AppError } from "../utils/AppError.js";
import { resolveVendorStore } from "../middleware/vendor.js";

export async function getVendorDashboard(user) {
  const store = await resolveVendorStore(user);

  if (!store) {
    throw new AppError("Vendor store not found", {
      status: 404,
      code: "STORE_REQUIRED",
    });
  }

  const storeId = store._id;

  const [totalProducts, lowStockProducts, subOrders, revenueAgg] = await Promise.all([
    Product.countDocuments({ storeId, status: { $ne: "deleted" } }),
    Product.find({ storeId, status: { $ne: "deleted" }, stock: { $lt: 5 } })
      .select("name stock price slug")
      .sort({ stock: 1 })
      .limit(10)
      .lean(),
    SubOrder.find({ storeId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("parentOrderId", "placedAt")
      .lean(),
    SubOrder.aggregate([
      { $match: { storeId } },
      { $group: { _id: null, total: { $sum: "$subtotal" } } },
    ]),
  ]);

  const totalOrders = await SubOrder.countDocuments({ storeId });
  const totalRevenue = revenueAgg[0]?.total || 0;

  return {
    store: {
      _id: store._id,
      name: store.name,
      slug: store.slug,
      status: store.status,
    },
    stats: {
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockCount: lowStockProducts.length,
    },
    lowStockProducts,
    recentOrders: subOrders,
  };
}
