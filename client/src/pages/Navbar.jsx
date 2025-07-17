// import { useNavigate } from "react-router-dom";
// import logo from "../assets/cmmDark.png";
// import { useState ,  } from "react";

// export default function Navbar() {
//   const navigate = useNavigate();
 

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/");
//   };

//   return (
//     <nav style={styles.nav}>
//       <div style={styles.logoContainer} onClick={() => navigate("/")}>
//         <img src={logo} alt="Logo" style={styles.logo} />
//       </div>

//       <div style={styles.rightControls}>
       
//         <button style={styles.logoutBtn} onClick={handleLogout}>
//           Logout
//         </button>
//       </div>
//     </nav>
//   );
// }

// const styles = {
//   nav: {
//     backgroundColor: "#1E2A38", 
//     padding: "1.2rem 2rem",
//     display: "flex",
//     alignItems: "center",

//     justifyContent: "space-between",
//     flexWrap: "wrap",
//     zIndex: 1000,
    
   
//   },
//   logoContainer: {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     cursor: "pointer",
    
//   },
//   logo: {
//     height: "60px",
//     width: "60px",
//     objectFit: "contain",
//   },
//   ul: {
//     listStyle: "none",
//     display: "flex",
//     gap: "2rem",
//     margin: 0,
//     padding: 0,
//   },
//   li: {
//     color: "#F8F9FA", 
//     cursor: "pointer",
//     fontWeight: "500",
//     fontSize: "18px",
//     transition: "color 0.3s ease, transform 0.2s ease",
//   },
//   liHover: {
//     color: "#28A745",
//   },
//   rightControls: {
//     display: "flex",
//     alignItems: "center",
//     gap: "1rem",
//   },
//   toggle: {
//     background: "#28A745",
//     color: "#fff",
//     border: "none",
//     borderRadius: "50%",
//     fontSize: "18px",
//     padding: "8px 12px",
//     cursor: "pointer",
//     transition: "background 0.3s ease",
//   },
//   logoutBtn: {
//     backgroundColor: "#FFC107", 
//     color: "#343A40",
//     border: "none",
//     padding: "10px 20px",
//     fontWeight: "bold",
//     borderRadius: "8px",
//     cursor: "pointer",
//     transition: "background 0.3s ease",
//   },
// };


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

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <div className={`nav-links ${menuOpen ? "show" : ""}`}>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}