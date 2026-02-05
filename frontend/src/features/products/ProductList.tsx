import { useEffect, useState } from "react";
import { getProducts } from "../../api/product.api";
import ProductCard from "./ProductCard";
import ProductSearch from "./ProductSearch";
import ProductPagination from "./ProductPagination";
import Loader from "../../components/common/Loader";
import ErrorBox from "../../components/common/ErrorBox";

export type Product = {
  _id: string;
  name: string;
  price: number;
  images: string[];
};

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts({ page, search });
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  if (loading) return <Loader />;

  return (
    <main>
      <h2>Products</h2>

      <ProductSearch onSearch={setSearch} />

      <ErrorBox message={error} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <ProductPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </main>
  );
};

export default ProductList;
