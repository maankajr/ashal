import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./store/AuthContext";
import { CartProvider } from "./store/CartContext";
import { WishlistProvider } from "./store/WishlistContext";
import VendorRoute from "./components/VendorRoute";
import VendorLayout from "./components/VendorLayout";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
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
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProducts from "./pages/vendor/VendorProducts";
import AddProduct from "./pages/vendor/AddProduct";
import EditProduct from "./pages/vendor/EditProduct";
import VendorOrders from "./pages/vendor/VendorOrders";
import StoreSettings from "./pages/vendor/StoreSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStores from "./pages/admin/AdminStores";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/store/:storeId" element={<StoreDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/vendor/register" element={<VendorRegister />} />

              <Route element={<VendorRoute />}>
                <Route path="/vendor" element={<VendorLayout />}>
                  <Route index element={<Navigate to="/vendor/dashboard" replace />} />
                  <Route path="dashboard" element={<VendorDashboard />} />
                  <Route path="products" element={<VendorProducts />} />
                  <Route path="products/new" element={<AddProduct />} />
                  <Route path="products/:id/edit" element={<EditProduct />} />
                  <Route path="orders" element={<VendorOrders />} />
                  <Route path="store" element={<StoreSettings />} />
                </Route>
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="stores" element={<AdminStores />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<AdminOrders />} />
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
