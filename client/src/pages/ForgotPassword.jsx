import { useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("Reset link sent! Check your email.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error sending reset link");
    }
  };

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 10px",
      }}
    >
      <form onSubmit={handleSubmit}>
        <h1 style={{ fontSize: "2em" }}>Forgot Password</h1>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          style={{ color: "white", backgroundColor: "#FFC107" }}
          type="submit"
        >
          Send Reset Link
        </button>
      </form>
      <ToastContainer position="top-center" autoClose={1500} />
    </div>
  );
}
