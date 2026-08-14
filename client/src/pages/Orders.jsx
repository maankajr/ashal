import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { statusStyles } from "../utils/statusStyles";

const orders = [
  {
    id: "ASH-1048",
    date: "Aug 12, 2026",
    itemCount: 3,
    total: 478.49,
    status: "Pending",
  },
  {
    id: "ASH-1042",
    date: "Aug 4, 2026",
    itemCount: 2,
    total: 268.99,
    status: "Shipped",
  },
  {
    id: "ASH-1036",
    date: "Jul 28, 2026",
    itemCount: 1,
    total: 999.0,
    status: "Delivered",
  },
  {
    id: "ASH-1029",
    date: "Jul 19, 2026",
    itemCount: 4,
    total: 156.5,
    status: "Cancelled",
  },
  {
    id: "ASH-1021",
    date: "Jul 8, 2026",
    itemCount: 2,
    total: 218.0,
    status: "Delivered",
  },
];

function Orders() {
  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-slate-600">Track purchases from Ashal vendors.</p>

        {orders.length === 0 ? (
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
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{order.id}</p>
                    <p className="mt-1 text-sm text-slate-500">Placed {order.date}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-slate-600">
                      {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                    </span>
                    <span className="font-semibold text-teal-800">${order.total.toFixed(2)}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
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
