import { useEffect, useState } from "react";
import { parseApiError } from "../../api/auth.js";
import { createStore, getMyStore, updateStore } from "../../api/vendor.js";

function StoreSettings() {
  const [store, setStore] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getMyStore();
        if (cancelled) return;
        setStore(data);
        if (data) {
          setForm({
            name: data.name || "",
            description: data.description || "",
            contactEmail: data.contactEmail || "",
            contactPhone: data.contactPhone || "",
          });
        }
      } catch (err) {
        if (!cancelled) setError(parseApiError(err).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSaved(false);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSaved(false);

    try {
      const result = store
        ? await updateStore(form)
        : await createStore(form);
      setStore(result);
      setSaved(true);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-8">
        <div className="h-8 w-48 rounded bg-slate-200" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Store Settings
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        {store
          ? "Update your store profile and contact information."
          : "Create your store to start listing products."}
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-800">
            Store name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Contact email
            <input
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
            />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Contact phone
            <input
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
            />
          </label>
        </div>

        {store && (
          <p className="mt-4 text-xs text-slate-500">
            Store URL slug: <span className="font-medium">{store.slug}</span> · Status:{" "}
            <span className="capitalize">{store.status}</span>
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {submitting ? "Saving…" : store ? "Save changes" : "Create store"}
          </button>
          {saved && <p className="text-sm text-emerald-700">Store saved successfully.</p>}
        </div>
      </form>
    </div>
  );
}

export default StoreSettings;
