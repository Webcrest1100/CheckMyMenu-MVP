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
      console.log(err);
      setLoading(false);
      alert(err?.response?.data?.message);
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
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "55%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              fontSize: "18px",
              color: "#555555",
              userSelect: "none",
              pointerEvents: "auto",
            }}
          >
            {!showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-eye-icon lucide-eye"
              >
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-eye-off-icon lucide-eye-off"
              >
                <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                <path d="m2 2 20 20" />
              </svg>
            )}
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

        <button
          style={{ color: "white", backgroundColor: "#FFC107" }}
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}
