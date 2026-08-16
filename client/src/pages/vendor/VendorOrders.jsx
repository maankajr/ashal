import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { parseApiError } from "../../api/auth.js";
import {
  getNextVendorStatus,
  getVendorOrders,
  updateOrderStatus,
  VENDOR_STATUS_FLOW,
} from "../../api/vendor.js";
import { formatOrderDate, formatShippingAddress, statusStyle } from "../../utils/statusStyles";

function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const data = await getVendorOrders();
      setOrders(data);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId, nextStatus) {
    if (!nextStatus || updatingId === orderId) return;
    setUpdatingId(orderId);
    setError("");
    try {
      const updated = await updateOrderStatus(orderId, nextStatus);
      setOrders((current) =>
        current.map((order) => (order._id === orderId ? updated : order))
      );
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            Fulfill and manage sub-orders for your store.
          </p>
        </div>
      </div>

      {error && (
        error.toLowerCase().includes("store") ? (
          <div className="mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Store Setup Required</h2>
            <p className="mt-1 text-sm text-slate-600">
              Please create your store profile first to view and fulfill incoming orders.
            </p>
            <Link
              to="/vendor/store"
              className="mt-4 inline-flex items-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Set up your store →
            </Link>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-rose-500 hover:text-rose-700"
              >
                ✕
              </button>
            </div>
          </div>
        )
      )}

      {loading ? (
        <div className="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-8">
          <div className="h-6 w-full rounded bg-slate-100" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-800">No orders yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Customer orders for your store products will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {orders.map((order) => {
            const isCancelled = order.status === "Cancelled" || order.status === "Rejected";
            const nextStatus = getNextVendorStatus(order.status);
            const isUpdating = updatingId === order._id;
            const currentIndex = VENDOR_STATUS_FLOW.indexOf(order.status);

            return (
              <div
                key={order._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Placed {formatOrderDate(order.parentOrderId?.placedAt || order.createdAt)}
                      {order.parentOrderId?.shippingAddress && (
                        <> · Ship to: {formatShippingAddress(order.parentOrderId.shippingAddress)}</>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action Button: Advance Status */}
                    {nextStatus && !isCancelled && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(order._id, nextStatus)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60"
                      >
                        {isUpdating ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Updating…
                          </>
                        ) : (
                          <>Mark as {nextStatus} →</>
                        )}
                      </button>
                    )}

                    {/* Secondary Action: Cancel/Reject */}
                    {["Pending", "Confirmed"].includes(order.status) && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => {
                          if (window.confirm("Are you sure you want to cancel this sub-order?")) {
                            handleStatusChange(order._id, "Cancelled");
                          }
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    )}

                    {order.status === "Completed" && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        ✓ Order Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Progression Stepper / Interactive Timeline */}
                {!isCancelled && (
                  <div className="border-b border-slate-100 py-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                      Order Fulfillment Pipeline
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {VENDOR_STATUS_FLOW.map((step, idx) => {
                        const isCurrent = step === order.status;
                        const isPast = currentIndex !== -1 && idx < currentIndex;
                        const isNext = idx === currentIndex + 1;

                        if (isCurrent) {
                          return (
                            <span
                              key={step}
                              className="inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-3 py-1 text-xs font-bold text-white shadow-sm ring-2 ring-teal-700/20"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              {step} (Current)
                            </span>
                          );
                        }

                        if (isPast) {
                          return (
                            <span
                              key={step}
                              className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800"
                            >
                              ✓ {step}
                            </span>
                          );
                        }

                        if (isNext) {
                          return (
                            <button
                              key={step}
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(order._id, step)}
                              title={`Click to mark as ${step}`}
                              className="group inline-flex items-center gap-1.5 rounded-full border border-teal-600 bg-white px-3 py-1 text-xs font-semibold text-teal-700 shadow-sm transition hover:bg-teal-700 hover:text-white disabled:opacity-60"
                            >
                              <span>Next: {step}</span>
                              <span className="text-teal-500 group-hover:text-white">→</span>
                            </button>
                          );
                        }

                        return (
                          <span
                            key={step}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-400"
                          >
                            {step}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Items Table */}
                <div className="pt-4">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-slate-400">
                        <th className="pb-2 font-medium">Item</th>
                        <th className="pb-2 text-center font-medium">Quantity</th>
                        <th className="pb-2 text-right font-medium">Unit Price</th>
                        <th className="pb-2 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items.map((item) => (
                        <tr key={`${order._id}-${item.productId}`}>
                          <td className="py-2.5 font-medium text-slate-800">{item.name}</td>
                          <td className="py-2.5 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-2.5 text-right text-slate-600">
                            ${Number(item.price).toFixed(2)}
                          </td>
                          <td className="py-2.5 text-right font-semibold text-slate-900">
                            ${Number(item.subtotal || item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="pt-3 text-right text-sm font-semibold text-slate-700">
                          Sub-order Subtotal:
                        </td>
                        <td className="pt-3 text-right text-base font-bold text-teal-800">
                          ${Number(order.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VendorOrders;
