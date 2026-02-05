import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../auth/Login";
import Register from "../auth/Register";

import ProductList from "../features/products/ProductList";
import CartPage from "../features/cart/CartPage";
import AdminDashboard from "../features/admin/AdminDashboard";

import RequireAuth from "../auth/RequireAuth";
import RequireAdmin from "../auth/RequireAdmin";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🌍 Public Routes */}
      <Route path="/" element={<ProductList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🔐 Protected Routes (User) */}
      <Route element={<RequireAuth />}>
        <Route path="/cart" element={<CartPage />} />
      </Route>

      {/* 🛡️ Admin Routes */}
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* ❌ Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
