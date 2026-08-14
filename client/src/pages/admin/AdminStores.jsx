import { useEffect, useState } from "react";
import { parseApiError } from "../../api/auth.js";
import { getAdminStores, STORE_STATUSES, updateStoreStatus } from "../../api/admin.js";
import { formatOrderDate, statusStyle } from "../../utils/statusStyles";

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  async function loadStores(nextPage = page) {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminStores({
        page: nextPage,
        search: search.trim() || undefined,
        status: status || undefined,
      });
      setStores(result.items);
      setMeta(result.meta);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    await loadStores(1);
  }

  async function handleStatusChange(storeId, nextStatus) {
    if (!nextStatus) return;
    setUpdatingId(storeId);
    setError("");
    try {
      const updated = await updateStoreStatus(storeId, nextStatus);
      setStores((current) => current.map((store) => (store._id === storeId ? updated : store)));
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function goToPage(nextPage) {
    setPage(nextPage);
    await loadStores(nextPage);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Stores</h1>
      <p className="mt-1 text-sm text-slate-600">Approve, suspend, or reject vendor stores.</p>

      <form onSubmit={handleSearch} className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search store name…"
          className="min-w-56 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-teal-600 focus:ring-2"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-teal-600 focus:ring-2"
        >
          <option value="">All statuses</option>
          {STORE_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-8">
          <div className="h-6 w-full rounded bg-slate-100" />
        </div>
      ) : stores.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-800">No stores found.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Store</th>
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stores.map((store) => (
                  <tr key={store._id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{store.name}</p>
                      <p className="text-xs text-slate-500">{store.slug}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {store.vendorId?.name || "—"}
                      <p className="text-xs text-slate-400">{store.vendorId?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{formatOrderDate(store.createdAt)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(store.status)}`}
                      >
                        {store.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value=""
                        disabled={updatingId === store._id}
                        onChange={(event) => {
                          handleStatusChange(store._id, event.target.value);
                          event.target.value = "";
                        }}
                        className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none ring-teal-600 focus:ring-2 disabled:opacity-60"
                      >
                        <option value="">Change status…</option>
                        {STORE_STATUSES.filter((item) => item !== store.status).map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm">
              <button
                type="button"
                disabled={!meta.hasPrevPage}
                onClick={() => goToPage(page - 1)}
                className="font-medium text-teal-700 disabled:text-slate-400"
              >
                Previous
              </button>
              <span className="text-slate-500">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={!meta.hasNextPage}
                onClick={() => goToPage(page + 1)}
                className="font-medium text-teal-700 disabled:text-slate-400"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminStores;
