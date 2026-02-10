import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth.api";
import useAuth from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  UserInfo: {
    username: string;
    roles: number[];
  };
};

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login({ user, pwd });
      const decoded = jwtDecode<DecodedToken>(data.accessToken);

    setAuth({
      user: decoded.UserInfo.username,
      roles: decoded.UserInfo.roles,
      accessToken: data.accessToken,
    });

      console.log("Access Token:", data.accessToken);

      // TEMP DEBUG ONLY
      const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
      console.log("Decoded JWT:", payload);

      navigate("/", { replace: true });
    } catch (err: any) {
      setError("Invalid username or password");
    }
  };

  return (
    <main>
      <h1>Login</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      <p>
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </main>
  );
};

export default Login;
