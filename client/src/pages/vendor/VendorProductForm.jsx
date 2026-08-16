import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { parseApiError } from "../../api/auth.js";
import { listCategories } from "../../api/categories.js";
import {
  createProduct,
  getVendorProduct,
  updateProduct,
  uploadProductImages,
} from "../../api/vendor.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are allowed.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Each image must be 5MB or smaller.";
  }
  return "";
}

function VendorProductForm({ productId, mode = "create" }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEdit = mode === "edit";

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit || !productId) return;

    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      try {
        const product = await getVendorProduct(productId);
        if (cancelled) return;
        setForm({
          name: product.name || "",
          description: product.description || "",
          price: String(product.price ?? ""),
          stock: String(product.stock ?? ""),
          categoryId: product.categoryId?._id || product.categoryId || "",
        });
        if (product.images?.[0]?.url) {
          setPhotoPreview(product.images[0].url);
        }
        setPhotoFile(null);
      } catch (err) {
        if (!cancelled) setError(parseApiError(err).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [isEdit, productId]);

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function handlePhotoSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId,
    };

    try {
      let product;
      if (isEdit) {
        product = await updateProduct(productId, payload);
      } else {
        product = await createProduct(payload);
      }

      if (photoFile) {
        await uploadProductImages(product._id, [photoFile], { replace: isEdit });
      }

      navigate("/vendor/products");
    } catch (err) {
      const parsed = parseApiError(err);
      const detailMessage = Object.values(parsed.fieldErrors || {})[0];
      setError(detailMessage || parsed.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="mt-6 space-y-4">
          <div className="h-10 rounded bg-slate-100" />
          <div className="h-24 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/vendor/products"
        className="text-sm font-medium text-teal-700 hover:text-teal-800"
      >
        ← Back to products
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {isEdit ? "Edit product" : "Add product"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[160px_1fr]">
          <div className="flex flex-col items-center gap-3">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt=""
                className="h-32 w-32 rounded-xl object-cover ring-2 ring-teal-100"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-teal-50 text-2xl font-semibold text-teal-800">
                +
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {photoPreview ? "Change image" : "Upload image"}
            </button>
            <p className="max-w-[10rem] text-center text-[11px] leading-snug text-slate-500">
              JPEG, PNG, WebP, or GIF. Max 5MB.
            </p>
            {photoFile && (
              <p className="max-w-[10rem] truncate text-center text-[11px] text-teal-700">
                {photoFile.name}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-800">
              Name
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
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-800">
                Price ($)
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                />
              </label>
              <label className="block text-sm font-medium text-slate-800">
                Stock
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-800">
              Category
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
          <Link
            to="/vendor/products"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default VendorProductForm;
