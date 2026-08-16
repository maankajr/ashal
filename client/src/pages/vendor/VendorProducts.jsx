import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { parseApiError } from "../../api/auth.js";
import { deleteProduct, getVendorProducts } from "../../api/vendor.js";

function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const data = await getVendorProducts();
      setProducts(data);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.categoryId?.name?.toLowerCase().includes(query)
    );
  }, [products, search]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((current) => current.filter((product) => product._id !== id));
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your catalog.</p>
        </div>
        <Link
          to="/vendor/products/new"
          className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Add Product
        </Link>
      </div>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search products…"
        className="mt-6 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-teal-600 focus:ring-2"
      />

      {error && (
        error.toLowerCase().includes("store") ? (
          <div className="mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Store Setup Required</h2>
            <p className="mt-1 text-sm text-slate-600">
              Please create your store profile first before managing products.
            </p>
            <Link
              to="/vendor/store"
              className="mt-4 inline-flex items-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Set up your store →
            </Link>
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )
      )}

      {loading ? (
        <div className="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-8">
          <div className="h-6 w-full rounded bg-slate-100" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-800">No products yet.</p>
          <Link
            to="/vendor/products/new"
            className="mt-4 inline-block text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            Add your first product →
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((product) => (
                  <tr key={product._id}>
                    <td className="px-5 py-3 font-medium text-slate-900">{product.name}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {product.categoryId?.name || "—"}
                    </td>
                    <td className="px-5 py-3 text-teal-800">${Number(product.price).toFixed(2)}</td>
                    <td className="px-5 py-3 text-slate-600">{product.stock}</td>
                    <td className="px-5 py-3 capitalize text-slate-600">{product.status}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
                        <Link
                          to={`/vendor/products/${product._id}/edit`}
                          className="font-medium text-teal-700 hover:text-teal-800"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === product._id}
                          onClick={() => handleDelete(product._id)}
                          className="font-medium text-rose-700 hover:text-rose-800 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorProducts;
