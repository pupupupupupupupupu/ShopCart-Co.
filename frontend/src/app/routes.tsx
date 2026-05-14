import { Routes, Route } from "react-router-dom";

import Login          from "../auth/Login";
import Register       from "../auth/Register";
import ForgotPassword from "../auth/ForgotPassword";
import ResetPassword  from "../auth/ResetPassword";
import PersistLogin   from "../auth/PersistLogin";
import RequireAuth    from "../auth/RequireAuth";
import RequireAdmin   from "../auth/RequireAdmin";

import ProductList    from "../features/products/ProductList";
import ProductDetail  from "../features/products/ProductDetail";
import CartPage       from "../features/cart/CartPage";
import OrderHistory   from "../features/orders/OrderHistory";
import Checkout       from "../features/checkout/Checkout";
import Profile        from "../features/user/Profile";
import Wishlist       from "../features/user/Wishlist";

import AdminDashboard from "../features/admin/AdminDashboard";
import AdminProducts  from "../features/admin/AdminProducts";
import UserManagement from "../features/admin/UserManagement";
import AdminOrders    from "../features/admin/AdminOrders";
import AdminAnalytics from "../features/admin/AdminAnalytics";
import AdminCoupons   from "../features/admin/AdminCoupons";

import NotFound from "../components/common/NotFound";

const AppRoutes = () => (
  <Routes>
    <Route element={<PersistLogin />}>

      {/* Public */}
      <Route path="/"                      element={<ProductList />} />
      <Route path="/products/:id"          element={<ProductDetail />} />
      <Route path="/login"                 element={<Login />} />
      <Route path="/register"              element={<Register />} />
      <Route path="/forgot-password"       element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Authenticated */}
      <Route element={<RequireAuth />}>
        <Route path="/cart"     element={<CartPage />} />
        <Route path="/orders"   element={<OrderHistory />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile"  element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Route>

      {/* Admin */}
      <Route element={<RequireAuth />}>
        <Route element={<RequireAdmin />}>
          <Route path="/admin"           element={<AdminDashboard />} />
          <Route path="/admin/products"  element={<AdminProducts />} />
          <Route path="/admin/users"     element={<UserManagement />} />
          <Route path="/admin/orders"    element={<AdminOrders />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/coupons"   element={<AdminCoupons />} />
        </Route>
      </Route>

    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
