import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { forgotPassword, parseApiError } from "../api/auth.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
    if (formError) setFormError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setEmailError("Email is required."); return; }
    if (!emailPattern.test(email.trim())) { setEmailError("Enter a valid email address."); return; }

    setSubmitting(true);
    setFormError("");
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (error) {
      const { message } = parseApiError(error);
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
          <h1 className="text-2xl font-semibold text-slate-900">Forgot password?</h1>
          <p className="mt-1 text-sm text-slate-600">
            {submitted
              ? "Check your inbox for the reset link."
              : "Enter your email and we\u2019ll send you a reset link."}
          </p>

          {submitted ? (
            <>
              <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                If <strong>{email}</strong> is registered, you will receive an email shortly.
                Check your spam folder if you don&apos;t see it.
              </div>
              <p className="mt-6 text-center text-sm text-slate-600">
                <Link to="/login" className="font-medium text-teal-700 hover:text-teal-800">
                  Back to login
                </Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6">
              {formError && (
                <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {formError}
                </p>
              )}

              <label className="block text-sm font-medium text-slate-800">
                Email address
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  disabled={submitting}
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2 disabled:opacity-60"
                />
                {emailError && (
                  <p className="mt-1 text-xs text-rose-700">{emailError}</p>
                )}
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending\u2026" : "Send reset link"}
              </button>

              <p className="mt-4 text-center text-sm text-slate-600">
                Remember your password?{" "}
                <Link to="/login" className="font-medium text-teal-700 hover:text-teal-800">
                  Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;
