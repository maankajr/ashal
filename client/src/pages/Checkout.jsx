import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Modal from "../components/Modal";
import { parseApiError } from "../api/auth.js";
import { checkout } from "../api/orders.js";
import { getMyProfile } from "../api/users.js";
import { useAuth } from "../store/AuthContext";
import { useCart } from "../store/CartContext";
import { formatShippingAddress } from "../utils/statusStyles";

const deliveryFee = 4.99;

const emptyAddressDraft = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  country: "",
  phone: "",
};

function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, clearCartItems, refreshCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddressDraft);
  const [payment, setPayment] = useState("cod");
  const [showEvcModal, setShowEvcModal] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function loadCheckoutData() {
      setLoadingProfile(true);
      try {
        await refreshCart();
        const profile = await getMyProfile();
        if (cancelled) return;
        const profileAddresses = profile.addresses || [];
        setAddresses(profileAddresses);
        const defaultAddress =
          profileAddresses.find((address) => address.isDefault) || profileAddresses[0];
        if (defaultAddress) {
          setSelectedAddressId(String(defaultAddress._id));
        }
      } catch (error) {
        if (!cancelled) {
          const { message } = parseApiError(error);
          setCheckoutError(message);
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    loadCheckoutData();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshCart]);

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  function addNewAddress(event) {
    event.preventDefault();
    if (
      !newAddress.label.trim() ||
      !newAddress.line1.trim() ||
      !newAddress.city.trim() ||
      !newAddress.country.trim()
    ) {
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const address = {
      _id: tempId,
      ...newAddress,
      isDefault: addresses.length === 0,
    };
    setAddresses((current) => [...current, address]);
    setSelectedAddressId(tempId);
    setNewAddress(emptyAddressDraft);
    setShowNewAddress(false);
  }

  function closeEvcModal() {
    setShowEvcModal(false);
    setTransactionRef("");
  }

  function getSelectedShippingAddress() {
    const selected = addresses.find((address) => String(address._id) === String(selectedAddressId));
    if (!selected) return null;

    return {
      label: selected.label,
      line1: selected.line1,
      line2: selected.line2 || "",
      city: selected.city,
      region: selected.region || "",
      country: selected.country,
      phone: selected.phone || "",
    };
  }

  async function submitOrder(extra = {}) {
    if (!cartItems.length) return;

    const shippingAddress = getSelectedShippingAddress();
    if (!shippingAddress) {
      setCheckoutError("Please select or add a shipping address.");
      return;
    }

    setSubmitting(true);
    setCheckoutError("");

    try {
      const result = await checkout({
        shippingAddress,
        paymentMethod: payment,
        ...extra,
      });

      await clearCartItems();
      closeEvcModal();
      navigate(`/orders/${result.order._id}`, { replace: true });
    } catch (error) {
      const { message } = parseApiError(error);
      setCheckoutError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handlePlaceOrder() {
    if (!cartItems.length) return;
    if (payment === "evc") {
      setTransactionRef("");
      setShowEvcModal(true);
      return;
    }
    submitOrder();
  }

  function confirmEvcPayment() {
    if (!transactionRef.trim()) return;
    submitOrder({ transactionReference: transactionRef.trim() });
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Checkout</h1>
        <p className="mt-1 text-sm text-slate-600">Review your address, order, and payment method.</p>

        {checkoutError && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {checkoutError}
          </p>
        )}

        {loadingProfile ? (
          <div className="mt-8 animate-pulse rounded-2xl border border-slate-200 bg-white p-8">
            <div className="h-6 w-40 rounded bg-slate-200" />
            <div className="mt-4 h-24 rounded bg-slate-100" />
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
                  {addresses.length === 0 ? (
                    <p className="text-sm text-slate-600">
                      No saved addresses yet. Add one below or save addresses in your{" "}
                      <Link to="/profile" className="font-medium text-teal-700 hover:text-teal-800">
                        profile
                      </Link>
                      .
                    </p>
                  ) : (
                    addresses.map((address) => (
                      <label
                        key={address._id}
                        className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                          String(selectedAddressId) === String(address._id)
                            ? "border-teal-700 bg-teal-50"
                            : "border-slate-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={String(selectedAddressId) === String(address._id)}
                          onChange={() => setSelectedAddressId(String(address._id))}
                          className="mt-1 accent-teal-700"
                        />
                        <span>
                          <span className="block font-medium text-slate-900">{address.label}</span>
                          <span className="mt-1 block text-sm text-slate-600">
                            {formatShippingAddress(address)}
                          </span>
                        </span>
                      </label>
                    ))
                  )}
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
                    <input
                      placeholder="Address line 1"
                      value={newAddress.line1}
                      onChange={(event) =>
                        setNewAddress((current) => ({ ...current, line1: event.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                    />
                    <input
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(event) =>
                        setNewAddress((current) => ({ ...current, city: event.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                    />
                    <input
                      placeholder="Country"
                      value={newAddress.country}
                      onChange={(event) =>
                        setNewAddress((current) => ({ ...current, country: event.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Use this address
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
                            {item.image ? (
                              <img
                                src={item.image}
                                alt=""
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-teal-50 text-sm font-semibold text-teal-800">
                                {item.productName.charAt(0)}
                              </div>
                            )}
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
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                      payment === "cod" ? "border-teal-700 bg-teal-50" : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === "cod"}
                      onChange={() => setPayment("cod")}
                      className="accent-teal-700"
                    />
                    <span className="text-sm font-medium text-slate-900">Cash on Delivery</span>
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                      payment === "evc" ? "border-teal-700 bg-teal-50" : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === "evc"}
                      onChange={() => setPayment("evc")}
                      className="accent-teal-700"
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-900">EVC Plus</span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        Pay to 0615269156 after placing your order
                      </span>
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
              <p className="mt-3 text-xs text-slate-500">
                Order total charged at checkout excludes the demo delivery fee shown here.
              </p>
              <button
                type="button"
                disabled={submitting || !getSelectedShippingAddress()}
                onClick={handlePlaceOrder}
                className="mt-5 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Placing order…" : "Place Order"}
              </button>
            </aside>
          </div>
        )}
      </main>

      <Modal open={showEvcModal} onClose={closeEvcModal} title="Complete Your EVC Plus Payment">
        <p className="text-sm font-semibold text-teal-800">
          Send ${grandTotal.toFixed(2)} to: 0615269156
        </p>
        <label className="mt-5 block text-sm font-medium text-slate-800">
          Transaction Reference
          <input
            type="text"
            value={transactionRef}
            onChange={(event) => setTransactionRef(event.target.value)}
            placeholder="e.g. MP123456789"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
          />
        </label>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            disabled={!transactionRef.trim() || submitting}
            onClick={confirmEvcPayment}
            className="flex-1 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirm Payment
          </button>
          <button
            type="button"
            onClick={closeEvcModal}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}

export default Checkout;
