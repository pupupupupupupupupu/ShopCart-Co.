import { useState } from "react";

type Props = {
  onSearch: (value: string) => void;
};

const ProductSearch = ({ onSearch }: Props) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="Search products..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ padding: "0.4rem", width: "200px" }}
      />
      <button type="submit" style={{ marginLeft: "0.5rem" }}>
        Search
      </button>
    </form>
  );
};

export default ProductSearch;
