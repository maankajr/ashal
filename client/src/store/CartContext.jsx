import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

const initialCartItems = [
  {
    id: 1,
    storeName: "TechVault",
    productName: "Apex Smartwatch Pro",
    price: 189.0,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=200&h=200&fit=crop&q=80",
  },
  {
    id: 3,
    storeName: "TechVault",
    productName: "Pulse Wireless Earbuds",
    price: 79.5,
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=200&h=200&fit=crop&q=80",
  },
  {
    id: 2,
    storeName: "Stride & Co.",
    productName: "Velocity Running Sneakers",
    price: 129.99,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=200&fit=crop&q=80",
  },
];

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(initialCartItems);

  function updateQuantity(itemId, newQuantity) {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }

  function removeItem(itemId) {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }

  function addItem(product) {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...prevItems,
        {
          id: product.id,
          storeName: product.storeName || product.vendor || "Ashal Store",
          productName: product.productName || product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ];
    });
  }

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      updateQuantity,
      removeItem,
      addItem,
    }),
    [cartItems, cartCount]
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
