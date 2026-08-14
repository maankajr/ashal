import { useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../store/CartContext";

function Cart() {
  const { cartItems, updateQuantity, removeItem } = useCart();

  const groupedByStore = useMemo(() => {
    return cartItems.reduce((groups, item) => {
      if (!groups[item.storeName]) {
        groups[item.storeName] = [];
      }
      groups[item.storeName].push(item);
      return groups;
    }, {});
  }, [cartItems]);

  const vendorTotals = useMemo(() => {
    return cartItems.reduce((totals, item) => {
      totals[item.storeName] = (totals[item.storeName] || 0) + item.price * item.quantity;
      return totals;
    }, {});
  }, [cartItems]);

  const grandTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Your cart
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {cartItems.length === 0
              ? "No items yet."
              : `${cartItems.length} item${cartItems.length === 1 ? "" : "s"} from trusted Ashal vendors.`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">Your cart is empty.</p>
            <p className="mt-2 text-sm text-slate-500">
              Browse watches, sneakers, tech, and more from local vendors.
            </p>
            <Link
              to="/shop"
              className="mt-5 inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <section className="space-y-6">
              {Object.entries(groupedByStore).map(([storeName, storeItems]) => (
                <div
                  key={storeName}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <h2 className="text-sm font-semibold text-slate-800">{storeName}</h2>
                  </div>
                  <ul className="divide-y divide-slate-200">
                    {storeItems.map((item) => (
                      <li key={item.id} className="flex gap-4 p-4">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <Link
                              to={`/product/${item.id}`}
                              className="font-medium text-slate-900 hover:text-teal-700"
                            >
                              {item.productName}
                            </Link>
                            <p className="mt-1 text-sm text-slate-600">
                              ${item.price.toFixed(2)} each
                            </p>
                            <p className="mt-1 text-sm font-semibold text-teal-800">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center gap-3 sm:mt-0">
                            <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
                              <button
                                type="button"
                                className="px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                                onClick={() =>
                                  updateQuantity(item.id, Math.max(1, item.quantity - 1))
                                }
                                aria-label={`Decrease ${item.productName} quantity`}
                              >
                                -
                              </button>
                              <span className="min-w-6 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label={`Increase ${item.productName} quantity`}
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-sm font-medium text-rose-700 hover:text-rose-800"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                {Object.entries(vendorTotals).map(([storeName, total]) => (
                  <div key={storeName} className="flex justify-between text-slate-600">
                    <dt>{storeName}</dt>
                    <dd>${total.toFixed(2)}</dd>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                  <dt>Grand total</dt>
                  <dd>${grandTotal.toFixed(2)}</dd>
                </div>
              </dl>
              <button
                type="button"
                className="mt-5 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Proceed to Checkout
              </button>
              <Link
                to="/shop"
                className="mt-3 block text-center text-sm font-medium text-teal-700 hover:text-teal-800"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Cart;
