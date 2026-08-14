import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

const categories = [
  {
    name: "Watches",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Cars",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Fashion & Clothes",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Phones",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Laptops",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Glasses",
    image:
      "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Earbuds",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Gym Equipment",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Tablets",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop&q=80",
  },
];

const featuredProducts = [
  {
    id: 1,
    name: "Apex Smartwatch Pro",
    price: 189.0,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Velocity Running Sneakers",
    price: 129.99,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Pulse Wireless Earbuds",
    price: 79.5,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 5,
    name: "ClearVue Aviator Glasses",
    price: 89.0,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 4,
    name: "NovaBook Ultralight Laptop",
    price: 999.0,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 10,
    name: "Urban Linen Overshirt",
    price: 68.0,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 7,
    name: "PixelMax Pro Phone",
    price: 749.0,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop&q=80",
  },
  {
    id: 6,
    name: "IronCore Adjustable Dumbbells",
    price: 149.0,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=600&fit=crop&q=80",
  },
];

function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <section className="relative isolate overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-teal-950/80 to-slate-900/50" />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">
              Ashal Marketplace
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Shop smarter across trusted vendors
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
              Discover watches, fashion, tech, cars, and more — curated from sellers you can count on.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/30 transition hover:bg-teal-800"
              >
                Shop Now
              </Link>
              <Link
                to="/vendor/register"
                className="rounded-lg border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                Sell on Ashal
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Shop by category
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Browse popular departments and find what you need faster.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/shop?category=${encodeURIComponent(category.name)}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-3 py-3 sm:hidden">
                    <p className="text-sm font-semibold text-white">{category.name}</p>
                  </div>
                </div>
                <div className="hidden border-t border-slate-100 px-3 py-3 text-center sm:block">
                  <p className="text-sm font-semibold text-slate-800 transition group-hover:text-teal-700">
                    {category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Featured Products
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                  Popular picks this week — smartwatches, sneakers, earbuds, and more.
                </p>
              </div>
              <Link
                to="/shop"
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
