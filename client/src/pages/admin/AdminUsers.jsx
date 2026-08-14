import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { parseApiError } from "../../api/auth.js";
import { getAdminUsers, updateUserStatus, USER_ROLES, USER_STATUSES } from "../../api/admin.js";
import { formatOrderDate, statusStyle } from "../../utils/statusStyles";

function AdminUsers() {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(searchParams.get("role") || "");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  async function loadUsers(nextPage = page) {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminUsers({
        page: nextPage,
        search: search.trim() || undefined,
        role: role || undefined,
        status: status || undefined,
      });
      setUsers(result.items);
      setMeta(result.meta);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, status]);

  async function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    await loadUsers(1);
  }

  async function handleStatusChange(userId, nextStatus) {
    setUpdatingId(userId);
    setError("");
    try {
      const updated = await updateUserStatus(userId, nextStatus);
      setUsers((current) => current.map((user) => (user._id === userId ? updated : user)));
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function goToPage(nextPage) {
    setPage(nextPage);
    await loadUsers(nextPage);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Users</h1>
      <p className="mt-1 text-sm text-slate-600">Search, filter, and disable accounts.</p>

      <form onSubmit={handleSearch} className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or email…"
          className="min-w-56 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-teal-600 focus:ring-2"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-teal-600 focus:ring-2"
        >
          <option value="">All roles</option>
          {USER_ROLES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-teal-600 focus:ring-2"
        >
          <option value="">All statuses</option>
          {USER_STATUSES.map((item) => (
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
      ) : users.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-800">No users found.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-5 py-3 capitalize text-slate-600">{user.role}</td>
                    <td className="px-5 py-3 text-slate-600">{formatOrderDate(user.createdAt)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(user.status)}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {user.role === "admin" ? (
                        <span className="text-xs text-slate-400">Protected</span>
                      ) : (
                        <button
                          type="button"
                          disabled={updatingId === user._id}
                          onClick={() =>
                            handleStatusChange(
                              user._id,
                              user.status === "active" ? "disabled" : "active"
                            )
                          }
                          className="font-medium text-teal-700 hover:text-teal-800 disabled:opacity-60"
                        >
                          {user.status === "active" ? "Disable" : "Enable"}
                        </button>
                      )}
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

export default AdminUsers;
