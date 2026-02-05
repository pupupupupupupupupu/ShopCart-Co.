type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={page === currentPage}
          style={{
            padding: "0.4rem 0.8rem",
            cursor: page === currentPage ? "default" : "pointer",
            backgroundColor: page === currentPage ? "#ccc" : "#fff",
            border: "1px solid #999",
          }}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
