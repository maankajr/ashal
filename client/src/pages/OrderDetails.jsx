import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { orderTimeline, statusStyles } from "../utils/statusStyles";

const mockOrders = {
  "ASH-1048": {
    id: "ASH-1048",
    date: "Aug 12, 2026",
    address: "12 Maka Al Mukarama Rd, Hodan, Mogadishu",
    deliveryFee: 4.99,
    status: "Pending",
    vendors: [
      {
        storeName: "TechVault",
        status: "Pending",
        items: [
          {
            id: 1,
            name: "Apex Smartwatch Pro",
            quantity: 1,
            price: 189.0,
            image:
              "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=200&h=200&fit=crop&q=80",
          },
          {
            id: 3,
            name: "Pulse Wireless Earbuds",
            quantity: 2,
            price: 79.5,
            image:
              "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=200&h=200&fit=crop&q=80",
          },
        ],
      },
      {
        storeName: "Stride & Co.",
        status: "Confirmed",
        items: [
          {
            id: 2,
            name: "Velocity Running Sneakers",
            quantity: 1,
            price: 129.99,
            image:
              "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=200&fit=crop&q=80",
          },
        ],
      },
    ],
  },
  "ASH-1042": {
    id: "ASH-1042",
    date: "Aug 4, 2026",
    address: "KM4, Airport Road, Wadajir, Mogadishu",
    deliveryFee: 4.99,
    status: "Shipped",
    vendors: [
      {
        storeName: "Stride & Co.",
        status: "Shipped",
        items: [
          {
            id: 5,
            name: "ClearVue Aviator Glasses",
            quantity: 1,
            price: 89.0,
            image:
              "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop&q=80",
          },
          {
            id: 2,
            name: "Velocity Running Sneakers",
            quantity: 1,
            price: 129.99,
            image:
              "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=200&fit=crop&q=80",
          },
        ],
      },
    ],
  },
  "ASH-1036": {
    id: "ASH-1036",
    date: "Jul 28, 2026",
    address: "12 Maka Al Mukarama Rd, Hodan, Mogadishu",
    deliveryFee: 0,
    status: "Delivered",
    vendors: [
      {
        storeName: "TechVault",
        status: "Delivered",
        items: [
          {
            id: 4,
            name: "NovaBook Ultralight Laptop",
            quantity: 1,
            price: 999.0,
            image:
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop&q=80",
          },
        ],
      },
    ],
  },
  "ASH-1029": {
    id: "ASH-1029",
    date: "Jul 19, 2026",
    address: "12 Maka Al Mukarama Rd, Hodan, Mogadishu",
    deliveryFee: 4.99,
    status: "Cancelled",
    vendors: [
      {
        storeName: "TechVault",
        status: "Cancelled",
        items: [
          {
            id: 7,
            name: "PixelMax Pro Phone",
            quantity: 1,
            price: 749.0,
            image:
              "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&h=200&fit=crop&q=80",
          },
        ],
      },
    ],
  },
  "ASH-1021": {
    id: "ASH-1021",
    date: "Jul 8, 2026",
    address: "KM4, Airport Road, Wadajir, Mogadishu",
    deliveryFee: 4.99,
    status: "Delivered",
    vendors: [
      {
        storeName: "Stride & Co.",
        status: "Delivered",
        items: [
          {
            id: 10,
            name: "Urban Linen Overshirt",
            quantity: 2,
            price: 68.0,
            image:
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&q=80",
          },
        ],
      },
    ],
  },
};

function Timeline({ status }) {
  if (status === "Cancelled") {
    return <p className="mt-3 text-sm text-rose-700">This sub-order was cancelled.</p>;
  }

  const currentIndex = Math.max(0, orderTimeline.indexOf(status));

  return (
    <ol className="mt-4 flex flex-wrap gap-2">
      {orderTimeline.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isDone = index < currentIndex;
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
  );
}

function OrderDetails() {
  const { id } = useParams();
  const baseOrder = mockOrders[id] ?? mockOrders["ASH-1048"];
  const [order, setOrder] = useState(baseOrder);

  useEffect(() => {
    setOrder(mockOrders[id] ?? mockOrders["ASH-1048"]);
  }, [id]);

  const subtotal = useMemo(
    () =>
      order.vendors.reduce(
        (sum, vendor) =>
          sum + vendor.items.reduce((vendorSum, item) => vendorSum + item.price * item.quantity, 0),
        0
      ),
    [order]
  );
  const grandTotal = subtotal + order.deliveryFee;
  const canCancel = order.status === "Pending" || order.status === "Confirmed";

  function cancelOrder() {
    setOrder((current) => ({
      ...current,
      status: "Cancelled",
      vendors: current.vendors.map((vendor) =>
        vendor.status === "Pending" || vendor.status === "Confirmed"
          ? { ...vendor, status: "Cancelled" }
          : vendor
      ),
    }));
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/orders" className="text-sm font-medium text-teal-700 hover:text-teal-800">
          ← Back to orders
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{order.id}</h1>
            <p className="mt-1 text-sm text-slate-600">Placed {order.date}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
            {order.status}
          </span>
        </div>

        <section className="mt-8 space-y-5">
          {order.vendors.map((vendor) => (
            <div key={vendor.storeName} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  to={`/store/${vendor.storeName === "TechVault" ? "techvault" : "stride-co"}`}
                  className="font-semibold text-slate-900 hover:text-teal-700"
                >
                  {vendor.storeName}
                </Link>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[vendor.status]}`}>
                  {vendor.status}
                </span>
              </div>
              <Timeline status={vendor.status} />
              <ul className="mt-4 divide-y divide-slate-200">
                {vendor.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-3">
                    <img src={item.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${item.id}`} className="font-medium text-slate-900 hover:text-teal-700">
                        {item.name}
                      </Link>
                      <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-teal-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Shipping address
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{order.address}</p>
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
              <div className="flex justify-between text-slate-600">
                <dt>Delivery fee</dt>
                <dd>${order.deliveryFee.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
                <dt>Grand total</dt>
                <dd>${grandTotal.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </section>

        {canCancel && (
          <button
            type="button"
            onClick={cancelOrder}
            className="mt-6 rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            Cancel Order
          </button>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default OrderDetails;
