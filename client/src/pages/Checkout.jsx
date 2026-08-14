import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../store/CartContext";

const savedAddresses = [
  {
    id: 1,
    label: "Home",
    text: "12 Maka Al Mukarama Rd, Hodan, Mogadishu",
  },
  {
    id: 2,
    label: "Office",
    text: "KM4, Airport Road, Wadajir, Mogadishu",
  },
];

const deliveryFee = 4.99;

function Checkout() {
  const { cartItems } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", text: "" });
  const [extraAddresses, setExtraAddresses] = useState([]);
  const [payment, setPayment] = useState("cod");
  const [placed, setPlaced] = useState(false);

  const addresses = [...savedAddresses, ...extraAddresses];

  const groupedByStore = useMemo(() => {
    return cartItems.reduce((groups, item) => {
      if (!groups[item.storeName]) groups[item.storeName] = [];
      groups[item.storeName].push(item);
      return groups;
    }, {});
  }, [cartItems]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );
  const grandTotal = subtotal + (cartItems.length ? deliveryFee : 0);

  function addNewAddress(event) {
    event.preventDefault();
    if (!newAddress.label.trim() || !newAddress.text.trim()) return;
    const address = { id: Date.now(), ...newAddress };
    setExtraAddresses((current) => [...current, address]);
    setSelectedAddress(address.id);
    setNewAddress({ label: "", text: "" });
    setShowNewAddress(false);
  }

  function placeOrder() {
    if (!cartItems.length) return;
    setPlaced(true);
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Checkout</h1>
        <p className="mt-1 text-sm text-slate-600">Review your address, order, and payment method.</p>

        {placed ? (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <p className="text-lg font-semibold text-emerald-900">Order placed successfully</p>
            <p className="mt-2 text-sm text-emerald-800">
              This is a demo confirmation — no real order was created yet.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                to="/orders"
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              >
                View orders
              </Link>
              <Link
                to="/shop"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-semibold text-slate-800">Your cart is empty.</p>
            <Link
              to="/shop"
              className="mt-4 inline-block rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Step 1 · Shipping address
                </h2>
                <div className="mt-4 space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                        selectedAddress === address.id
                          ? "border-teal-700 bg-teal-50"
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === address.id}
                        onChange={() => setSelectedAddress(address.id)}
                        className="mt-1 accent-teal-700"
                      />
                      <span>
                        <span className="block font-medium text-slate-900">{address.label}</span>
                        <span className="mt-1 block text-sm text-slate-600">{address.text}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewAddress((value) => !value)}
                  className="mt-4 text-sm font-medium text-teal-700 hover:text-teal-800"
                >
                  {showNewAddress ? "Hide new address form" : "Add new address"}
                </button>
                {showNewAddress && (
                  <form onSubmit={addNewAddress} className="mt-4 space-y-3">
                    <input
                      placeholder="Label"
                      value={newAddress.label}
                      onChange={(event) =>
                        setNewAddress((current) => ({ ...current, label: event.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                    />
                    <textarea
                      placeholder="Full address"
                      value={newAddress.text}
                      onChange={(event) =>
                        setNewAddress((current) => ({ ...current, text: event.target.value }))
                      }
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Save address
                    </button>
                  </form>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Step 2 · Order review
                </h2>
                <div className="mt-4 space-y-4">
                  {Object.entries(groupedByStore).map(([storeName, storeItems]) => (
                    <div key={storeName} className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
                        <p className="text-sm font-semibold text-slate-800">{storeName}</p>
                      </div>
                      <ul className="divide-y divide-slate-200">
                        {storeItems.map((item) => (
                          <li key={item.id} className="flex items-center gap-4 p-4">
                            <img
                              src={item.image}
                              alt=""
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900">{item.productName}</p>
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
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Step 3 · Payment
                </h2>
                <div className="mt-4 space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-teal-700 bg-teal-50 p-4">
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === "cod"}
                      onChange={() => setPayment("cod")}
                      className="accent-teal-700"
                    />
                    <span className="text-sm font-medium text-slate-900">Cash on Delivery</span>
                  </label>
                  <label className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-60">
                    <input type="radio" name="payment" disabled className="accent-teal-700" />
                    <span className="text-sm font-medium text-slate-700">
                      Card (Coming Soon)
                    </span>
                  </label>
                </div>
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <dt>Subtotal</dt>
                  <dd>${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                  <dt>Delivery fee</dt>
                  <dd>${deliveryFee.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                  <dt>Grand total</dt>
                  <dd>${grandTotal.toFixed(2)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={placeOrder}
                className="mt-5 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Place Order
              </button>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;
