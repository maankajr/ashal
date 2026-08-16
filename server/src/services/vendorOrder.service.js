import { SubOrder, SUBORDER_STATUSES } from "../models/SubOrder.js";
import { AppError } from "../utils/AppError.js";
import { resolveVendorStore } from "../middleware/vendor.js";

const FORWARD_STATUS_FLOW = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "OutForDelivery",
  "Delivered",
  "Completed",
];

export function getNextStatuses(currentStatus) {
  if (currentStatus === "Cancelled" || currentStatus === "Rejected" || currentStatus === "Completed") {
    return [];
  }
  const index = FORWARD_STATUS_FLOW.indexOf(currentStatus);
  const next = [];
  if (index !== -1 && index < FORWARD_STATUS_FLOW.length - 1) {
    next.push(FORWARD_STATUS_FLOW[index + 1]);
  }
  if (["Pending", "Confirmed"].includes(currentStatus)) {
    next.push("Cancelled");
  }
  return next;
}

export async function listVendorOrders(user) {
  const store = await resolveVendorStore(user);

  if (!store) {
    throw new AppError("Vendor store not found", {
      status: 404,
      code: "STORE_REQUIRED",
    });
  }

  return SubOrder.find({ storeId: store._id })
    .sort({ createdAt: -1 })
    .populate("parentOrderId", "placedAt grandTotal shippingAddress customerId")
    .lean();
}

export async function updateSubOrderStatus(user, subOrderId, nextStatus) {
  const store = await resolveVendorStore(user);

  if (!store) {
    throw new AppError("Vendor store not found", {
      status: 404,
      code: "STORE_REQUIRED",
    });
  }

  const subOrder = await SubOrder.findById(subOrderId);

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

  if (!SUBORDER_STATUSES.includes(nextStatus)) {
    throw new AppError("Invalid status", {
      status: 422,
      code: "VALIDATION_ERROR",
      details: [{ field: "status", message: "Invalid order status" }],
    });
  }

  const allowedNext = getNextStatuses(subOrder.status);

  if (!allowedNext.includes(nextStatus)) {
    throw new AppError(`Cannot change status from ${subOrder.status} to ${nextStatus}`, {
      status: 409,
      code: "INVALID_STATUS_TRANSITION",
      details: [
        {
          field: "status",
          message: `Allowed next status: ${allowedNext.join(", ") || "none"}`,
        },
      ],
    });
  }

  subOrder.status = nextStatus;
  subOrder.statusHistory.push({
    status: nextStatus,
    changedBy: user._id,
    changedAt: new Date(),
  });

  await subOrder.save();

  return subOrder.populate("parentOrderId", "placedAt grandTotal shippingAddress");
}
