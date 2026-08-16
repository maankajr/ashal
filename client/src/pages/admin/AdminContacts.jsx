import { useEffect, useState } from "react";
import { parseApiError } from "../../api/auth.js";
import {
  CONTACT_STATUSES,
  getAdminContacts,
  updateContactStatus,
} from "../../api/admin.js";
import { formatOrderDate } from "../../utils/statusStyles";

function statusBadgeClass(status) {
  if (status === "new") return "bg-amber-50 text-amber-800 ring-amber-200";
  if (status === "read") return "bg-sky-50 text-sky-800 ring-sky-200";
  if (status === "resolved") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("new");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [selected, setSelected] = useState(null);

  async function loadContacts(nextPage = page) {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminContacts({
        page: nextPage,
        search: search.trim() || undefined,
        status: status || undefined,
      });
      setContacts(result.items);
      setMeta(result.meta);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    await loadContacts(1);
  }

  async function handleStatusChange(contactId, nextStatus) {
    setUpdatingId(contactId);
    setError("");
    try {
      const updated = await updateContactStatus(contactId, nextStatus);
      setContacts((current) => {
        if (status && updated.status !== status) {
          return current.filter((item) => item._id !== contactId);
        }
        return current.map((item) => (item._id === contactId ? updated : item));
      });
      setSelected((current) => {
        if (!current || current._id !== contactId) return current;
        if (status && updated.status !== status) return null;
        return updated;
      });
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function openMessage(contact) {
    setSelected(contact);
    if (contact.status === "new") {
      await handleStatusChange(contact._id, "read");
    }
  }

  async function goToPage(nextPage) {
    setPage(nextPage);
    await loadContacts(nextPage);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Contact messages
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Review submissions from the public contact form.
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, subject…"
          className="min-w-56 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-teal-600 focus:ring-2"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-teal-600 focus:ring-2"
        >
          <option value="">All statuses</option>
          {CONTACT_STATUSES.map((item) => (
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="animate-pulse space-y-3 p-6">
              <div className="h-10 rounded bg-slate-100" />
              <div className="h-10 rounded bg-slate-100" />
              <div className="h-10 rounded bg-slate-100" />
            </div>
          ) : contacts.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">No contact messages found.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {contacts.map((contact) => (
                <li key={contact._id}>
                  <button
                    type="button"
                    onClick={() => openMessage(contact)}
                    className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      selected?._id === contact._id ? "bg-teal-50/60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {contact.subject}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {contact.name} · {contact.email}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${statusBadgeClass(
                          contact.status
                        )}`}
                      >
                        {contact.status}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-xs text-slate-500">
                      {formatOrderDate(contact.createdAt)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 p-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500">
                Page {page} of {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => goToPage(page + 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {!selected ? (
            <p className="text-sm text-slate-500">Select a message to read it.</p>
          ) : (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selected.subject}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    From {selected.name} &lt;{selected.email}&gt;
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatOrderDate(selected.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadgeClass(
                    selected.status
                  )}`}
                >
                  {selected.status}
                </span>
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {selected.message}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {CONTACT_STATUSES.map((nextStatus) => (
                  <button
                    key={nextStatus}
                    type="button"
                    disabled={updatingId === selected._id || selected.status === nextStatus}
                    onClick={() => handleStatusChange(selected._id, nextStatus)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold capitalize text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Mark {nextStatus}
                  </button>
                ))}
                <a
                  href={`mailto:${selected.email}?subject=Re:%20${encodeURIComponent(
                    selected.subject
                  )}`}
                  className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
                >
                  Reply by email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminContacts;
