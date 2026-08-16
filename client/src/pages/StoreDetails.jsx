import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard, { StarRating } from "../components/ProductCard";
import { parseApiError } from "../api/auth.js";
import { getStoreDetails, mapProductForCard } from "../api/products.js";

function StoreDetails() {
  const { storeId } = useParams();
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStore() {
      setLoading(true);
      setError("");
      try {
        const data = await getStoreDetails(storeId);
        if (!cancelled) {
          setStoreData({
            store: data.store,
            products: (data.products || []).map(mapProductForCard),
            meta: data.meta,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(parseApiError(err).message || "Store not found.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (storeId) {
      loadStore();
    }

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          <div className="h-48 w-full animate-pulse bg-slate-200 sm:h-64" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="-mt-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end">
              <div className="h-20 w-20 animate-pulse rounded-2xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <section className="py-10">
              <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-xl border border-slate-200 bg-white"
                  />
                ))}
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !storeData?.store) {
    return (
      <div className="flex min-h-svh flex-col bg-slate-50">
        <Navbar />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm sm:p-12">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Store Not Found
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              {error || "The store you are looking for does not exist or may have been removed."}
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              ← Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { store, products } = storeData;

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <section className="relative isolate overflow-hidden">
          {store.bannerUrl ? (
            <img
              src={store.bannerUrl}
              alt=""
              className="h-48 w-full object-cover sm:h-64"
            />
          ) : (
            <div className="h-48 w-full bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 sm:h-64" />
          )}
          <div className="absolute inset-0 bg-slate-950/30" />
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-teal-800 text-3xl font-bold text-white shadow-md">
                {store.name?.charAt(0) || "S"}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{store.name}</h1>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                  {store.productCount} {store.productCount === 1 ? "Product" : "Products"}
                </span>
              </div>
              {store.description && (
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  {store.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <StarRating rating={store.rating} />
                {store.contactEmail && <span>✉ {store.contactEmail}</span>}
                {store.contactPhone && <span>☎ {store.contactPhone}</span>}
              </div>
            </div>
          </div>

          <section className="py-10">
            <h2 className="text-xl font-semibold text-slate-900">From this store</h2>
            <p className="mt-1 text-sm text-slate-600">
              Active products sold by {store.name}.
            </p>

            {products.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <p className="text-sm font-semibold text-slate-800">
                  No products available from this store yet.
                </p>
                <Link
                  to="/shop"
                  className="mt-3 inline-block text-sm font-medium text-teal-700 hover:text-teal-800"
                >
                  Explore other products in the shop →
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.slug || product._id || product.id}
                    product={product}
                    showAddButton
                    showWishlist
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default StoreDetails;
