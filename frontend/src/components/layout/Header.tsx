import Navbar from "./Navbar";

const Header = () => {
  return (
    <header
      style={{
        padding: "1rem",
        borderBottom: "1px solid #ddd",
        marginBottom: "1rem",
      }}
    >
      <h1 style={{ margin: 0 }}>ShopCart Co.</h1>
      <Navbar />
    </header>
  );
};

export default Header;
