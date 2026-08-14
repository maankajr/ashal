import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard, { StarRating } from "../components/ProductCard";
import { getProductsByStore } from "../data/products";

const stores = {
  techvault: {
    name: "TechVault",
    rating: 4.8,
    description:
      "Phones, laptops, earbuds, and everyday gadgets from trusted electronics vendors.",
    banner:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&h=400&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop&q=80",
  },
  "stride-co": {
    name: "Stride & Co.",
    rating: 4.6,
    description: "Footwear, fashion, and accessories built for daily wear.",
    banner:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=400&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop&q=80",
  },
};

function StoreDetails() {
  const { storeId } = useParams();
  const store = stores[storeId] ?? stores.techvault;
  const resolvedStoreId = stores[storeId] ? storeId : "techvault";
  const storeProducts = getProductsByStore(resolvedStoreId);

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <section className="relative isolate overflow-hidden">
          <img src={store.banner} alt="" className="h-48 w-full object-cover sm:h-64" />
          <div className="absolute inset-0 bg-slate-950/35" />
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end">
            <img
              src={store.logo}
              alt=""
              className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-md"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{store.name}</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">{store.description}</p>
              <div className="mt-2">
                <StarRating rating={store.rating} />
              </div>
            </div>
          </div>

          <section className="py-10">
            <h2 className="text-xl font-semibold text-slate-900">From this store</h2>
            <p className="mt-1 text-sm text-slate-600">Popular products sold by {store.name}.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {storeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default StoreDetails;
