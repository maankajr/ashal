import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getOrderById } from "../api/orders.js";
import { parseApiError } from "../api/auth.js";
import {
  formatOrderDate,
  formatOrderId,
  formatShippingAddress,
  orderTimeline,
  statusStyle,
} from "../utils/statusStyles";

function Timeline({ status, statusHistory = [] }) {
  if (status === "Cancelled" || status === "Rejected") {
    return <p className="mt-3 text-sm text-rose-700">This sub-order was {status.toLowerCase()}.</p>;
  }

  const historyStatuses = statusHistory.map((entry) => entry.status);
  const currentIndex = Math.max(0, orderTimeline.indexOf(status));

  return (
    <div className="mt-4 space-y-3">
      <ol className="flex flex-wrap gap-2">
        {orderTimeline.map((step, index) => {
          const isCurrent = step === status || index === currentIndex;
          const isDone = index < currentIndex || historyStatuses.includes(step);
          return (
            <li key={step} className="flex items-center gap-2 text-xs">
              <span
                className={`rounded-full px-2.5 py-1 font-semibold ${
                  isCurrent
                    ? "bg-teal-700 text-white"
                    : isDone
                      ? "bg-teal-100 text-teal-800"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {step}
              </span>
              {index < orderTimeline.length - 1 && <span className="text-slate-300">→</span>}
            </li>
          );
        })}
      </ol>
      {statusHistory.length > 0 && (
        <ul className="space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
          {statusHistory.map((entry, index) => (
            <li key={`${entry.status}-${index}`}>
              {entry.status} · {formatOrderDate(entry.changedAt)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderDetailsSkeleton() {
  return (
    <div className="mt-8 animate-pulse space-y-5">
      <div className="h-8 w-48 rounded bg-slate-200" />
      <div className="h-40 rounded-2xl bg-white" />
      <div className="h-40 rounded-2xl bg-white" />
    </div>
  );
}

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      setLoading(true);
      setError("");
      try {
        const data = await getOrderById(id);
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (!cancelled) {
          const { message } = parseApiError(err);
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const subtotal = useMemo(() => {
    if (!order?.subOrders) return 0;
    return order.subOrders.reduce((sum, sub) => sum + Number(sub.subtotal || 0), 0);
  }, [order]);

  if (error === "Authentication required" || error.includes("Invalid or expired token")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/orders" className="text-sm font-medium text-teal-700 hover:text-teal-800">
          ← Back to orders
        </Link>

        {loading ? (
          <OrderDetailsSkeleton />
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {error}
          </div>
        ) : !order ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Order not found.
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {formatOrderId(order._id)}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Placed {formatOrderDate(order.placedAt || order.createdAt)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(order.status)}`}
              >
                {order.status}
              </span>
            </div>

            <section className="mt-8 space-y-5">
              {order.subOrders?.map((subOrder) => {
                const store = subOrder.storeId;
                const storeName = store?.name || "Vendor";
                const storeSlug = store?.slug || "";

                return (
                  <div
                    key={subOrder._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {storeSlug ? (
                        <Link
                          to={`/store/${storeSlug}`}
                          className="font-semibold text-slate-900 hover:text-teal-700"
                        >
                          {storeName}
                        </Link>
                      ) : (
                        <p className="font-semibold text-slate-900">{storeName}</p>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(subOrder.status)}`}
                      >
                        {subOrder.status}
                      </span>
                    </div>
                    <Timeline status={subOrder.status} statusHistory={subOrder.statusHistory} />
                    <ul className="mt-4 divide-y divide-slate-200">
                      {subOrder.items.map((item) => (
                        <li key={`${subOrder._id}-${item.productId}`} className="flex items-center gap-4 py-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-teal-50 text-sm font-semibold text-teal-800">
                            {item.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/product/${item.productId}`}
                              className="font-medium text-slate-900 hover:text-teal-700"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-teal-800">
                            ${Number(item.subtotal).toFixed(2)}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-right text-sm font-medium text-slate-700">
                      Sub-order total: ${Number(subOrder.subtotal).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </section>

            <section className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Shipping address
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {formatShippingAddress(order.shippingAddress)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Order summary
                </h2>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <dt>Subtotal</dt>
                    <dd>${subtotal.toFixed(2)}</dd>
                  </div>
                  {order.paymentMethod && (
                    <div className="flex justify-between text-slate-600">
                      <dt>Payment</dt>
                      <dd className="uppercase">{order.paymentMethod}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
                    <dt>Grand total</dt>
                    <dd>${Number(order.grandTotal).toFixed(2)}</dd>
                  </div>
                </dl>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default OrderDetails;
