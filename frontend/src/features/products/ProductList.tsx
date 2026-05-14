import { useEffect, useState } from "react";
import { getProducts, type Product } from "../../api/product.api";
import ProductCard from "./ProductCard";
import ProductSearch from "./ProductSearch";
import ProductPagination from "./ProductPagination";
import { SkeletonCard } from "../../components/common/Skeleton";
import ErrorBox from "../../components/common/ErrorBox";

const CATEGORIES = ["All", "Electronics", "Clothing", "Home", "Books", "Sports", "Beauty", "Toys", "Food"];

const ProductList = () => {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("");
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getProducts({
        page,
        search: search || undefined,
        category: category || undefined,
      });
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setTotal(data.total ?? data.products.length);
    } catch {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search, category]);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleCategory = (cat: string) => { setCategory(cat === "All" ? "" : cat); setPage(1); };

  return (
    <main>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ marginBottom: "6px" }}>Our Products</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          Discover our curated collection of quality items
        </p>
      </div>

      {/* Toolbar */}
      <div style={{
        background: "var(--surface)", borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)", padding: "16px 20px",
        marginBottom: "20px", display: "flex",
        flexDirection: "column", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <ProductSearch onSearch={handleSearch} />
          {!loading && (
            <p style={{ color: "var(--text-muted)", fontSize: "13px", flexShrink: 0 }}>
              {total === 0 ? "No products found" : `${total} product${total !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>

        {/* Category filters */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => {
            const active = cat === "All" ? !category : category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                style={{
                  padding: "5px 14px", borderRadius: "var(--radius-full)",
                  fontSize: "13px", fontWeight: active ? 600 : 400,
                  cursor: "pointer", border: "1.5px solid",
                  background: active ? "var(--brand-800)" : "transparent",
                  color: active ? "#fff" : "var(--text-secondary)",
                  borderColor: active ? "var(--brand-800)" : "var(--border-strong)",
                  transition: "all var(--transition-fast)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <ErrorBox message={error} />

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 24px",
          background: "var(--surface)", borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h3 style={{ marginBottom: "8px" }}>No products found</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
            {search ? `No results for "${search}"` : "No products in this category yet."}
          </p>
          <button
            className="btn-outline"
            onClick={() => { setSearch(""); setCategory(""); setPage(1); }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
          {products.map((product, i) => (
            <div key={product._id} className="fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      <ProductPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
};

export default ProductList;
