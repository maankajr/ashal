import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard, { StarRating } from "../components/ProductCard";

const products = [
  {
    id: "1",
    name: "Handwoven Basket",
    price: 24.0,
    rating: 4.8,
    stock: 12,
    vendor: "Nomad Crafts",
    description: "A sturdy, naturally dyed basket woven by local artisans. Ideal for storage or as a centerpiece.",
    images: [
      "https://picsum.photos/seed/ashal-1/800/800",
      "https://picsum.photos/seed/ashal-1b/800/800",
      "https://picsum.photos/seed/ashal-1c/800/800",
    ],
  },
  {
    id: "2",
    name: "Ceramic Pour-Over Set",
    price: 38.5,
    rating: 4.6,
    stock: 7,
    vendor: "Coastal Goods",
    description: "A two-piece ceramic dripper and carafe with a clean pour and a matte finish.",
    images: [
      "https://picsum.photos/seed/ashal-2/800/800",
      "https://picsum.photos/seed/ashal-2b/800/800",
    ],
  },
];

const reviews = [
  { id: 1, name: "Amina K.", rating: 5, comment: "Beautiful quality and arrived well packed. I use it every day." },
  { id: 2, name: "Jamal R.", rating: 4, comment: "Looks even better in person. Shipping took a couple of extra days." },
  { id: 3, name: "Sara M.", rating: 5, comment: "Gifted this and it was a hit. Would buy from this store again." },
];

const fromThisStore = [
  { id: 3, name: "Linen Throw Pillow", price: 19.99, rating: 4.4, image: "https://picsum.photos/seed/ashal-3/600/600" },
  { id: 4, name: "Olive Wood Cutting Board", price: 32.0, rating: 4.9, image: "https://picsum.photos/seed/ashal-4/600/600" },
  { id: 6, name: "Soy Candle Trio", price: 28.0, rating: 4.7, image: "https://picsum.photos/seed/ashal-6/600/600" },
  { id: 8, name: "Leather Card Holder", price: 22.0, rating: 4.2, image: "https://picsum.photos/seed/ashal-8/600/600" },
];

function ProductDetails() {
  const { id } = useParams();
  const product = products.find((item) => item.id === String(id)) ?? {
    ...products[0],
    id: String(id ?? "1"),
    name: `Product ${id ?? 1}`,
  };

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inStock = product.stock > 0;

  function addToCart() {
    setAdded(true);
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="mt-3 flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-lg border ${
                    index === activeImage ? "border-teal-700" : "border-slate-200"
                  }`}
                >
                  <img src={image} alt="" className="h-16 w-16 object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="text-left">
            <p className="text-sm font-medium text-teal-700">{product.vendor}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{product.name}</h1>
            <div className="mt-2">
              <StarRating rating={product.rating} />
            </div>
            <p className="mt-4 text-2xl font-semibold text-teal-800">${product.price.toFixed(2)}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>
            <p className={`mt-4 text-sm font-medium ${inStock ? "text-emerald-700" : "text-rose-700"}`}>
              {inStock ? `In stock (${product.stock} available)` : "Out of stock"}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
                <button
                  type="button"
                  className="px-3 py-2 text-slate-700"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  className="px-3 py-2 text-slate-700"
                  onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                disabled={!inStock}
                onClick={addToCart}
                className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-40"
              >
                Add to Cart
              </button>
            </div>
            {added && (
              <p className="mt-3 text-sm text-emerald-700">
                Added {quantity} item{quantity === 1 ? "" : "s"} to cart (demo only).
              </p>
            )}
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">{review.name}</p>
                  <StarRating rating={review.rating} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900">From this store</h2>
          <p className="mt-1 text-sm text-slate-600">More from {product.vendor}.</p>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {fromThisStore.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetails;
