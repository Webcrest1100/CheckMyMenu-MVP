import { useNavigate } from "react-router-dom";
import logo from "../assets/cmmDark.png";
import { useState } from "react";
import "./Navbar.css"; // New CSS file

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo-container" onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <div className={`nav-links ${menuOpen ? "show" : ""}`}>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}