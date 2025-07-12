import "./Register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/cmmDark.png";

export default function Register() {
  const [form, setForm] = useState({ restaurantName: "", email: "", password: "" });
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
      boxSizing: "border-box"
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
      pointerEvents: "auto"
    }}
  >
    👁️
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

        <button style={{color:"white", backgroundColor:"#FFC107"}} type="submit">Register</button>
      </form>

      <ToastContainer position="top-center" autoClose={1500} />
    </div>
  );
}
