import { useNavigate } from "react-router-dom";
import logo from "../assets/cmmDark.png";
import { useState ,  } from "react";

export default function Navbar() {
  const navigate = useNavigate();
 

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logoContainer} onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" style={styles.logo} />
      </div>

      {/* <ul style={styles.ul}>
        {["Home", "About", "Menu", "Contact"].map((label) => (
          <li
            key={label}
            style={styles.li}
            onClick={() => navigate("/Coming")}
          >
            {label}
          </li>
        ))}
      </ul> */}

      <div style={styles.rightControls}>
       
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: "#1E2A38", // Navy Blue  #1E2A38
    padding: "1.2rem 2rem",
    display: "flex",
    alignItems: "center",

    justifyContent: "space-between",
    flexWrap: "wrap",
    // boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    zIndex: 1000,
    
   
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    
  },
  logo: {
    height: "60px",
    width: "60px",
    objectFit: "contain",
  },
  ul: {
    listStyle: "none",
    display: "flex",
    gap: "2rem",
    margin: 0,
    padding: 0,
  },
  li: {
    color: "#F8F9FA", // Soft White
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "18px",
    transition: "color 0.3s ease, transform 0.2s ease",
  },
  liHover: {
    color: "#28A745", // Emerald Green
  },
  rightControls: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  toggle: {
    background: "#28A745", // Emerald Green
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    fontSize: "18px",
    padding: "8px 12px",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  logoutBtn: {
    backgroundColor: "#FFC107", // Golden Yellow
    color: "#343A40", // Charcoal
    border: "none",
    padding: "10px 20px",
    fontWeight: "bold",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
};
