import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const navLinkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-teal-700 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const links = [
  { to: "/admin/dashboard", label: "Dashboard", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/stores", label: "Stores" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
];

function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-svh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-semibold text-slate-900">
              Ashal
            </Link>
            <span className="hidden text-sm text-slate-400 sm:inline">|</span>
            <span className="hidden text-sm font-medium text-teal-700 sm:inline">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-600 sm:inline">{user?.name}</span>
            <Link to="/shop" className="font-medium text-slate-600 hover:text-slate-900">
              View Shop
            </Link>
            <button
              type="button"
              onClick={logout}
              className="font-medium text-slate-600 hover:text-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-8 space-y-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Manage
            </p>
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass} end={link.end}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <nav className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
                    isActive
                      ? "bg-teal-700 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
