import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import { logout } from "../../api/auth.api";

const ADMIN_ROLE = 5150;

const Navbar = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const { totalItems } = useCart();

  const isLoggedIn = !!auth?.accessToken;
  const isAdmin =
    auth?.roles && Array.isArray(auth.roles) && auth.roles.includes(ADMIN_ROLE);

  const handleLogout = async () => {
    await logout();
    setAuth({});
    navigate("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        gap: "1rem",
        marginTop: "0.5rem",
        alignItems: "center",
      }}
    >
      <Link to="/">Products</Link>

      {isAdmin && <Link to="/admin/products">Manage Products</Link>}
      {!isLoggedIn && <Link to="/login">Login</Link>}
      {!isLoggedIn && <Link to="/register">Register</Link>}

      {isLoggedIn && <Link to="/cart">Cart ({totalItems})</Link>}

      {isAdmin && <Link to="/admin">Admin</Link>}

      {isLoggedIn && (
        <button onClick={handleLogout} style={{ cursor: "pointer" }}>
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;
