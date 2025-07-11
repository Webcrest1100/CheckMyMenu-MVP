// import { Link } from "react-router-dom";
// import { useTheme } from "./ThemeContext"; // adjust path if needed
// import "./Footer.css";

// export default function Footer() {
//   const { dark } = useTheme();

//   return (
//     <footer
//       className="footer"
//       style={{
//         backgroundColor: "#1E2A38 ",
//       }}
//     >
//       <div className="footer-content">
//         <div className="footer-brand">
//           <h3 style={{ color: "#FFC107" /* Golden Yellow */ }}>
//             Check My Menu
//           </h3>
//           <p style={{ marginTop: "6px" }}>
//             © {new Date().getFullYear()} All rights reserved.
//           </p>
//         </div>

//         {/* <div className="footer-links">
//           {["/", "/register", "/login", "/contact"].map((path, i) => (
//             <Link
//               key={path}
//               to={path}
//               className="footer-link"
//               style={{
//                 color: dark ? "#ccc" : "#F8F9FA", // Soft White in light
//                 transition: "color 0.3s ease",
//               }}
//             >
//               {["Home", "Register", "Login", "Contact"][i]}
//             </Link>
//           ))}
//         </div> */}
//       </div>
//     </footer>
//   );
// }

import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext"; // adjust path if needed
import "./Footer.css";
export default function Footer() {
  const { dark } = useTheme();
  return (
    <footer
      className="footer"
      style={{
        backgroundColor: "#1E2A38 ",
        color: dark ? "#ccc" : "#1E2A38 ", // Soft White in light mode
      }}
    >
      <div className="footer-content">
        <div className="footer-brand">
          <h3 style={{ color: "#FFC107" /* Golden Yellow */ }}>CHECKMY MENU</h3>
          <p style={{ marginTop: "6px", color: dark ? "#aaa" : "#F8F9FA" }}>
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
