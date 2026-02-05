import { useEffect, useState } from "react";
import { getAdminStats } from "../../api/admin.api";
import Loader from "../../components/common/Loader";
import ErrorBox from "../../components/common/ErrorBox";

const Stats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats(data);
      } catch {
        setError("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <section>
      <h3>Platform Stats</h3>
      <ErrorBox message={error} />

      {stats && (
        <ul>
          <li>Total Users: {stats.totalUsers}</li>
          <li>Total Products: {stats.totalProducts}</li>
          <li>Total Orders: {stats.totalOrders}</li>
        </ul>
      )}
    </section>
  );
};

export default Stats;
