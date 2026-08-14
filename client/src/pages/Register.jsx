import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!emailPattern.test(form.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!form.password) nextErrors.password = "Password is required.";
    else if (form.password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    if (!form.confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "Passwords do not match.";
    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
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
          <h1 className="text-2xl font-semibold text-slate-900">Create an account</h1>
          <p className="mt-1 text-sm text-slate-600">Join Ashal to shop from local vendors.</p>

          <label className="mt-6 block text-sm font-medium text-slate-800">
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-700">{errors.name}</p>}
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-800">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2"
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
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2"
            />
            {errors.password && <p className="mt-1 text-xs text-rose-700">{errors.password}</p>}
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-800">
            Confirm password
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-700">{errors.confirmPassword}</p>
            )}
          </label>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Register
          </button>

          {submitted && (
            <p className="mt-3 text-sm text-emerald-700">
              Account details look valid — API registration will be wired up later.
            </p>
          )}

          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-teal-700 hover:text-teal-800">
              Login
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default Register;
