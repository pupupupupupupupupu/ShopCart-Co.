import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ToastProvider } from "../context/ToastContext";
import ErrorBoundary from "../components/common/ErrorBoundary";
import ToastContainer from "../components/common/ToastContainer";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AppRoutes from "./routes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <ErrorBoundary>
              <Header />
              <main style={{ minHeight: "calc(100vh - var(--navbar-height) - 200px)", paddingBottom: "60px" }}>
                <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "32px 20px" }}>
                  <AppRoutes />
                </div>
              </main>
              <Footer />
              <ToastContainer />
            </ErrorBoundary>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
