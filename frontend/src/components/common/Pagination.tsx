type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{
      display: "flex",
      gap: "6px",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "40px",
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ borderRadius: "var(--radius-md)", padding: "8px 14px", fontSize: "13px" }}>
        ← Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            borderRadius: "var(--radius-md)",
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: page === currentPage ? 700 : 400,
            background: page === currentPage ? "var(--brand-800)" : "var(--surface)",
            color: page === currentPage ? "#fff" : "var(--text-secondary)",
            borderColor: page === currentPage ? "var(--brand-800)" : "var(--border-strong)",
          }}>
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ borderRadius: "var(--radius-md)", padding: "8px 14px", fontSize: "13px" }}>
        Next →
      </button>
    </div>
  );
};

export default Pagination;
