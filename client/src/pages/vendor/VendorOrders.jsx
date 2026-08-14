import { useEffect, useState } from "react";
import { parseApiError } from "../../api/auth.js";
import { getNextVendorStatus, getVendorOrders, updateOrderStatus } from "../../api/vendor.js";
import { formatOrderDate, statusStyle } from "../../utils/statusStyles";

function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getVendorOrders();
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) setError(parseApiError(err).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleStatusChange(orderId, nextStatus) {
    if (!nextStatus) return;
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
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-slate-600">Sub-orders for your store.</p>

      {error && (
        <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-8">
          <div className="h-6 w-full rounded bg-slate-100" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-800">No orders yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Orders from customers will appear here once placed.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Sub-order</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Advance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => {
                  const nextStatus = getNextVendorStatus(order.status);
                  return (
                    <tr key={order._id}>
                      <td className="px-5 py-3 font-medium text-slate-900">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {formatOrderDate(order.parentOrderId?.placedAt || order.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        <ul className="space-y-1">
                          {order.items.map((item) => (
                            <li key={`${order._id}-${item.productId}`}>
                              {item.name} × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-5 py-3 font-medium text-teal-800">
                        ${Number(order.subtotal).toFixed(2)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {nextStatus ? (
                          <select
                            value=""
                            disabled={updatingId === order._id}
                            onChange={(event) => {
                              handleStatusChange(order._id, event.target.value);
                              event.target.value = "";
                            }}
                            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none ring-teal-600 focus:ring-2 disabled:opacity-60"
                          >
                            <option value="">Update status…</option>
                            <option value={nextStatus}>Mark as {nextStatus}</option>
                          </select>
                        ) : (
                          <span className="text-xs text-slate-400">Final status</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorOrders;
