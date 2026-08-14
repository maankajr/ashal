import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { parseApiError } from "../../api/auth.js";
import {
  getAdminOrder,
  getAdminOrders,
  SUBORDER_STATUSES,
  updateSubOrderStatus,
} from "../../api/admin.js";
import {
  formatOrderDate,
  formatOrderId,
  formatShippingAddress,
  statusStyle,
} from "../../utils/statusStyles";

function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getAdminOrder(id);
        if (!cancelled) setOrder(data);
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
  }, [id]);

  async function handleStatusChange(subOrderId, nextStatus) {
    if (!nextStatus) return;
    setUpdatingId(subOrderId);
    setError("");
    try {
      const updated = await updateSubOrderStatus(subOrderId, nextStatus);
      setOrder((current) => ({
        ...current,
        subOrders: current.subOrders.map((sub) =>
          sub._id === subOrderId ? { ...sub, status: updated.status } : sub
        ),
      }));
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/orders" className="text-sm font-medium text-teal-700 hover:text-teal-800">
        ← All orders
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
        {formatOrderId(order._id)}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        {order.customerId?.name} · {order.customerId?.email} · {formatOrderDate(order.placedAt)}
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            ${Number(order.grandTotal).toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Payment</p>
          <p className="mt-2 text-lg font-semibold uppercase text-slate-900">
            {order.paymentMethod}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Ship to</p>
          <p className="mt-2 text-sm text-slate-700">{formatShippingAddress(order.shippingAddress)}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {order.subOrders.map((sub) => (
          <section key={sub._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{sub.storeId?.name || "Store"}</p>
                <p className="text-xs text-slate-500">{formatOrderId(sub._id)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(sub.status)}`}
                >
                  {sub.status}
                </span>
                <select
                  value=""
                  disabled={updatingId === sub._id}
                  onChange={(event) => {
                    handleStatusChange(sub._id, event.target.value);
                    event.target.value = "";
                  }}
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none ring-teal-600 focus:ring-2 disabled:opacity-60"
                >
                  <option value="">Change status…</option>
                  {SUBORDER_STATUSES.filter((item) => item !== sub.status).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-slate-100">
              {sub.items.map((item) => (
                <li key={`${sub._id}-${item.productId}`} className="flex justify-between py-2 text-sm">
                  <span className="text-slate-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-slate-900">${Number(item.subtotal).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function AdminOrders() {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  async function loadOrders(nextPage = page) {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminOrders({ page: nextPage });
      setOrders(result.items);
      setMeta(result.meta);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) return;
    loadOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (id) {
    return <AdminOrderDetails />;
  }

  async function goToPage(nextPage) {
    setPage(nextPage);
    await loadOrders(nextPage);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-slate-600">All customer orders across stores.</p>

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
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      <Link to={`/admin/orders/${order._id}`} className="hover:text-teal-700">
                        {formatOrderId(order._id)}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {order.customerId?.name || "—"}
                      <p className="text-xs text-slate-400">{order.customerId?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{formatOrderDate(order.placedAt)}</td>
                    <td className="px-5 py-3 text-slate-600">{order.itemCount}</td>
                    <td className="px-5 py-3 font-medium text-teal-800">
                      ${Number(order.grandTotal).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm">
              <button
                type="button"
                disabled={!meta.hasPrevPage}
                onClick={() => goToPage(page - 1)}
                className="font-medium text-teal-700 disabled:text-slate-400"
              >
                Previous
              </button>
              <span className="text-slate-500">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={!meta.hasNextPage}
                onClick={() => goToPage(page + 1)}
                className="font-medium text-teal-700 disabled:text-slate-400"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
