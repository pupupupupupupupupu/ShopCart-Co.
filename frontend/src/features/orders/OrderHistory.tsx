import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/common/Loader";
import ErrorBox from "../../components/common/ErrorBox";

type OrderItem = {
  productId: {
    name: string;
    price: number;
  };
  qty: number;
};

type Order = {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
};

const OrderHistory = () => {
  const axiosPrivate = useAxiosPrivate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axiosPrivate.get("/orders/me");
        setOrders(res.data);
      } catch {
        setError("Failed to load order history");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [axiosPrivate]);

  if (loading) return <Loader />;

  if (!orders.length) {
    return <p>You haven’t placed any orders yet.</p>;
  }

  return (
    <main>
      <h2>Order History</h2>
      <ErrorBox message={error} />

      {orders.map((order) => (
        <section key={order._id} style={{ marginBottom: "1rem" }}>
          <h4>Order #{order._id.slice(-6)}</h4>
          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>

          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.productId.name} × {item.qty} = $
                {(item.qty * item.productId.price).toFixed(2)}
              </li>
            ))}
          </ul>

          <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
        </section>
      ))}
    </main>
  );
};

export default OrderHistory;
