// src/pages/RequireAdmin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function RequireAdmin({ children }) {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return navigate("/login", { replace: true });
        }
        const { data: me } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!["admin", "superadmin"].includes(me.role)) {
          return navigate("/login", { replace: true });
        }
      } catch {
        return navigate("/login", { replace: true });
      } finally {
        setChecking(false);
      }
    })();
  }, [navigate]);
  if (checking) return <div>Checking permissions…</div>;
  return children;
}
