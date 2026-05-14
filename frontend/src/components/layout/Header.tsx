import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import { logout } from "../../api/auth.api";

const ADMIN_ROLE = 5150;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuth } = useAuth();
  const { totalItems } = useCart();

  const isLoggedIn = !!auth?.accessToken;
  const isAdmin = auth?.roles && Array.isArray(auth.roles) && auth.roles.includes(ADMIN_ROLE);

  const handleLogout = async () => {
    await logout();
    setAuth({});
    navigate("/");
  };

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const ghostBtn: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.11)",
    color: "rgba(255,255,255,0.8)",
    borderRadius: "var(--radius-md)",
    padding: "7px 14px",
    fontSize: "13.5px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all var(--transition-base)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
    fontFamily: "var(--font-body)",
  };

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "var(--brand-900)",
      boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
      height: "var(--navbar-height)",
    }}>
      <div style={{
        maxWidth: "var(--container-max)", margin: "0 auto",
        padding: "0 24px", height: "100%",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "16px",
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: "34px", height: "34px", background: "var(--accent)",
            borderRadius: "9px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "18px",
          }}>🛍</div>
          <span style={{
            fontFamily: "var(--font-display)", fontSize: "1.2rem",
            fontWeight: 700, color: "#fff", letterSpacing: "-0.01em",
          }}>ShopCart Co.</span>
        </Link>

        {/* Centre nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1, justifyContent: "center" }}>
          <NavLink to="/" active={isActive("/")}>Products</NavLink>
          {isLoggedIn && <NavLink to="/orders" active={isActive("/orders")}>Orders</NavLink>}
          {isLoggedIn && <NavLink to="/wishlist" active={isActive("/wishlist")}>♡ Wishlist</NavLink>}
          {isAdmin && (
            <>
              <span style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)", margin: "0 6px" }} />
              <NavLink to="/admin" active={isActive("/admin")}>Dashboard</NavLink>
              <NavLink to="/admin/orders" active={isActive("/admin/orders")}>Orders</NavLink>
              <NavLink to="/admin/analytics" active={isActive("/admin/analytics")}>Analytics</NavLink>
              <NavLink to="/admin/coupons" active={isActive("/admin/coupons")}>Coupons</NavLink>
            </>
          )}
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {isLoggedIn && (
            <>
              <Link to="/cart" style={{ textDecoration: "none" }}>
                <button style={{ ...ghostBtn, background: isActive("/cart") ? "rgba(255,255,255,0.14)" : ghostBtn.background }}>
                  <span style={{ fontSize: "16px" }}>🛒</span>
                  {totalItems > 0 && (
                    <span style={{
                      background: "var(--accent)", color: "#fff",
                      borderRadius: "var(--radius-full)", fontSize: "11px",
                      fontWeight: 700, minWidth: "18px", height: "18px",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", padding: "0 4px",
                    }}>{totalItems}</span>
                  )}
                  Cart
                </button>
              </Link>

              <Link to="/profile" style={{ textDecoration: "none" }}>
                <button style={{ ...ghostBtn, background: isActive("/profile") ? "rgba(255,255,255,0.14)" : ghostBtn.background }}>
                  <span style={{ fontSize: "15px" }}>👤</span>
                  Profile
                </button>
              </Link>

              <button onClick={handleLogout} style={{
                ...ghostBtn,
                color: "rgba(255,255,255,0.5)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                Log out
              </button>
            </>
          )}

          {!isLoggedIn && (
            <>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.85)",
                  borderRadius: "var(--radius-md)", padding: "8px 16px",
                  fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-body)",
                }}>Log in</button>
              </Link>
              <Link to="/register" style={{ textDecoration: "none" }}>
                <button className="btn-primary" style={{ borderRadius: "var(--radius-md)", padding: "8px 16px", fontSize: "14px" }}>
                  Sign up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) => (
  <Link to={to} style={{ textDecoration: "none" }}>
    <span style={{
      display: "inline-block", padding: "5px 12px",
      borderRadius: "var(--radius-md)", fontSize: "13.5px",
      fontWeight: active ? 600 : 400,
      color: active ? "#fff" : "rgba(255,255,255,0.6)",
      background: active ? "rgba(255,255,255,0.1)" : "transparent",
      transition: "all var(--transition-base)", cursor: "pointer",
    }}>
      {children}
    </span>
  </Link>
);

export default Header;
