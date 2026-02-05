import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AppRoutes from "./routes";

const App = () => {
  return (
    <Router>
      <Navbar />
      <main style={{ minHeight: "80vh", padding: "1rem" }}>
        <AppRoutes />
      </main>
      <Footer />
    </Router>
  );
};

export default App;
