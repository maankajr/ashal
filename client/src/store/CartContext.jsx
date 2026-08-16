import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as cartApi from "../api/cart.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

function mapCartResponse(cart) {
  return cartApi.mapCartToItems(cart);
}

function toGuestCartItem(product, quantity) {
  const productId = product._id || product.id;
  return {
    id: productId,
    productId,
    storeName: product.storeName || product.vendor || "Ashal Store",
    productName: product.productName || product.name,
    price: Number(product.price) || 0,
    quantity,
    image: product.image || "",
  };
}

export function CartProvider({ children }) {
  const { isAuthenticated, authReady, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const canUseServerCart =
    isAuthenticated && (user?.role === "customer" || user?.role === "admin");

  const refreshCart = useCallback(async () => {
    if (!canUseServerCart) return;
    setLoading(true);
    try {
      const cart = await cartApi.getCart();
      setCartItems(mapCartResponse(cart));
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [canUseServerCart]);

  useEffect(() => {
    if (!authReady) return;

    if (canUseServerCart) {
      refreshCart();
    } else if (!isAuthenticated) {
      // Keep guest local cart across authReady flip when logged out
    } else {
      // Vendor (or other non-customer roles): server cart is unavailable
      setCartItems([]);
    }
  }, [authReady, canUseServerCart, isAuthenticated, refreshCart]);

  const updateQuantity = useCallback(
    async (itemId, newQuantity) => {
      const qty = Math.max(1, Number(newQuantity) || 1);

      if (canUseServerCart) {
        const cart = await cartApi.updateCartItem(itemId, qty);
        setCartItems(mapCartResponse(cart));
        return;
      }

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          String(item.id) === String(itemId) ? { ...item, quantity: qty } : item
        )
      );
    },
    [canUseServerCart]
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (canUseServerCart) {
        const cart = await cartApi.removeCartItem(itemId);
        setCartItems(mapCartResponse(cart));
        return;
      }

      setCartItems((prevItems) => prevItems.filter((item) => String(item.id) !== String(itemId)));
    },
    [canUseServerCart]
  );

  const addItem = useCallback(
    async (product, quantity = 1) => {
      const amount = Math.max(1, Number(quantity) || 1);
      const productId = product?._id || product?.id;

      if (!productId) {
        throw new Error("Missing product id");
      }

      if (isAuthenticated && user?.role === "vendor") {
        const error = new Error("Sign in as a customer to add items to your cart.");
        error.code = "VENDOR_CART_FORBIDDEN";
        throw error;
      }

      if (canUseServerCart) {
        const cart = await cartApi.addCartItem(productId, amount);
        setCartItems(mapCartResponse(cart));
        return;
      }

      // Guest (or not yet ready): keep a local cart
      setCartItems((prevItems) => {
        const existing = prevItems.find((item) => String(item.id) === String(productId));

        if (existing) {
          return prevItems.map((item) =>
            String(item.id) === String(productId)
              ? { ...item, quantity: item.quantity + amount }
              : item
          );
        }

        return [...prevItems, toGuestCartItem(product, amount)];
      });
    },
    [canUseServerCart, isAuthenticated, user?.role]
  );

  const clearCartItems = useCallback(async () => {
    if (canUseServerCart) {
      const cart = await cartApi.clearCart();
      setCartItems(mapCartResponse(cart));
      return;
    }

    setCartItems([]);
  }, [canUseServerCart]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      cartLoading: loading,
      updateQuantity,
      removeItem,
      addItem,
      clearCartItems,
      refreshCart,
    }),
    [cartItems, cartCount, loading, updateQuantity, removeItem, addItem, clearCartItems, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
