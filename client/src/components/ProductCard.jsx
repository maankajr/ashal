import { useState } from "react";
import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { parseApiError } from "../api/auth.js";
import { useAuth } from "../store/AuthContext";
import { useCart } from "../store/CartContext";
import { useWishlist } from "../store/WishlistContext";

export function StarRating({ rating }) {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rounded ? "text-amber-400" : "text-slate-300"}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-xs text-slate-500">{(Number(rating) || 0).toFixed(1)}</span>
    </div>
  );
}

function ProductCard({ product, showAddButton = false, showWishlist = false }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const [wishlistError, setWishlistError] = useState("");
  const [cartError, setCartError] = useState("");
  const [cartBusy, setCartBusy] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  const productId = product._id || product.id;
  const saved = isInWishlist(productId);

  async function handleWishlistClick(event) {
    event.preventDefault();
    event.stopPropagation();
    setWishlistError("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role === "vendor") {
      setWishlistError("Sign in as a customer to save items.");
      return;
    }

    try {
      await toggleItem(productId);
    } catch (error) {
      setWishlistError(parseApiError(error).message || "Could not update wishlist.");
    }
  }

  async function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();
    setCartError("");
    setCartAdded(false);
    setCartBusy(true);

    try {
      await addItem(product, 1);
      setCartAdded(true);
    } catch (error) {
      if (error?.code === "VENDOR_CART_FORBIDDEN") {
        setCartError(error.message);
      } else {
        const parsed = parseApiError(error);
        const detail = Object.values(parsed.fieldErrors || {})[0];
        setCartError(detail || parsed.message || "Could not add to cart.");
      }
    } finally {
      setCartBusy(false);
    }
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <Link to={`/product/${product.slug || product.id}`} className="flex flex-1 flex-col">
          <div className="aspect-square overflow-hidden bg-slate-100">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-100 to-slate-200 text-3xl font-semibold text-teal-800">
                {product.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 p-3 text-left">
            <h3 className="line-clamp-2 text-sm font-medium text-slate-900">{product.name}</h3>
            <StarRating rating={product.rating} />
            <p className="mt-auto pt-1 text-base font-semibold text-teal-800">
              ${Number(product.price || 0).toFixed(2)}
            </p>
            {wishlistError && (
              <p className="text-[11px] leading-snug text-rose-600">{wishlistError}</p>
            )}
            {cartError && <p className="text-[11px] leading-snug text-rose-600">{cartError}</p>}
            {cartAdded && !cartError && (
              <p className="text-[11px] leading-snug text-emerald-700">Added to cart</p>
            )}
          </div>
        </Link>
        {showWishlist && (
          <button
            type="button"
            onClick={handleWishlistClick}
            className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white"
            aria-label={
              saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`
            }
          >
            <Heart
              className={`h-4 w-4 ${saved ? "fill-rose-600 text-rose-600" : "text-slate-500"}`}
            />
          </button>
        )}
      </div>
      {showAddButton && (
        <div className="border-t border-slate-100 p-3 pt-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={cartBusy}
            className="w-full rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {cartBusy ? "Adding…" : cartAdded ? "Added" : "Add to cart"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
