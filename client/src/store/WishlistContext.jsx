import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as wishlistApi from "../api/wishlist.js";
import { mapCartToItems } from "../api/cart.js";
import { useAuth } from "./AuthContext.jsx";
import { useCart } from "./CartContext.jsx";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const { refreshCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const productIds = useMemo(
    () => new Set(items.map((item) => String(item.id || item._id))),
    [items]
  );

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const wishlist = await wishlistApi.getMyWishlist();
      setItems(wishlistApi.mapWishlistItems(wishlist));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && token) {
      refreshWishlist();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, token, refreshWishlist]);

  function isInWishlist(productId) {
    return productIds.has(String(productId));
  }

  async function addItem(productId) {
    const wishlist = await wishlistApi.addToWishlist(productId);
    setItems(wishlistApi.mapWishlistItems(wishlist));
    return wishlist;
  }

  async function removeItem(productId) {
    const wishlist = await wishlistApi.removeFromWishlist(productId);
    setItems(wishlistApi.mapWishlistItems(wishlist));
    return wishlist;
  }

  async function moveItemToCart(productId) {
    const result = await wishlistApi.moveToCart(productId);
    setItems(wishlistApi.mapWishlistItems(result.wishlist));
    await refreshCart();
    return result;
  }

  async function toggleItem(productId) {
    if (isInWishlist(productId)) {
      await removeItem(productId);
    } else {
      await addItem(productId);
    }
  }

  const value = useMemo(
    () => ({
      wishlistItems: items,
      wishlistCount: items.length,
      wishlistLoading: loading,
      isInWishlist,
      addItem,
      removeItem,
      moveItemToCart,
      toggleItem,
      refreshWishlist,
    }),
    [items, loading, refreshWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
