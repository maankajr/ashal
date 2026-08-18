import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { parseApiError } from "../api/auth.js";
import { useAuth } from "../store/AuthContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
    if (formError) setFormError("");
  }

  function validate() {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!emailPattern.test(form.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!form.password) nextErrors.password = "Password is required.";
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await login({
        email: form.email.trim(),
        password: form.password,
      });
      if (result.user?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (result.user?.role === "vendor") {
        navigate("/vendor/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
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
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
          <p className="mt-1 text-sm text-slate-600">Welcome back to Ashal.</p>

          {formError && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {formError}
            </p>
          )}

          <label className="mt-6 block text-sm font-medium text-slate-800">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2 disabled:opacity-60"
            />
            {errors.email && <p className="mt-1 text-xs text-rose-700">{errors.email}</p>}
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-800">
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              disabled={submitting}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2 disabled:opacity-60"
            />
            {errors.password && <p className="mt-1 text-xs text-rose-700">{errors.password}</p>}
          </label>

          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm text-teal-700 hover:text-teal-800">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Login"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-teal-700 hover:text-teal-800">
              Register
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default Login;
