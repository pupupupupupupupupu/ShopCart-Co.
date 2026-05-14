import Pagination from "../../components/common/Pagination";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const ProductPagination = ({ currentPage, totalPages, onPageChange }: Props) => (
  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
);

export default ProductPagination;
