import { useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { useCart } from "../store/CartContext";

const initialWishlist = [
  {
    id: 1,
    name: "Apex Smartwatch Pro",
    price: 189.0,
    rating: 4.8,
    storeName: "TechVault",
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Velocity Running Sneakers",
    price: 129.99,
    rating: 4.7,
    storeName: "Stride & Co.",
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Pulse Wireless Earbuds",
    price: 79.5,
    rating: 4.6,
    storeName: "TechVault",
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 5,
    name: "ClearVue Aviator Glasses",
    price: 89.0,
    rating: 4.5,
    storeName: "Stride & Co.",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 4,
    name: "NovaBook Ultralight Laptop",
    price: 999.0,
    rating: 4.9,
    storeName: "TechVault",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 10,
    name: "Urban Linen Overshirt",
    price: 68.0,
    rating: 4.2,
    storeName: "Stride & Co.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80",
  },
];

function Wishlist() {
  const [items, setItems] = useState(initialWishlist);
  const [movedId, setMovedId] = useState(null);
  const { addItem } = useCart();

  function removeFromWishlist(itemId) {
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  function moveToCart(product) {
    addItem(product);
    setMovedId(product.id);
    setItems((current) => current.filter((item) => item.id !== product.id));
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Wishlist</h1>
        <p className="mt-1 text-sm text-slate-600">Saved items you can move to your cart anytime.</p>

        {movedId && (
          <p className="mt-4 text-sm text-emerald-700">Moved to cart. Continue shopping or check out when ready.</p>
        )}

        {items.length === 0 ? (
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
            {items.map((product) => (
              <div key={product.id} className="flex flex-col">
                <div className="relative">
                  <ProductCard product={product} />
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 text-rose-600 shadow-sm hover:bg-white"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => moveToCart(product)}
                  className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Move to Cart
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
