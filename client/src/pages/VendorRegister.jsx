import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { parseApiError } from "../api/auth.js";
import { useAuth } from "../store/AuthContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function VendorRegister() {
  const navigate = useNavigate();
  const { registerVendor } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    storeName: "",
    storeDescription: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
    if (formError) setFormError("");
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!emailPattern.test(form.email.trim())) nextErrors.email = "Enter a valid email.";
    if (!form.password) nextErrors.password = "Password is required.";
    else if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    if (!form.storeName.trim()) nextErrors.storeName = "Store name is required.";
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await registerVendor({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        storeName: form.storeName.trim(),
        storeDescription: form.storeDescription.trim(),
      });
      navigate("/vendor/dashboard", { replace: true });
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error);
      setErrors((current) => ({ ...current, ...fieldErrors }));
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Vendors</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Sell on Ashal</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Register as a vendor to list products and manage orders. Your store is created
            automatically during signup.
          </p>

          {formError && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {formError}
            </p>
          )}

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-800">
              Your name
              <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2" />
              {errors.name && <p className="mt-1 text-xs text-rose-700">{errors.name}</p>}
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2" />
              {errors.email && <p className="mt-1 text-xs text-rose-700">{errors.email}</p>}
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Phone (optional)
              <input name="phone" value={form.phone} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2" />
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Password
              <input type="password" name="password" value={form.password} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2" />
              {errors.password && <p className="mt-1 text-xs text-rose-700">{errors.password}</p>}
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Confirm password
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-rose-700">{errors.confirmPassword}</p>}
            </label>
            <hr className="border-slate-200" />
            <label className="block text-sm font-medium text-slate-800">
              Store name
              <input name="storeName" value={form.storeName} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2" />
              {errors.storeName && <p className="mt-1 text-xs text-rose-700">{errors.storeName}</p>}
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Store description
              <textarea name="storeDescription" value={form.storeDescription} onChange={handleChange} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2" />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Register as vendor"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-teal-700 hover:text-teal-800">
              Login
            </Link>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default VendorRegister;
