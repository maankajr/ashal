import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { parseApiError } from "../api/auth.js";
import { submitContact } from "../api/contact.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "", // honeypot — must stay empty
};

function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
    if (formError) setFormError("");
    if (success) setSuccess("");
  }

  function validate() {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = "Name is required (min 2 characters).";
    }
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!emailPattern.test(form.email.trim())) next.email = "Enter a valid email.";
    if (!form.subject.trim() || form.subject.trim().length < 3) {
      next.subject = "Subject is required (min 3 characters).";
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      next.message = "Message must be at least 10 characters.";
    }
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError("");
    setSuccess("");
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const result = await submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        website: form.website,
      });
      setSuccess(result.message || "Thanks — your message was sent successfully.");
      setForm(emptyForm);
    } catch (error) {
      const parsed = parseApiError(error);
      setErrors((current) => ({ ...current, ...parsed.fieldErrors }));
      setFormError(parsed.message || "Could not send your message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-teal-700">
          <Link to="/" className="hover:text-teal-800">
            ← Back home
          </Link>
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Contact us</h1>
        <p className="mt-2 text-sm text-slate-600">
          Questions about orders, vendors, or the marketplace? Send a message and we will get
          back to you.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {formError && (
            <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {formError}
            </p>
          )}
          {success && (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {success}
            </p>
          )}

          {/* Honeypot field — hidden from users */}
          <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label>
              Website
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-800">
              Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
              />
              {errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
              />
              {errors.email && (
                <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>
              )}
            </label>
          </div>

          <label className="mt-4 block text-sm font-medium text-slate-800">
            Subject
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
            />
            {errors.subject && (
              <span className="mt-1 block text-xs text-rose-600">{errors.subject}</span>
            )}
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-800">
            Message
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={6}
              required
              minLength={10}
              maxLength={2000}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-600 focus:ring-2"
            />
            {errors.message && (
              <span className="mt-1 block text-xs text-rose-600">{errors.message}</span>
            )}
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send message"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;
