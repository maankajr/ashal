import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { parseApiError } from "../../api/auth.js";
import { getVendorDashboard } from "../../api/vendor.js";
import { formatOrderDate, statusStyle } from "../../utils/statusStyles";

function VendorDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getVendorDashboard();
        if (!cancelled) setDashboard(data);
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    if (error.toLowerCase().includes("store")) {
      return (
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-2xl">
            🏪
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Set up your vendor store</h2>
          <p className="mt-2 text-sm text-slate-600">
            Welcome to the vendor portal! Create your store name, description, and contact info to start listing products and receiving customer orders.
          </p>
          <div className="mt-6">
            <Link
              to="/vendor/store"
              className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Set up your store →
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  const { stats, lowStockProducts, recentOrders, store } = dashboard;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">
        Overview for {store?.name || "your store"}.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Products", value: stats.totalProducts },
          { label: "Orders", value: stats.totalOrders },
          { label: "Revenue", value: `$${Number(stats.totalRevenue).toFixed(2)}` },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      {lowStockProducts?.length > 0 && (
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-amber-900">Low stock alert</h2>
          <p className="mt-1 text-sm text-amber-800">
            {stats.lowStockCount} product{stats.lowStockCount === 1 ? "" : "s"} with fewer than 5
            in stock.
          </p>
          <ul className="mt-3 space-y-2">
            {lowStockProducts.map((product) => (
              <li key={product._id} className="flex justify-between text-sm">
                <Link
                  to={`/vendor/products/${product._id}/edit`}
                  className="font-medium text-amber-900 hover:text-teal-700"
                >
                  {product.name}
                </Link>
                <span className="font-semibold text-amber-800">{product.stock} left</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
        </div>
        {recentOrders?.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      #{String(order._id).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatOrderDate(order.parentOrderId?.placedAt || order.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {order.items.reduce((n, item) => n + item.quantity, 0)}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-slate-200 px-5 py-3">
          <Link to="/vendor/orders" className="text-sm font-medium text-teal-700 hover:text-teal-800">
            View all orders →
          </Link>
        </div>
      </section>
    </div>
  );
}

export default VendorDashboard;
