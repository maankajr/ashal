import { useState } from "react";
import { Heart } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { parseApiError } from "../api/auth.js";
import { useAuth } from "../store/AuthContext";
import { useWishlist } from "../store/WishlistContext";

function WishlistSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="aspect-square animate-pulse rounded-xl bg-slate-200" />
          <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { wishlistItems, wishlistLoading, removeItem, moveItemToCart } = useWishlist();
  const [movedId, setMovedId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  async function handleRemove(productId) {
    setActionError("");
    setBusyId(productId);
    try {
      await removeItem(productId);
    } catch (error) {
      setActionError(parseApiError(error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleMoveToCart(product) {
    setActionError("");
    setBusyId(product.id);
    try {
      await moveItemToCart(product.id);
      setMovedId(product.id);
    } catch (error) {
      setActionError(parseApiError(error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Wishlist</h1>
        <p className="mt-1 text-sm text-slate-600">Saved items you can move to your cart anytime.</p>

        {actionError && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {actionError}
          </p>
        )}

        {movedId && (
          <p className="mt-4 text-sm text-emerald-700">
            Moved to cart. Continue shopping or check out when ready.
          </p>
        )}

        {wishlistLoading ? (
          <WishlistSkeleton />
        ) : wishlistItems.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">Your wishlist is empty.</p>
            <p className="mt-2 text-sm text-slate-500">Save products you love and come back to them later.</p>
            <Link
              to="/shop"
              className="mt-5 inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {wishlistItems.map((product) => (
              <div key={product.id} className="flex flex-col">
                <div className="relative">
                  <ProductCard product={product} />
                  <button
                    type="button"
                    disabled={busyId === product.id}
                    onClick={() => handleRemove(product.id)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 text-rose-600 shadow-sm hover:bg-white disabled:opacity-60"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={busyId === product.id || product.stock <= 0}
                  onClick={() => handleMoveToCart(product)}
                  className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {product.stock <= 0 ? "Out of stock" : "Move to Cart"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Wishlist;
