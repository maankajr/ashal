import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";

const linkClass =
  "text-sm text-slate-400 transition-colors hover:text-teal-300";

const headingClass =
  "text-xs font-semibold uppercase tracking-[0.14em] text-white";

const socialIconClass = "h-4 w-4";

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.174 2.097 15.943 2 14.643 2 11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2H21l-6.52 7.45L22 22h-6.79l-4.4-5.76L5.5 22H2.74l6.97-7.97L2 2h6.96l3.98 5.3L18.244 2zm-1.19 18h1.84L7.03 3.94H5.06L17.054 20z" />
    </svg>
  );
}

function TikTokIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15.34 6.34 6.34 0 0 0 9.5 21.67a6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-.01-.15z" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="text-2xl font-bold tracking-tight text-white">
              Ashal
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
              Your multi-vendor marketplace for everything you need.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="rounded-full border border-slate-700 p-2 text-slate-400 transition hover:border-teal-500 hover:text-teal-300"
              >
                <FacebookIcon className={socialIconClass} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="rounded-full border border-slate-700 p-2 text-slate-400 transition hover:border-teal-500 hover:text-teal-300"
              >
                <InstagramIcon className={socialIconClass} />
              </a>
              <a
                href="#"
                aria-label="Twitter / X"
                className="rounded-full border border-slate-700 p-2 text-slate-400 transition hover:border-teal-500 hover:text-teal-300"
              >
                <XIcon className={socialIconClass} />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="rounded-full border border-slate-700 p-2 text-slate-400 transition hover:border-teal-500 hover:text-teal-300"
              >
                <TikTokIcon className={socialIconClass} />
              </a>
            </div>
          </div>

          <div>
            <h3 className={headingClass}>Shop</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/shop" className={linkClass}>
                  All Categories
                </Link>
              </li>
              <li>
                <Link to="/shop" className={linkClass}>
                  Watches
                </Link>
              </li>
              <li>
                <Link to="/shop" className={linkClass}>
                  Fashion
                </Link>
              </li>
              <li>
                <Link to="/shop" className={linkClass}>
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/shop" className={linkClass}>
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/shop" className={linkClass}>
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Customer Service</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/contact" className={linkClass}>
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Track Order
                </a>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Company</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#" className={linkClass}>
                  About Us
                </a>
              </li>
              <li>
                <Link to="/register" className={linkClass}>
                  Become a Vendor
                </Link>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className={linkClass}>
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li>
                <span className="block text-slate-500">Developer</span>
                <span className="text-slate-200">Eng. Abdirahman</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <a
                  href="mailto:abdimaanka56@gmail.com"
                  className="text-slate-200 transition hover:text-teal-300"
                >
                  abdimaanka56@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 pt-1 text-xs text-slate-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
                Made with care in Somalia
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Ashal. All rights reserved.</p>
          <p className="text-slate-400">Secure payments</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
