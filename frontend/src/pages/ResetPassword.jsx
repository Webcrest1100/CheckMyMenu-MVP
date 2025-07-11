import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { toast, ToastContainer } from "react-toastify";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Password reset successful!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Reset failed");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Reset Password</h1>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      <ToastContainer position="top-center" autoClose={1500} />
    </div>
  );
}
