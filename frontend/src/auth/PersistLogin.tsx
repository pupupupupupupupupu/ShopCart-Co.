import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { refresh } from "../api/auth.api";
import Loader from "../components/common/Loader";

const PersistLogin = () => {
  const { auth, setAuth } = useAuth();
  const [loading, setLoading] = useState(true);

useEffect(() => {
  let isMounted = true;

  const verifyRefreshToken = async () => {
    try {
      const data = await refresh();
      if (isMounted) {
        setAuth((prev) => ({
          ...prev,
          accessToken: data.accessToken,
        }));
      }
    } catch {
      // user stays logged out
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  if (!auth?.accessToken) {
    verifyRefreshToken();
  } else {
    setLoading(false);
  }

  return () => {
    isMounted = false;
  };
}, [auth?.accessToken, setAuth]);


  if (loading) return <Loader />;

  return <Outlet />;
};

export default PersistLogin;
