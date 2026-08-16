import { useEffect, useState } from "react";
import { parseApiError } from "../../api/auth.js";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "../../api/admin.js";
import Modal from "../../components/Modal";

const emptyForm = {
  name: "",
  parentId: "",
  imageUrl: "",
};

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadCategories(nextPage = page) {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminCategories({
        page: nextPage,
        search: search.trim() || undefined,
        limit: 50,
      });
      setCategories(result.items);
      setMeta(result.meta);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    await loadCategories(1);
  }

  function openCreateModal() {
    setEditingCategory(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setForm({
      name: category.name || "",
      parentId: category.parentId?._id || category.parentId || "",
      imageUrl: category.imageUrl || "",
    });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
    setFormError("");
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");

    const payload = {
      name: form.name.trim(),
      parentId: form.parentId || null,
      imageUrl: form.imageUrl.trim(),
    };

    try {
      if (editingCategory) {
        await updateAdminCategory(editingCategory._id, payload);
      } else {
        await createAdminCategory(payload);
      }
      closeModal();
      await loadCategories(page);
    } catch (err) {
      const parsed = parseApiError(err);
      const detail = Object.values(parsed.fieldErrors || {})[0];
      setFormError(detail || parsed.message || "Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      return;
    }

    setDeletingId(category._id);
    setError("");

    try {
      await deleteAdminCategory(category._id);
      await loadCategories(page);
    } catch (err) {
      const parsed = parseApiError(err);
      const detail = Object.values(parsed.fieldErrors || {})[0];
      setError(detail || parsed.message || "Cannot delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  // Categories eligible to be parents (exclude the one being edited to avoid circular trees)
  const eligibleParents = categories.filter(
    (c) => !editingCategory || String(c._id) !== String(editingCategory._id)
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage marketplace departments, hierarchy, and taxonomy.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          + Add Category
        </button>
      </div>

      <form onSubmit={handleSearch} className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search category name or slug…"
          className="min-w-56 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none ring-teal-600 focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-rose-500 hover:text-rose-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-8">
          <div className="h-6 w-full rounded bg-slate-100" />
        </div>
      ) : categories.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-800">No categories found.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-3 text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            Create your first category →
          </button>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Parent Category</th>
                  <th className="px-5 py-3">Products</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-800">
                            {category.name?.charAt(0) || "C"}
                          </div>
                        )}
                        <span className="font-semibold text-slate-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{category.slug}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {category.parentId?.name ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {category.parentId.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Root Category</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          category.productCount > 0
                            ? "bg-teal-50 text-teal-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {category.productCount}{" "}
                        {category.productCount === 1 ? "Product" : "Products"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(category)}
                          className="font-medium text-teal-700 hover:text-teal-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === category._id}
                          onClick={() => handleDelete(category)}
                          className="font-medium text-rose-700 hover:text-rose-800 disabled:opacity-50"
                        >
                          {deletingId === category._id ? "Deleting…" : "Delete"}
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

      {/* Create / Edit Category Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingCategory ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {formError}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Category Name *
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Electronics, Smart Home, Running Shoes"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Parent Category (Optional)
              <select
                value={form.parentId}
                onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
              >
                <option value="">None (Top-Level Root Category)</option>
                {eligibleParents.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Select a parent category if this is a subcategory.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Image URL (Optional)
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {submitting ? "Saving…" : editingCategory ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminCategories;
