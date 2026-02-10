import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../auth/Login";
import Register from "../auth/Register";

import ProductList from "../features/products/ProductList";
import CartPage from "../features/cart/CartPage";
import AdminDashboard from "../features/admin/AdminDashboard";

import RequireAuth from "../auth/RequireAuth";
import RequireAdmin from "../auth/RequireAdmin";
import AdminProducts from "../features/admin/AdminProducts";
import PersistLogin from "../auth/PersistLogin";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🌍 Public Routes */}
      <Route path="/" element={<ProductList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PersistLogin />}>
        {/* 🔐 Logged-in Users */}
        <Route element={<RequireAuth />}>
          <Route path="/cart" element={<CartPage />} />
        </Route>

        {/* 🛡️ Admin Only */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
          </Route>
        </Route>
      </Route>

      {/* ❌ Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
