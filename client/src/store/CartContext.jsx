import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as cartApi from "../api/cart.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

function mapCartResponse(cart) {
  return cartApi.mapCartToItems(cart);
}

export function CartProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const cart = await cartApi.getCart();
      setCartItems(mapCartResponse(cart));
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && token) {
      refreshCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, token, refreshCart]);

  async function updateQuantity(itemId, newQuantity) {
    const qty = Math.max(1, Number(newQuantity) || 1);

    if (isAuthenticated) {
      const cart = await cartApi.updateCartItem(itemId, qty);
      setCartItems(mapCartResponse(cart));
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        String(item.id) === String(itemId) ? { ...item, quantity: qty } : item
      )
    );
  }

  async function removeItem(itemId) {
    if (isAuthenticated) {
      const cart = await cartApi.removeCartItem(itemId);
      setCartItems(mapCartResponse(cart));
      return;
    }

    setCartItems((prevItems) => prevItems.filter((item) => String(item.id) !== String(itemId)));
  }

  async function addItem(product, quantity = 1) {
    const amount = Math.max(1, Number(quantity) || 1);
    const productId = product._id || product.id;

    if (isAuthenticated) {
      const cart = await cartApi.addCartItem(productId, amount);
      setCartItems(mapCartResponse(cart));
      return;
    }

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => String(item.id) === String(productId));

      if (existing) {
        return prevItems.map((item) =>
          String(item.id) === String(productId)
            ? { ...item, quantity: item.quantity + amount }
            : item
        );
      }

      return [
        ...prevItems,
        {
          id: productId,
          productId,
          storeName: product.storeName || product.vendor || "Ashal Store",
          productName: product.productName || product.name,
          price: product.price,
          quantity: amount,
          image: product.image,
        },
      ];
    });
  }

  async function clearCartItems() {
    if (isAuthenticated) {
      const cart = await cartApi.clearCart();
      setCartItems(mapCartResponse(cart));
      return;
    }

    setCartItems([]);
  }

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
    [cartItems, cartCount, loading, refreshCart]
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
