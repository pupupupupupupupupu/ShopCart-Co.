const Footer = () => {
  return (
    <footer
      style={{
        marginTop: "2rem",
        padding: "1rem",
        borderTop: "1px solid #ddd",
        textAlign: "center",
        color: "#555",
      }}
    >
      <p>© {new Date().getFullYear()} ShopCart Co. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
