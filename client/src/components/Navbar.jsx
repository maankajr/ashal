import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../store/CartContext";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-teal-700" : "text-slate-600 hover:text-slate-900"
  }`;

function Navbar() {
  const [open, setOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-semibold tracking-tight text-slate-900">
          Ashal
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>
          <NavLink to="/wishlist" className={navLinkClass}>
            Wishlist
          </NavLink>
          <NavLink to="/orders" className={navLinkClass}>
            Orders
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <NavLink
            to="/cart"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <span className="sr-only">Cart</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25h9.75m-9.75 0a1.5 1.5 0 01-1.5-1.5V8.25m11.25 6a1.5 1.5 0 001.5-1.5V8.25M6.27 5.272 7.5 14.25m11.25 0L20.25 6.75H6.75"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/profile"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Profile
          </NavLink>
          <NavLink
            to="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Register
          </NavLink>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <NavLink
            to="/cart"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <span className="sr-only">Cart</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25h9.75m-9.75 0a1.5 1.5 0 01-1.5-1.5V8.25m11.25 6a1.5 1.5 0 001.5-1.5V8.25M6.27 5.272 7.5 14.25m11.25 0L20.25 6.75H6.75"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </NavLink>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              {open ? (
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-200 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            <NavLink to="/" className={navLinkClass} end onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/shop" className={navLinkClass} onClick={() => setOpen(false)}>
              Shop
            </NavLink>
            <NavLink to="/wishlist" className={navLinkClass} onClick={() => setOpen(false)}>
              Wishlist
            </NavLink>
            <NavLink to="/orders" className={navLinkClass} onClick={() => setOpen(false)}>
              Orders
            </NavLink>
            <NavLink to="/cart" className={navLinkClass} onClick={() => setOpen(false)}>
              Cart ({cartCount})
            </NavLink>
            <NavLink to="/profile" className={navLinkClass} onClick={() => setOpen(false)}>
              Profile
            </NavLink>
            <NavLink to="/login" className={navLinkClass} onClick={() => setOpen(false)}>
              Login
            </NavLink>
            <NavLink to="/register" className={navLinkClass} onClick={() => setOpen(false)}>
              Register
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
