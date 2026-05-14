import { useState } from "react";

type Props = { onSearch: (value: string) => void };

const ProductSearch = ({ onSearch }: Props) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: "flex",
      gap: "10px",
      alignItems: "center",
      maxWidth: "460px",
    }}>
      <div style={{ position: "relative", flex: 1 }}>
        <span style={{
          position: "absolute", left: "13px", top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)", fontSize: "16px", pointerEvents: "none",
        }}>🔍</span>
        <input
          type="text"
          placeholder="Search products…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ paddingLeft: "40px", paddingRight: value ? "36px" : "14px" }}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: "absolute", right: "10px", top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none", boxShadow: "none",
              color: "var(--text-muted)", cursor: "pointer",
              padding: "2px", width: "20px", height: "20px",
              fontSize: "16px", lineHeight: 1,
            }}>×</button>
        )}
      </div>
      <button type="submit" className="btn-brand btn-sm" style={{ flexShrink: 0 }}>
        Search
      </button>
    </form>
  );
};

export default ProductSearch;
