import { useEffect, useState } from "react";
import { getAdminStats } from "../../api/admin.api";
import Loader from "../../components/common/Loader";
import ErrorBox from "../../components/common/ErrorBox";

type Stats = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <main>
      <h2>Admin Dashboard</h2>

      <ErrorBox message={error} />

      {stats && (
        <ul>
          <li>Total Users: {stats.totalUsers}</li>
          <li>Total Products: {stats.totalProducts}</li>
          <li>Total Orders: {stats.totalOrders}</li>
        </ul>
      )}
    </main>
  );
};

export default AdminDashboard;
