import "./Register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/cmmDark.png";

export default function Register() {
  const [form, setForm] = useState({
    restaurantName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false); // 👁‍🗨 state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", form);
      localStorage.setItem("token", res.data.token);
      toast.success("Registered successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error during registration");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <img src={logo} alt="Logo" className="black" />
        {/* <h1>Sign-Up</h1> */}
        <h2>Sign-Up</h2>
        {/* <input
          placeholder="Restaurant Name"
          onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
        /> */}
        <input
          placeholder="Email"
          type="email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <div style={{ position: "relative" }}>
          <input
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{
              paddingRight: "36px", // 👈 Add space for icon inside
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

        <p style={{ marginTop: "16px", fontSize: "14px" }}>
          Already have an account?{" "}
          <span
            style={{
              color: "#4a90e2",
              textDecoration: "none",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>

        <button
          style={{ color: "white", backgroundColor: "#FFC107" }}
          type="submit"
        >
          Register
        </button>
      </form>

      <ToastContainer position="top-center" autoClose={1500} />
    </div>
  );
}
