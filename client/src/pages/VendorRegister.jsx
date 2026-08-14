import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function VendorRegister() {
  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">
            Vendors
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Sell on Ashal
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Vendor registration is coming soon. Create a seller account to list products
            across watches, fashion, tech, and more.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Create a buyer account
            </Link>
            <Link
              to="/shop"
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Browse the shop
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default VendorRegister;
