import { useState } from "react";
import { api } from "../api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import logo from "../assets/cmmDark.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // for full screen loader
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);

      // show loader for 5 seconds before redirecting
      setTimeout(() => {
        setLoading(false);
        navigate("/dashboard");
      }, 50);
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.msg || "Invalid credentials");
    }
  };

  return (
    <div className="home">
      {loading && (
        <div className="loader-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <img src={logo} alt="Logo" className="black" />
        <h1 className="log">Login</h1>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={{
              paddingRight: "36px",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          <span
            onMouseDown={() => setShowPassword(true)}
            onMouseUp={() => setShowPassword(false)}
            onMouseLeave={() => setShowPassword(false)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              fontSize: "18px",
              color: "#4a90e2",
              userSelect: "none",
              pointerEvents: "auto",
            }}
          >
            👁️
          </span>
        </div>

        <p
          onClick={() => navigate("/forgot-password")}
          style={{
            color: "#4a90e2",
            fontSize: "14px",
            cursor: "pointer",
            marginTop: "10px",
            textAlign: "center",
          }}
        >
          Forgot Password?
        </p>

        <p style={{ marginTop: "6px", fontSize: "14px" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#4a90e2",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Register
          </Link>
        </p>

        <button style={{color:"white", backgroundColor:"#FFC107"}} type="submit">Login</button>
      </form>
    </div>
  );
}
