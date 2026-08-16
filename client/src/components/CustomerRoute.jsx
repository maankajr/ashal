import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export default function CustomerRoute() {
  const { isAuthenticated, user, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking session…
      </div>
    );
  }

  // Redirect vendors away from customer-only routes to their vendor portal
  if (isAuthenticated && user?.role === "vendor") {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  return <Outlet />;
}
