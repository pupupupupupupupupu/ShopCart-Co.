import { useEffect, useState } from "react";
import {
  getAllUsers,
  disableUser,
  enableUser,
} from "../../api/admin.api";
import Loader from "../../components/common/Loader";
import ErrorBox from "../../components/common/ErrorBox";

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (user: any) => {
    user.active
      ? await disableUser(user._id)
      : await enableUser(user._id);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <Loader />;

  return (
    <section>
      <h3>User Management</h3>
      <ErrorBox message={error} />

      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.username}</td>
              <td>{u.active ? "Active" : "Disabled"}</td>
              <td>
                <button onClick={() => toggleUser(u)}>
                  {u.active ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default UserManagement;
