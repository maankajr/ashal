import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./store/AuthContext";
import { CartProvider } from "./store/CartContext";
import { WishlistProvider } from "./store/WishlistContext";
import CustomerRoute from "./components/CustomerRoute";
import VendorRoute from "./components/VendorRoute";
import VendorLayout from "./components/VendorLayout";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

// Static public storefront imports (loaded eagerly for instant first contentful paint)
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VendorRegister from "./pages/VendorRegister";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import StoreDetails from "./pages/StoreDetails";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Lazy-loaded vendor portal routes (code-split)
const VendorDashboard = lazy(() => import("./pages/vendor/VendorDashboard"));
const VendorProducts = lazy(() => import("./pages/vendor/VendorProducts"));
const AddProduct = lazy(() => import("./pages/vendor/AddProduct"));
const EditProduct = lazy(() => import("./pages/vendor/EditProduct"));
const VendorOrders = lazy(() => import("./pages/vendor/VendorOrders"));
const StoreSettings = lazy(() => import("./pages/vendor/StoreSettings"));

// Lazy-loaded admin portal routes (code-split)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminStores = lazy(() => import("./pages/admin/AdminStores"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts"));

function PortalFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-700 border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Storefront Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/store/:storeId" element={<StoreDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/vendor/register" element={<VendorRegister />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Customer Routes (Guarded against vendors -> redirect to /vendor/dashboard) */}
              <Route element={<CustomerRoute />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetails />} />
              </Route>

              {/* Vendor Portal (Code-Split / Lazy-Loaded) */}
              <Route element={<VendorRoute />}>
                <Route path="/vendor" element={<VendorLayout />}>
                  <Route index element={<Navigate to="/vendor/dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <VendorDashboard />
                      </Suspense>
                    }
                  />
                  <Route
                    path="products"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <VendorProducts />
                      </Suspense>
                    }
                  />
                  <Route
                    path="products/new"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <AddProduct />
                      </Suspense>
                    }
                  />
                  <Route
                    path="products/:id/edit"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <EditProduct />
                      </Suspense>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <VendorOrders />
                      </Suspense>
                    }
                  />
                  <Route
                    path="store"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <StoreSettings />
                      </Suspense>
                    }
                  />
                </Route>
              </Route>

              {/* Admin Portal (Code-Split / Lazy-Loaded) */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <AdminDashboard />
                      </Suspense>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <AdminUsers />
                      </Suspense>
                    }
                  />
                  <Route
                    path="stores"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <AdminStores />
                      </Suspense>
                    }
                  />
                  <Route
                    path="categories"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <AdminCategories />
                      </Suspense>
                    }
                  />
                  <Route
                    path="products"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <AdminProducts />
                      </Suspense>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <AdminOrders />
                      </Suspense>
                    }
                  />
                  <Route
                    path="orders/:id"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <AdminOrders />
                      </Suspense>
                    }
                  />
                  <Route
                    path="contacts"
                    element={
                      <Suspense fallback={<PortalFallback />}>
                        <AdminContacts />
                      </Suspense>
                    }
                  />
                </Route>
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
