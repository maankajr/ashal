import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard, { StarRating } from "../components/ProductCard";
import { parseApiError } from "../api/auth.js";
import { getProduct, listProducts, mapProductForCard } from "../api/products.js";
import {
  createReview,
  deleteReview,
  getReviewEligibility,
  listProductReviews,
  updateReview,
} from "../api/reviews.js";
import { useAuth } from "../store/AuthContext";
import { useCart } from "../store/CartContext";
import { useWishlist } from "../store/WishlistContext";

function formatReviewDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, authReady, user } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState("");
  const [cartBusy, setCartBusy] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [editingId, setEditingId] = useState(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const productKey = product?.slug || id;

  async function loadReviews(slugOrId) {
    setReviewsLoading(true);
    try {
      const result = await listProductReviews(slugOrId, { limit: 50 });
      setReviews(result.items || []);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  async function loadEligibility(slugOrId) {
    if (!isAuthenticated || user?.role !== "customer") {
      setEligibility(null);
      return;
    }

    try {
      const result = await getReviewEligibility(slugOrId);
      setEligibility(result);
      if (result.existingReview) {
        setEditingId(result.existingReview._id);
        setReviewForm({
          rating: result.existingReview.rating,
          comment: result.existingReview.comment || "",
        });
      } else {
        setEditingId(null);
        setReviewForm({ rating: 5, comment: "" });
      }
    } catch {
      setEligibility(null);
    }
  }

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

        await loadReviews(mapped.slug || id);
      } catch {
        if (!cancelled) {
          setProduct(null);
          setRelatedProducts([]);
          setReviews([]);
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
    if (!authReady || !productKey) return;
    loadEligibility(productKey);
  }, [authReady, isAuthenticated, user?.role, productKey]);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setAdded(false);
    setCartError("");
    setReviewError("");
    setReviewSuccess("");
  }, [id]);

  const images = useMemo(() => {
    if (!product?.image) return [];
    return [
      product.image,
      product.image.replace("w=600&h=600", "w=800&h=800"),
      product.image.includes("?") ? `${product.image}&sat=-20` : product.image,
    ];
  }, [product]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return product?.rating || 0;
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews, product?.rating]);

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
  const canShowForm =
    isAuthenticated &&
    user?.role === "customer" &&
    eligibility &&
    (eligibility.canReview || eligibility.existingReview);

  async function handleWishlistToggle() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.role === "vendor") {
      return;
    }
    try {
      await toggleItem(product.id);
    } catch {
      // Heart state updates only on success
    }
  }

  async function addToCart() {
    setCartError("");
    setCartBusy(true);
    try {
      await addItem(product, quantity);
      setAdded(true);
    } catch (error) {
      setAdded(false);
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

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    setReviewBusy(true);

    try {
      if (editingId) {
        await updateReview(editingId, {
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment.trim(),
        });
        setReviewSuccess("Your review was updated.");
      } else {
        await createReview(productKey, {
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment.trim(),
        });
        setReviewSuccess("Thanks — your review was posted.");
      }

      await Promise.all([loadReviews(productKey), loadEligibility(productKey)]);

      const fresh = await getProduct(productKey);
      setProduct(mapProductForCard(fresh));
    } catch (error) {
      setReviewError(parseApiError(error).message || "Could not save review.");
    } finally {
      setReviewBusy(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    setReviewError("");
    setReviewSuccess("");
    setReviewBusy(true);
    try {
      await deleteReview(reviewId);
      setReviewSuccess("Your review was deleted.");
      setEditingId(null);
      setReviewForm({ rating: 5, comment: "" });
      await Promise.all([loadReviews(productKey), loadEligibility(productKey)]);
      const fresh = await getProduct(productKey);
      setProduct(mapProductForCard(fresh));
    } catch (error) {
      setReviewError(parseApiError(error).message || "Could not delete review.");
    } finally {
      setReviewBusy(false);
    }
  }

  function startEdit(review) {
    setEditingId(review._id);
    setReviewForm({
      rating: review.rating,
      comment: review.comment || "",
    });
    setReviewError("");
    setReviewSuccess("");
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
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={averageRating} />
              <span className="text-xs text-slate-500">
                {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-teal-800">
              ${Number(product.price || 0).toFixed(2)}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>
            <p
              className={`mt-4 text-sm font-medium ${
                inStock ? "text-emerald-700" : "text-rose-700"
              }`}
            >
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
                disabled={!inStock || cartBusy}
                onClick={addToCart}
                className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-40"
              >
                {cartBusy ? "Adding…" : "Add to Cart"}
              </button>
            </div>
            {cartError && <p className="mt-3 text-sm text-rose-700">{cartError}</p>}
            {added && !cartError && (
              <p className="mt-3 text-sm text-emerald-700">
                Added {quantity} item{quantity === 1 ? "" : "s"} to cart.
              </p>
            )}
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
          <p className="mt-1 text-sm text-slate-600">
            Verified buyers can leave a review after their order is delivered.
          </p>

          {canShowForm && (
            <form
              onSubmit={handleReviewSubmit}
              className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {editingId ? "Edit your review" : "Write a review"}
              </h3>
              <label className="mt-4 block text-sm font-medium text-slate-800">
                Rating
                <select
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((current) => ({
                      ...current,
                      rating: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} star{value === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-3 block text-sm font-medium text-slate-800">
                Comment
                <textarea
                  value={reviewForm.comment}
                  onChange={(event) =>
                    setReviewForm((current) => ({
                      ...current,
                      comment: event.target.value,
                    }))
                  }
                  rows={4}
                  minLength={5}
                  maxLength={1000}
                  required
                  placeholder="Share what you liked or what could be better (min 5 characters)"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                />
              </label>
              {reviewError && <p className="mt-3 text-sm text-rose-700">{reviewError}</p>}
              {reviewSuccess && <p className="mt-3 text-sm text-emerald-700">{reviewSuccess}</p>}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={reviewBusy}
                  className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {reviewBusy ? "Saving…" : editingId ? "Update review" : "Submit review"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    disabled={reviewBusy}
                    onClick={() => handleDeleteReview(editingId)}
                    className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          )}

          {isAuthenticated &&
            user?.role === "customer" &&
            eligibility &&
            !eligibility.hasPurchased && (
              <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Buy and receive this product to leave a review.
              </p>
            )}

          {!isAuthenticated && (
            <p className="mt-4 text-sm text-slate-600">
              <Link to="/login" className="font-medium text-teal-700 hover:text-teal-800">
                Sign in
              </Link>{" "}
              as a customer who received this product to write a review.
            </p>
          )}

          <div className="mt-6 space-y-4">
            {reviewsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-200" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                No reviews yet. Be the first after your order is delivered.
              </p>
            ) : (
              reviews.map((review) => (
                <article
                  key={review._id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {review.user?.name || "Customer"}
                      </p>
                      <p className="text-xs text-slate-500">{formatReviewDate(review.createdAt)}</p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
                  {review.isOwner && (
                    <button
                      type="button"
                      onClick={() => startEdit(review)}
                      className="mt-3 text-xs font-medium text-teal-700 hover:text-teal-800"
                    >
                      Edit your review
                    </button>
                  )}
                </article>
              ))
            )}
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
