import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { parseApiError } from "../../api/auth.js";
import { getAdminDashboard } from "../../api/admin.js";
import { formatOrderDate, formatOrderId, statusStyle } from "../../utils/statusStyles";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getAdminDashboard();
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  const { stats, recentOrders, recentUsers } = dashboard;

  const cards = [
    { label: "Users", value: stats.totalUsers, to: "/admin/users" },
    { label: "Vendors", value: stats.totalVendors, to: "/admin/users?role=vendor" },
    { label: "Stores", value: stats.totalStores, hint: `${stats.pendingStores} pending`, to: "/admin/stores" },
    { label: "Products", value: stats.totalProducts, hint: `${stats.pendingProducts} pending`, to: "/admin/products" },
    { label: "Orders", value: stats.totalOrders, to: "/admin/orders" },
    { label: "Revenue", value: `$${Number(stats.totalRevenue).toFixed(2)}`, to: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">Marketplace overview and recent activity.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-teal-200"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
            {card.hint && <p className="mt-1 text-xs text-amber-700">{card.hint}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
          </div>
          {recentOrders?.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {recentOrders.map((order) => (
                <li key={order._id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="text-sm font-medium text-slate-900 hover:text-teal-700"
                    >
                      {formatOrderId(order._id)}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {order.customerId?.name || "Customer"} · {formatOrderDate(order.placedAt)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-teal-800">
                    ${Number(order.grandTotal).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-slate-200 px-5 py-3">
            <Link to="/admin/orders" className="text-sm font-medium text-teal-700 hover:text-teal-800">
              View all orders →
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent users</h2>
          </div>
          {recentUsers?.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No users yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {recentUsers.map((user) => (
                <li key={user._id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(user.status)}`}
                  >
                    {user.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-slate-200 px-5 py-3">
            <Link to="/admin/users" className="text-sm font-medium text-teal-700 hover:text-teal-800">
              View all users →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
