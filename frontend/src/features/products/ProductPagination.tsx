import Pagination from "../../components/common/Pagination";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const ProductPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: Props) => {
  return (
    <div style={{ marginTop: "1.5rem" }}>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ProductPagination;
