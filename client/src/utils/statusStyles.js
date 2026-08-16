export const statusStyles = {
  Pending: "bg-amber-100 text-amber-800",
  pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-sky-100 text-sky-800",
  Processing: "bg-indigo-100 text-indigo-800",
  Shipped: "bg-teal-100 text-teal-800",
  OutForDelivery: "bg-teal-100 text-teal-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  Completed: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-rose-100 text-rose-800",
  Rejected: "bg-rose-100 text-rose-800",
  rejected: "bg-rose-100 text-rose-800",
  active: "bg-emerald-100 text-emerald-800",
  disabled: "bg-rose-100 text-rose-800",
  suspended: "bg-amber-100 text-amber-800",
  deleted: "bg-slate-200 text-slate-600",
  new: "bg-amber-100 text-amber-800",
  read: "bg-sky-100 text-sky-800",
  resolved: "bg-emerald-100 text-emerald-800",
};

export const orderTimeline = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "OutForDelivery",
  "Delivered",
  "Completed",
];

export function formatOrderId(orderId) {
  if (!orderId) return "Order";
  const id = String(orderId);
  return `#${id.slice(-8).toUpperCase()}`;
}

export function formatOrderDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShippingAddress(address) {
  if (!address) return "";
  const parts = [
    address.line1,
    address.line2,
    [address.city, address.region, address.country].filter(Boolean).join(", "),
  ].filter(Boolean);
  return parts.join(", ");
}

export function statusStyle(status) {
  return statusStyles[status] || "bg-slate-100 text-slate-700";
}
