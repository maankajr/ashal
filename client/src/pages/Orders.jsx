import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMyOrders } from "../api/orders.js";
import { parseApiError } from "../api/auth.js";
import { useAuth } from "../store/AuthContext";
import {
  formatOrderDate,
  formatOrderId,
  statusStyle,
} from "../utils/statusStyles";

function OrdersSkeleton() {
  return (
    <ul className="mt-8 space-y-3">
      {[1, 2, 3].map((item) => (
        <li
          key={item}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-48 rounded bg-slate-100" />
          <div className="mt-4 flex gap-4">
            <div className="h-4 w-16 rounded bg-slate-100" />
            <div className="h-4 w-20 rounded bg-slate-100" />
            <div className="h-6 w-20 rounded-full bg-slate-100" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Orders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError("");
      try {
        const result = await getMyOrders();
        if (!cancelled) setOrders(result.items);
      } catch (err) {
        if (!cancelled) {
          const { message } = parseApiError(err);
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (error === "Authentication required" || error.includes("Invalid or expired token")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-slate-600">Track purchases from Ashal vendors.</p>

        {error && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <OrdersSkeleton />
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">You have no orders yet.</p>
            <p className="mt-2 text-sm text-slate-500">When you place an order, it will show up here.</p>
            <Link
              to="/shop"
              className="mt-5 inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {orders.map((order) => (
              <li key={order._id}>
                <Link
                  to={`/orders/${order._id}`}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{formatOrderId(order._id)}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Placed {formatOrderDate(order.placedAt || order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-slate-600">
                      {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                    </span>
                    <span className="font-semibold text-teal-800">
                      ${Number(order.grandTotal).toFixed(2)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Orders;
