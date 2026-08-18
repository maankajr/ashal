import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resetPassword, parseApiError } from "../api/auth.js";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setFormError("Invalid or missing reset link. Please request a new one.");
    }
  }, [token, email]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (formError) setFormError("");
  }

  function validate() {
    const errs = {};
    if (!form.password) errs.password = "New password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (!form.confirm) errs.confirm = "Please confirm your new password.";
    else if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setFormError("");
    try {
      await resetPassword({ email, token, password: form.password });
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error);
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Set a new password</h1>
          <p className="mt-1 text-sm text-slate-600">
            {done ? "Your password has been reset!" : "Choose a strong password for your account."}
          </p>

          {done ? (
            <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              Password reset successfully. Redirecting you to login&hellip;
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6">
              {formError && (
                <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {formError}{" "}
                  {!token && (
                    <Link to="/forgot-password" className="font-medium underline">
                      Request a new link
                    </Link>
                  )}
                </p>
              )}

              <label className="block text-sm font-medium text-slate-800">
                New password
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitting || !token}
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2 disabled:opacity-60"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-700">{errors.password}</p>
                )}
              </label>

              <label className="mt-4 block text-sm font-medium text-slate-800">
                Confirm new password
                <input
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  disabled={submitting || !token}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2 disabled:opacity-60"
                />
                {errors.confirm && (
                  <p className="mt-1 text-xs text-rose-700">{errors.confirm}</p>
                )}
              </label>

              <button
                type="submit"
                disabled={submitting || !token}
                className="mt-5 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving\u2026" : "Reset password"}
              </button>

              <p className="mt-4 text-center text-sm text-slate-600">
                <Link to="/login" className="font-medium text-teal-700 hover:text-teal-800">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default ResetPassword;
