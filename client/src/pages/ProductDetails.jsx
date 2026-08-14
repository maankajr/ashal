import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard, { StarRating } from "../components/ProductCard";
import { getProduct, listProducts, mapProductForCard } from "../api/products.js";
import { useAuth } from "../store/AuthContext";
import { useCart } from "../store/CartContext";
import { useWishlist } from "../store/WishlistContext";

const reviews = [
  {
    id: 1,
    name: "Amina K.",
    rating: 5,
    comment: "Beautiful quality and arrived well packed. I use it every day.",
  },
  {
    id: 2,
    name: "Jamal R.",
    rating: 4,
    comment: "Looks even better in person. Shipping took a couple of extra days.",
  },
  {
    id: 3,
    name: "Sara M.",
    rating: 5,
    comment: "Gifted this and it was a hit. Would buy from this store again.",
  },
];

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      try {
        const data = await getProduct(id);
        if (cancelled) return;
        const mapped = mapProductForCard(data);
        setProduct(mapped);

        const related = await listProducts({ limit: 12 });
        if (cancelled) return;
        const storeId = data.storeId?._id || data.storeId;
        setRelatedProducts(
          related.items
            .map(mapProductForCard)
            .filter(
              (item) =>
                String(item.id) !== String(mapped.id) &&
                String(item.storeId) === String(storeId || data.storeId?.slug)
            )
            .slice(0, 4)
        );
      } catch {
        if (!cancelled) {
          setProduct(null);
          setRelatedProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setAdded(false);
  }, [id]);

  const images = useMemo(() => {
    if (!product?.image) return [];
    return [
      product.image,
      product.image.replace("w=600&h=600", "w=800&h=800"),
      product.image.includes("?") ? `${product.image}&sat=-20` : product.image,
    ];
  }, [product]);

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col bg-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid animate-pulse gap-8 lg:grid-cols-2">
            <div className="aspect-square rounded-xl bg-slate-200" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 rounded bg-slate-200" />
              <div className="h-6 w-1/3 rounded bg-slate-100" />
              <div className="h-24 rounded bg-slate-100" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-svh flex-col bg-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 text-center">
          <p className="text-lg font-semibold text-slate-800">Product not found.</p>
          <Link to="/shop" className="mt-4 inline-block text-teal-700 hover:text-teal-800">
            Back to shop
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const inStock = product.stock > 0;
  const saved = isInWishlist(product.id);

  async function handleWishlistToggle() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await toggleItem(product.id);
  }

  function addToCart() {
    addItem(product, quantity);
    setAdded(true);
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <img
                src={images[activeImage] || product.image}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="mt-3 flex gap-2">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
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
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium text-teal-700">{product.storeName}</p>
              {product.storeId && (
                <Link
                  to={`/store/${product.storeId}`}
                  className="text-sm font-semibold text-slate-700 underline-offset-2 hover:text-teal-700 hover:underline"
                >
                  Visit Store
                </Link>
              )}
            </div>
            <div className="mt-1 flex items-start justify-between gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {product.name}
              </h1>
              <button
                type="button"
                onClick={handleWishlistToggle}
                className="rounded-full border border-slate-200 bg-white p-2.5 shadow-sm hover:bg-slate-50"
                aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Heart
                  className={`h-5 w-5 ${saved ? "fill-rose-600 text-rose-600" : "text-slate-500"}`}
                />
              </button>
            </div>
            <div className="mt-2">
              <StarRating rating={product.rating} />
            </div>
            <p className="mt-4 text-2xl font-semibold text-teal-800">
              ${product.price.toFixed(2)}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>
            <p
              className={`mt-4 text-sm font-medium ${
                inStock ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {inStock
                ? `In stock (${product.stock} available)`
                : "Out of stock"}
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
                  onClick={() =>
                    setQuantity((value) => Math.min(product.stock, value + 1))
                  }
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
                Added {quantity} item{quantity === 1 ? "" : "s"} to cart.
              </p>
            )}
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">{review.name}</p>
                  <StarRating rating={review.rating} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
              </article>
            ))}
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-slate-900">From this store</h2>
            <p className="mt-1 text-sm text-slate-600">More from {product.storeName}.</p>
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} showWishlist />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetails;
