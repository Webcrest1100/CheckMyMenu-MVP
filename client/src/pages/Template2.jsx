// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../api";
// import Navbar from "./Navbar";
// import Footer from "./Footer";
// import QRCode from "react-qr-code";
// import { jsPDF } from "jspdf";
// import {
//   FaWhatsapp,
//   FaLink,
//   FaChevronLeft,
//   FaChevronRight,
// } from "react-icons/fa";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { SketchPicker } from "react-color";
// import "./Template2.css";
// import html2canvas from "html2canvas";
// import { useRef } from "react";

// export default function Template2() {
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();
//   const restaurantId = localStorage.getItem("restaurantId");
//   const cardRefs = useRef({});

//   const [menuItems, setMenuItems] = useState([]);
//   const [search, setSearch] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(6);
//   const [totalPages, setTotalPages] = useState(1);
//   const [cardColor, setCardColor] = useState("#ffffff");
//   const [showColorPicker, setShowColorPicker] = useState(false);
//   const [confirmId, setConfirmId] = useState(null);

//   useEffect(() => {
//     const fetchMenuItems = async () => {
//       try {
//         setLoading(true);
//         const params = { page, limit };
//         if (debouncedSearch) params.search = debouncedSearch;
//         if (categoryFilter) params.category = categoryFilter;

//         const res = await api.get(`/restaurants/${restaurantId}/menu`, {
//           params,
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (Array.isArray(res.data)) {
//           setMenuItems(res.data);
//           setTotalPages(1);
//         } else {
//           setMenuItems(res.data.items || []);
//           setTotalPages(res.data.totalPages || 1);
//         }
//       } catch (err) {
//         console.error("Error fetching menu items:", err);
//         toast.error("Failed to load menu items");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (restaurantId && token) fetchMenuItems();
//   }, [restaurantId, token, debouncedSearch, categoryFilter, page]);

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       setDebouncedSearch(search.trim());
//       setPage(1);
//     }, 400);
//     return () => clearTimeout(timeout);
//   }, [search]);

//   const handleDownloadPDF = async (item) => {
//     const cardElement = cardRefs.current[item._id];
//     if (!cardElement) return toast.error("Card not found");

//     try {
//       const canvas = await html2canvas(cardElement, {
//         scale: 2,
//         useCORS: true,
//       });

//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "mm", "a4");

//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();

//       const imgProps = pdf.getImageProperties(imgData);
//       const imgRatio = imgProps.width / imgProps.height;
//       const imgWidth = pdfWidth * 0.8;
//       const imgHeight = imgWidth / imgRatio;

//       const marginX = (pdfWidth - imgWidth) / 2;
//       const marginY = 30;

//       pdf.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
//       pdf.save(`${item.name}_menu_card.pdf`);
//     } catch (err) {
//       console.error("Error generating PDF:", err);
//       toast.error("Failed to generate PDF");
//     }
//   };

//   const toBase64 = (url) =>
//     new Promise((resolve, reject) => {
//       const img = new Image();
//       img.crossOrigin = "Anonymous";
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         canvas.width = img.width;
//         canvas.height = img.height;
//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(img, 0, 0);
//         resolve(canvas.toDataURL("image/jpeg"));
//       };
//       img.onerror = reject;
//       img.src = url;
//     });

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
//   };

//   const confirmDelete = async () => {
//     try {
//       await api.delete(`/restaurants/${restaurantId}/menu/${confirmId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMenuItems((prev) => prev.filter((i) => i._id !== confirmId));
//       toast.success("Item deleted");
//     } catch (err) {
//       toast.error("Delete failed");
//     } finally {
//       setConfirmId(null);
//     }
//   };

//   return (
//     <div>
//       <Navbar />
//       <div className="menu-container">
//         <h2 className="menu-heading">Menu Management</h2>

//         <div className="menu-grid">
//           {loading ? (
//             <p>Loading...</p>
//           ) : menuItems.length === 0 ? (
//             <div>No items found</div>
//           ) : (
//             menuItems.map((item) => (
//               <div
//                 key={item._id}
//                 ref={(el) => (cardRefs.current[item._id] = el)}
//                 className="menu-card"
//                 style={{
//                   border: "1px solid #ccc",
//                   borderRadius: "10px",
//                   padding: "16px",
//                   marginBottom: "20px",
//                   backgroundColor: "#fff",
//                   boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                   maxWidth: "400px",
//                   cursor: "pointer",
//                   transition: "all 0.3s ease",
//                 }}
//               >
//                 <h3 className="menu-title">{item.name}</h3>
//                 <p>{item.description}</p>
//                 <p className="menu-price">Price: ${item.price}</p>
//                 <p className="menu-category">Category: {item.category}</p>

//                 <QRCode
//                   id={`qr-${item._id}`}
//                   style={{ marginBottom: "10px" }}
//                   size={80}
//                   value={`${window.location.origin}/view/${restaurantId}/template2`}
//                 />

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
//                 <button
//                   onClick={() => handleDownloadPDF(item)}
//                   className="btn-download"
//                   style={{
//                     backgroundColor: "#1E2A38",
//                     color: "#fff",
//                     border: "none",
//                     padding: "0.4rem 0.8rem",
//                     borderRadius: "6px",
//                     fontWeight: "500",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Download PDF
//                 </button>
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

//         {confirmId && (
//           <div className="modal-overlay">
//             <div className="modal-box">
//               <p>Are you sure you want to delete this item?</p>
//               <button onClick={confirmDelete} className="btn-confirm">
//                 Yes
//               </button>
//               <button onClick={() => setConfirmId(null)} className="btn-cancel">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//       <Footer />
//       <ToastContainer />
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
  import { FaWhatsapp, FaLink, FaChevronLeft, FaChevronRight } from "react-icons/fa";
  import { ToastContainer, toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import { SketchPicker } from "react-color";
  import "./Template2.css";
  import html2canvas from "html2canvas";
import { useRef } from "react";


  export default function Template2() {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const restaurantId = localStorage.getItem("restaurantId");
const cardRefs = useRef({});

    const [menuItems, setMenuItems] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const [cardColor, setCardColor] = useState("#ffffff");
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [confirmId, setConfirmId] = useState(null);

    useEffect(() => {
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

          if (Array.isArray(res.data)) {
            setMenuItems(res.data);
            setTotalPages(1);
          } else {
            setMenuItems(res.data.items || []);
            setTotalPages(res.data.totalPages || 1);
          }
        } catch (err) {
          console.error("Error fetching menu items:", err);
          toast.error("Failed to load menu items");
        } finally {
          setLoading(false);
        }
      };

      if (restaurantId && token) fetchMenuItems();
    }, [restaurantId, token, debouncedSearch, categoryFilter, page]);

    useEffect(() => {
      const timeout = setTimeout(() => {
        setDebouncedSearch(search.trim());
        setPage(1);
      }, 400);
      return () => clearTimeout(timeout);
    }, [search]);

//     const handleDownloadPDF = async (item) => {
//   const cardElement = cardRefs.current[item._id];
//   if (!cardElement) return toast.error("Card not found");

//   try {
//     const btn = cardElement.querySelector('.btn-download');
// btn.style.visibility = 'hidden';
//     const canvas = await html2canvas(cardElement, {
//       scale: 2,
//       useCORS: true,
//     });

//     btn.style.visibility = '';

//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");

//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = pdf.internal.pageSize.getHeight();

//     const imgProps = pdf.getImageProperties(imgData);
//     const imgRatio = imgProps.width / imgProps.height;
//     const imgWidth = pdfWidth * 0.8;
//     const imgHeight = imgWidth / imgRatio;

//     const marginX = (pdfWidth - imgWidth) / 2;
//     const marginY = 30;

//     pdf.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
//     pdf.save(`${item.name}_menu_card.pdf`);
//   } catch (err) {
//     console.error("Error generating PDF:", err);
//     toast.error("Failed to generate PDF");
//   }
// };


    // const toBase64 = (url) =>
    //   new Promise((resolve, reject) => {
    //     const img = new Image();
    //     img.crossOrigin = "Anonymous";
    //     img.onload = () => {
    //       const canvas = document.createElement("canvas");
    //       canvas.width = img.width;
    //       canvas.height = img.height;
    //       const ctx = canvas.getContext("2d");
    //       ctx.drawImage(img, 0, 0);
    //       resolve(canvas.toDataURL("image/jpeg"));
    //     };
    //     img.onerror = reject;
    //     img.src = url;
    //   });


  const handleDownloadPDF = async (item) => {
  const cardElement = cardRefs.current[item._id];
  if (!cardElement) return toast.error("Card not found");

  try {
    const downloadBtn = cardElement.querySelector('.btn-download');
    if (downloadBtn) downloadBtn.style.visibility = 'hidden';

    // Force width for accurate rendering
    const originalWidth = cardElement.style.width;
    cardElement.style.width = "600px";
    await new Promise((r) => setTimeout(r, 100));

    // Capture the entire card as it appears
    const canvas = await html2canvas(cardElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    cardElement.style.width = originalWidth;
    if (downloadBtn) downloadBtn.style.visibility = '';

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
  } catch (err) {
    console.error("Error generating PDF:", err);
    toast.error("Failed to generate PDF");
  }
};






    return (
      <div style={{overflowX:"hidden"}}>
        <Navbar />
        <div className="menu-container">
          <h2 className="menu-heading">Menu Management</h2>
          <div className="menu-grid">
            {loading ? (
              <p>Loading...</p>
            ) : menuItems.length === 0 ? (
              <div>No items found</div>
            ) : (
              menuItems.map((item) => (
                <div
  key={item._id}
  ref={(el) => (cardRefs.current[item._id] = el)}
  className="menu-card"
  style={{
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "20px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    cursor: "pointer",
     width:"100%",
    transition: "all 0.3s ease",
  }}
>
                  <h3 style={{textAlign: "center",
    width:"90%",
    wordWrap: "break-word"}} className="menu-title">{item.name}</h3>
                  <p style={{textAlign: "center",
    width:"90%",
    wordWrap: "break-word"}}>{item.description}</p>
                  <p  style={{textAlign: "center",
    width:"90%",
    wordWrap: "break-word"}}className="menu-price">Price: ${item.price}</p>
                  <p style={{textAlign: "center",
    width:"90%",
    wordWrap: "break-word"}} className="menu-category">Category: {item.category}</p>

                  <QRCode id={`qr-${item._id}`} style={{marginBottom:"10px"}} size={80} 
                  value={`${window.location.origin}/view/${restaurantId}/template2`} />
                    
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
      backgroundSize: "cover",
      backgroundPosition: "center",
      borderRadius: "8px",
      marginBottom: "12px",
    }}
  />
                  ) : (
                    <div className="image-placeholder">No Image</div>
                  )}
<button
  onClick={() => handleDownloadPDF(item)}
  className="btn-download"
  style={{
    backgroundColor: "#1E2A38",
    color: "#fff",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    fontWeight: "500",
    cursor: "pointer"
  }}
>
  Download PDF
</button>

                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                <FaChevronLeft /> Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
                Next <FaChevronRight />
              </button>
            </div>
          )}

          {confirmId && (
            <div className="modal-overlay">
              <div className="modal-box">
                <p>Are you sure you want to delete this item?</p>
                <button onClick={confirmDelete} className="btn-confirm">Yes</button>
                <button onClick={() => setConfirmId(null)} className="btn-cancel">Cancel</button>
              </div>
            </div>
          )}
        </div>
        <Footer />
        <ToastContainer />
      </div>
    );
  }

