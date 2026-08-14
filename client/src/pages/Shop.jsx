import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

const products = [
  {
    id: 1,
    name: "Apex Smartwatch Pro",
    price: 189.0,
    rating: 4.8,
    category: "Watches",
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Velocity Running Sneakers",
    price: 129.99,
    rating: 4.7,
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Pulse Wireless Earbuds",
    price: 79.5,
    rating: 4.6,
    category: "Earbuds",
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 4,
    name: "NovaBook Ultralight Laptop",
    price: 999.0,
    rating: 4.9,
    category: "Laptops",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 5,
    name: "ClearVue Aviator Glasses",
    price: 89.0,
    rating: 4.5,
    category: "Glasses",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 6,
    name: "IronCore Adjustable Dumbbells",
    price: 149.0,
    rating: 4.4,
    category: "Gym Equipment",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 7,
    name: "PixelMax Pro Phone",
    price: 749.0,
    rating: 4.7,
    category: "Phones",
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 8,
    name: "SlateTab 11-inch Tablet",
    price: 429.0,
    rating: 4.6,
    category: "Tablets",
    image:
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 9,
    name: "Cityline Classic Sedan",
    price: 18500.0,
    rating: 4.3,
    category: "Cars",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 10,
    name: "Urban Linen Overshirt",
    price: 68.0,
    rating: 4.2,
    category: "Fashion & Clothes",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 11,
    name: "Chrono Steel Dress Watch",
    price: 245.0,
    rating: 4.8,
    category: "Watches",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 12,
    name: "TrailFlex Training Shoes",
    price: 110.0,
    rating: 4.5,
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80",
  },
];

const categories = [
  "Watches",
  "Cars",
  "Fashion & Clothes",
  "Phones",
  "Laptops",
  "Glasses",
  "Earbuds",
  "Gym Equipment",
  "Shoes",
  "Tablets",
];

const pageSize = 8;
const maxPriceLimit = 20000;

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [selectedCategories, setSelectedCategories] = useState(() =>
    categoryFromUrl && categories.includes(categoryFromUrl) ? [categoryFromUrl] : []
  );
  const [maxPrice, setMaxPrice] = useState(maxPriceLimit);
  const [minRating, setMinRating] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (categoryFromUrl && categories.includes(categoryFromUrl)) {
      setSelectedCategories([categoryFromUrl]);
      setPage(1);
    }
  }, [categoryFromUrl]);

  function toggleCategory(category) {
    setSelectedCategories((current) => {
      const next = current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category];

      if (next.length === 1) {
        setSearchParams({ category: next[0] });
      } else {
        setSearchParams({});
      }

      return next;
    });
    setPage(1);
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const next = products.filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice = product.price <= maxPrice;
      const matchesRating = product.rating >= minRating;
      const matchesSearch = product.name.toLowerCase().includes(query);
      return matchesCategory && matchesPrice && matchesRating && matchesSearch;
    });

    next.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return b.id - a.id;
    });

    return next;
  }, [selectedCategories, maxPrice, minRating, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <h1 className="text-lg font-bold text-slate-900">Filters</h1>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-slate-800">Category</legend>
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
              {categories.map((category) => (
                <label key={category} className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                  />
                  {category}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-6 block">
            <span className="text-sm font-semibold text-slate-800">Price range</span>
            <input
              type="range"
              min="50"
              max={maxPriceLimit}
              step="50"
              value={maxPrice}
              onChange={(event) => {
                setMaxPrice(Number(event.target.value));
                setPage(1);
              }}
              className="mt-3 w-full accent-teal-700"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Up to ${maxPrice.toLocaleString()}
            </span>
          </label>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-slate-800">Rating</legend>
            <div className="mt-3 space-y-2">
              {[0, 4, 4.5].map((value) => (
                <label key={value} className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === value}
                    onChange={() => {
                      setMinRating(value);
                      setPage(1);
                    }}
                    className="border-slate-300 text-teal-700 focus:ring-teal-600"
                  />
                  {value === 0 ? "Any rating" : `${value}+ stars`}
                </label>
              ))}
            </div>
          </fieldset>
        </aside>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Shop</h2>
            <p className="mt-1 text-sm text-slate-600">
              Explore watches, tech, fashion, cars, and more from Ashal vendors.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search products"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2"
            />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none ring-teal-600 focus:ring-2"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
          </p>

          {visible.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              No products match those filters.
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`h-9 w-9 rounded-lg text-sm font-medium ${
                  pageNumber === currentPage
                    ? "bg-teal-700 text-white"
                    : "border border-slate-300 bg-white text-slate-700"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Shop;
