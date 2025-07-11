// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../api";
// import Navbar from "./Navbar";
// import Footer from "./Footer";
// import QRCode from "react-qr-code";
// import { jsPDF } from "jspdf";
// import { SketchPicker } from "react-color";
// import html2canvas from "html2canvas";
// import { useRef } from "react";
// import "./Template1.css";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// export default function Template1() {
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();
//   const restaurantId = localStorage.getItem("restaurantId");
//   const [setLogo] = useState(null);
//   const [setLogoPreview] = useState(null);
//   const cardRefs = useRef({});
//   const [menuItems, setMenuItems] = useState([]);
//   const [search] = useState("");
//   const [categoryFilter] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(6);
//   const [totalPages, setTotalPages] = useState(1);
//   const [cardColors, setCardColors] = useState({});
//   const [activeColorPicker, setActiveColorPicker] = useState(null);
//   const selectedTemplate = Number(localStorage.getItem("menuTemplate")) || 1;

//   useEffect(() => {
//     const fetchMenuItems = async () => {
//       const restaurantId = localStorage.getItem("restaurantId");
//       if (!restaurantId) return;

//       setLoading(true);
//       try {
//         const res = await api.get(`/public/restaurants/${restaurantId}/menu`);
//         setMenuItems(res.data);
//       } catch (err) {
//         console.error("Error fetching menu items:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMenuItems();
//   }, []);

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       setDebouncedSearch(search.trim());
//       setPage(1);
//     }, 400);
//     return () => clearTimeout(timeout);
//   }, [search]);

//   useEffect(() => {
//     if (!token) {
//       toast.warning("Session expired. Please login again.");
//       navigate("/login");
//     }
//   }, [token, navigate]);

//   useEffect(() => {
//     if (restaurantId && token) fetchMenuItems();
//   }, [restaurantId, debouncedSearch, categoryFilter, page]);

//   const fetchMenuItems = async () => {
//     try {
//       setLoading(true);
//       const params = { page, limit };
//       if (debouncedSearch) params.search = debouncedSearch;
//       if (categoryFilter) params.category = categoryFilter;

//       const res = await api.get(`/restaurants/${restaurantId}/menu`, {
//         params,
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("Response from server:", res.data);

//       if (Array.isArray(res.data)) {
//         setMenuItems(res.data);
//         setTotalPages(1);
//       } else {
//         setMenuItems(res.data.items || []);
//         setTotalPages(res.data.totalPages || 1);
//       }
//     } catch (err) {
//       console.error(
//         "Error fetching menu items:",
//         err?.response?.data || err.message
//       );
//       toast.error("Error loading menu items", {
//         autoClose: 3000,
//         closeOnClick: true,
//         pauseOnHover: true,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownloadPDF = async (item) => {
//     const cardElement = cardRefs.current[item._id];
//     if (!cardElement) {
//       toast.error("Card not found.");
//       return;
//     }

//     try {
//       // Optional: Hide download button during capture
//       const downloadBtn = cardElement.querySelector(".btn-download");
//       if (downloadBtn) downloadBtn.style.display = "none";

//       const canvas = await html2canvas(cardElement, {
//         scale: 2,
//         useCORS: true,
//       });

//       if (downloadBtn) downloadBtn.style.display = "inline-block";

//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "mm", "a4");

//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();

//       const imgProps = pdf.getImageProperties(imgData);
//       const imgRatio = imgProps.width / imgProps.height;
//       const imgWidth = pdfWidth * 0.85;
//       const imgHeight = imgWidth / imgRatio;

//       const marginX = (pdfWidth - imgWidth) / 2;
//       const marginY = 30;

//       pdf.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
//       pdf.save(`${item.name}_menu_card.pdf`);
//     } catch (error) {
//       console.error("PDF generation failed:", error);
//       toast.error("Failed to generate PDF.");
//     }
//   };

//   // const handleColorChange = (color, itemId) => {
//   //   setCardColors((prev) => ({
//   //     ...prev,
//   //     [itemId]: color.hex,
//   //   }));
//   // };
//   // const handleLogoChange = (e) => {
//   //   const file = e.target.files[0];
//   //   if (file) {
//   //     setLogo(file);
//   //     setLogoPreview(URL.createObjectURL(file));
//   //   }
//   // };

//   return (
//     <div>
//       <Navbar />
//       {/* <AddLogo/> */}
//       <div className="menu-container">
//         <h2 className="menu-heading">Menu Management</h2>
//         <div
//           style={{
//             textAlign: "center",
//             marginBottom: "30px",
//             display: "flex ",
//             justifyContent: "center",
//             gap: "5px",
//           }}
//         >
//           <h2 style={{ marginBottom: "10px" }}>Scan to View Menu</h2>
//           <QRCode
//             value={`${window.location.origin}/view/${restaurantId}/template1`}
//             size={120}
//             bgColor="white"
//             fgColor="black"
//           />
//         </div>
//         <div className="menu-grid">
//           {loading ? (
//             <p>Loading...</p>
//           ) : menuItems.length === 0 ? (
//             <div className="no-items">No items found</div>
//           ) : (
//             menuItems.map((item) => (
//               <div
//                 key={item._id}
//                 ref={(el) => (cardRefs.current[item._id] = el)} // 👈 Track the card
//                 className="menu-card"
//                 style={{
//                   backgroundColor: "#1E2A38",
//                   color: "#ffffff",
//                   paddingBottom: "30px",
//                 }}
//               >
//                 {item.imageUrl ? (
//                   <img
//                     src={
//                       item.imageUrl.startsWith("http")
//                         ? item.imageUrl
//                         : `http://localhost:5000${item.imageUrl}`
//                     }
//                     alt={item.name}
//                     className="menu-img"
//                     style={{
//                       width: "100%",
//                       height: "150px",
//                       objectFit: "cover",
//                       borderRadius: "8px",
//                       marginBottom: "12px",
//                     }}
//                   />
//                 ) : (
//                   <div className="image-placeholder">No Image</div>
//                 )}

//                 {/* <h3 className="menu-title" style={{}}>{item.name}</h3>
//   <p>{item.description}</p>
//   <p className="menu-price">Price: ${item.price}</p>
//   <p className="menu-category">Category: {item.category}</p> */}

//                 <h3
//                   style={{
//                     fontSize: "1.3rem",
//                     fontWeight: 600,
//                     color: "#ffffff",
//                     marginBottom: "0.5rem",
//                     textAlign: "center",
//                   }}
//                 >
//                   {item.name}
//                 </h3>

//                 <p
//                   style={{
//                     fontSize: "0.95rem",
//                     fontWeight: 200,
//                     color: "#ffffff",
//                     marginBottom: "0.5rem",
//                     textAlign: "center",
//                   }}
//                 >
//                   {item.description}
//                 </p>
//                 <p
//                   style={{
//                     fontSize: "0.95rem",
//                     fontWeight: 500,
//                     color: "#ffffff",
//                     marginBottom: "0.5rem",
//                     textAlign: "center",
//                   }}
//                 >
//                   Price: ${item.price}
//                 </p>
//                 <p
//                   style={{
//                     fontSize: "0.95rem",
//                     fontWeight: 200,
//                     color: "#ffffff",
//                     marginBottom: "0.5rem",
//                     textAlign: "center",
//                   }}
//                 >
//                   Category: {item.category}
//                 </p>

//                 <button
//                   onClick={() => handleDownloadPDF(item)}
//                   className="btn-download"
//                   title="Download as PDF"
//                 >
//                   Download PDF
//                 </button>
//                 <QRCode
//                   value={`${window.location.origin}/view/${restaurantId}/template1`}
//                   size={120}
//                   bgColor="white"
//                   fgColor="black"
//                 />

//                 {/* 🎨 Color Picker Component */}
//                 {activeColorPicker === item._id && (
//                   <div style={{ marginTop: "10px" }}>
//                     <SketchPicker
//                       color={cardColors[item._id] || "#ffffff"}
//                       onChangeComplete={(color) =>
//                         handleColorChange(color, item._id)
//                       }
//                     />
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>

//         {totalPages > 1 && (
//           <div className="pagination">
//             <button
//               onClick={() => handlePageChange(page - 1)}
//               disabled={page === 1}
//             >
//               <FaChevronLeft /> Prev
//             </button>
//             <span>
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={() => handlePageChange(page + 1)}
//               disabled={page === totalPages}
//             >
//               Next <FaChevronRight />
//             </button>
//           </div>
//         )}
//       </div>

//       <Footer />
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import QRCode from "react-qr-code";
import { jsPDF } from "jspdf";
import { SketchPicker } from "react-color";
import html2canvas from "html2canvas";
import { useRef } from "react";
import "./Template1.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Template1() {

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const restaurantId = localStorage.getItem("restaurantId");
  const [setLogo] = useState(null);
  const [setLogoPreview] = useState(null);
  const cardRefs = useRef({});
  const [menuItems, setMenuItems] = useState([]);
  const [search] = useState("");
  const [categoryFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [cardColors, setCardColors] = useState({});
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const selectedTemplate = Number(localStorage.getItem("menuTemplate")) || 1;

  useEffect(() => {
    const fetchMenuItems = async () => {
      const restaurantId = localStorage.getItem("restaurantId");
      if (!restaurantId) return;

      setLoading(true);
      try {
        const res = await api.get(`/public/restaurants/${restaurantId}/menu`);
        setMenuItems(res.data);
      } catch (err) {
        console.error("Error fetching menu items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!token) {
      toast.warning("Session expired. Please login again.");
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (restaurantId && token) fetchMenuItems();
  }, [restaurantId, debouncedSearch, categoryFilter, page]);

const fetchMenuItems = async () => {
  try {
    setLoading(true);
    const params = { page, limit };
    if (debouncedSearch) params.search = debouncedSearch;
    if (categoryFilter) params.category = categoryFilter;

    const res = await api.get(`/restaurants/${restaurantId}/menu`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Response from server:", res.data);

    
    if (Array.isArray(res.data)) {
      setMenuItems(res.data);
      setTotalPages(1);
    } else {
      
      setMenuItems(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    }
  } catch (err) {
    console.error("Error fetching menu items:", err?.response?.data || err.message);
    toast.error("Error loading menu items", {
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
    });
   
  } finally {
    setLoading(false);
  }
};

const handleDownloadPDF = async (item) => {
  const cardElement = cardRefs.current[item._id];
  if (!cardElement) {
    toast.error("Card not found.");
    return;
  }

  try {
    // Optional: Hide download button during capture
    const downloadBtn = cardElement.querySelector(".btn-download");
    if (downloadBtn) downloadBtn.style.display = "none";

    const canvas = await html2canvas(cardElement, {
      scale: 2,
      useCORS: true,
    });

    if (downloadBtn) downloadBtn.style.display = "inline-block";

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.width / imgProps.height;
    const imgWidth = pdfWidth * 0.85;
    const imgHeight = imgWidth / imgRatio;

    const marginX = (pdfWidth - imgWidth) / 2;
    const marginY = 30;

    pdf.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
    pdf.save(`${item.name}_menu_card.pdf`);
  } catch (error) {
    console.error("PDF generation failed:", error);
    toast.error("Failed to generate PDF.");
  }
};

// const handleColorChange = (color, itemId) => {
//   setCardColors((prev) => ({
//     ...prev,
//     [itemId]: color.hex,
//   }));
// };
// const handleLogoChange = (e) => {
//   const file = e.target.files[0];
//   if (file) {
//     setLogo(file);
//     setLogoPreview(URL.createObjectURL(file));
//   }
// };



  return (
    <div>
      <Navbar />
   {/* <AddLogo/> */}
      <div className="menu-container">
        <h2 className="menu-heading">Menu Management</h2>
   <div style={{ textAlign: "center", marginBottom: "30px",display:"flex ", justifyContent:"center",gap:"5px" }}>
  <h2 style={{ marginBottom: "10px" }}>Scan to View Menu</h2>
  <QRCode
    value={`${window.location.origin}/view/${restaurantId}/template1`}
    size={120}
    bgColor="white"
    fgColor="black"
  />
</div>
        <div className="menu-grid">
          {loading ? (
            <p>Loading...</p>
          ) : menuItems.length === 0 ? (
            <div className="no-items">No items found</div>
          ) : (
            menuItems.map((item) => (
              <div
  key={item._id}
  ref={(el) => (cardRefs.current[item._id] = el)} // 👈 Track the card
  className="menu-card"
  style={{
    backgroundColor: "#1E2A38",
    color: "#ffffff",
    paddingBottom: "30px",
  }}
>

  {item.imageUrl ? (
    <img
    src={
      item.imageUrl.startsWith("http")
        ? item.imageUrl
        : `http://localhost:5000${item.imageUrl}`
    }
    alt={item.name}
    className="menu-img"
    style={{
      width: "100%",
      height: "150px",
      objectFit: "cover",
      borderRadius: "8px",
      marginBottom: "12px",
    }}
  />


  ) : (
    <div className="image-placeholder">No Image</div>
  )}

  {/* <h3 className="menu-title" style={{}}>{item.name}</h3>
  <p>{item.description}</p>
  <p className="menu-price">Price: ${item.price}</p>
  <p className="menu-category">Category: {item.category}</p> */}



    <h3
  
  style={{
    fontSize: "1.3rem",
    fontWeight: 600,
    color: "#ffffff",
    marginBottom: "0.5rem",
    textAlign: "center",
  }}
>
  {item.name}
</h3>

<p style={{
    fontSize: "0.95rem",
    fontWeight: 200,
    color: "#ffffff",
    marginBottom: "0.5rem",
    textAlign: "center",
  }}>{item.description}</p>
<p  style={{
    fontSize: "0.95rem",
    fontWeight: 500,
    color: "#ffffff",
    marginBottom: "0.5rem",
    textAlign: "center",
  }}>Price: ${item.price}</p>
<p  style={{
    fontSize: "0.95rem",
    fontWeight: 200,
    color: "#ffffff",
    marginBottom: "0.5rem",
    textAlign: "center",
  }}>Category: {item.category}</p>



  <button
    onClick={() => handleDownloadPDF(item)}
    className="btn-download"
    title="Download as PDF"
    
  >
    Download PDF
  </button>
   <QRCode
    value={`${window.location.origin}/view/${restaurantId}/template1`}
    size={120}
    bgColor="white"
    fgColor="black"
  />

  {/* 🎨 Color Picker Component */}
  {activeColorPicker === item._id && (
    <div style={{ marginTop: "10px" }}>
      <SketchPicker
        color={cardColors[item._id] || "#ffffff"}
        onChangeComplete={(color) => handleColorChange(color, item._id)}
      />
    </div>
  )}
</div>
            ))
          )}
        </div>
         

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <FaChevronLeft /> Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}
      </div>


      <Footer />
    </div>
  );
}






