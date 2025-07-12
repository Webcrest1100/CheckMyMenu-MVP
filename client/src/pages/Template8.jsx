// import { useEffect, useState } from "react";
// import { api } from "../api";
// import Navbar from "./Navbar";
// import Footer from "./Footer";
// import { useTheme } from "./ThemeContext";
// import { FaDownload } from "react-icons/fa";
// import QRCode from "react-qr-code";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function MasonryMenu() {
//   const { dark } = useTheme();
//   const [menuItems, setMenuItems] = useState([]);
//   const restaurantId = localStorage.getItem("restaurantId");
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchMenuItems = async () => {
//       try {
//         const res = await api.get(`/restaurants/${restaurantId}/menu`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setMenuItems(res.data);
//       } catch (err) {
//         toast.error("Failed to fetch menu items");
//       }
//     };
//     fetchMenuItems();
//   }, [restaurantId, token]);

//   return (
//     <div style={{ background: dark ? "#1E2A38" : "#f8f9fa", minHeight: "100vh" }}>
//       <Navbar />
//       <main style={{ padding: "40px 20px" }}>
//         <h2 style={{ textAlign: "center", color: dark ? "#fff" : "#343a40" }}>
//           Masonry Layout Menu
//         </h2>
//         <div className="masonry-grid">
//           {menuItems.map((item) => (
//             <div className="masonry-item" key={item._id}>
//               <img
//                 src={item.imageUrl.startsWith("http") ? item.imageUrl : `http://localhost:5000${item.imageUrl}`}
//                 alt={item.name}
//                 style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }}
//               />
//               <h3>{item.name}</h3>
//               <p>{item.description}</p>
//               <strong style={{ color: "#28A745" }}>${item.price.toFixed(2)}</strong>
//               <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                 <span>{item.category}</span>
//                 <button className="download-btn">
//                   <FaDownload /> PDF
//                 </button>
//               </div>
//               <div style={{ marginTop: "10px", textAlign: "center" }}>
//                 <QRCode
//                   size={80}
//                   value={`${window.location.origin}/view/${restaurantId}/masonry`}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </main>
//       <ToastContainer position="top-right" autoClose={3000} />
//       <Footer />

//       {/* Inline CSS for Masonry */}
//       <style jsx>{`
//         .masonry-grid {
//           column-count: 3;
//           column-gap: 16px;
//           margin-top: 40px;
//         }
//         .masonry-item {
//           break-inside: avoid;
//           margin-bottom: 16px;
//           background: ${dark ? "#121212" : "#fff"};
//           padding: 15px;
//           border-radius: 8px;
//           box-shadow: 0 4px 8px rgba(0,0,0,0.2);
//           transition: transform 0.3s ease;
//         }
//         .masonry-item:hover {
//           transform: scale(1.02);
//         }
//         .download-btn {
//           background-color: #FFC107;
//           border: none;
//           color: white;
//           padding: 5px 10px;
//           cursor: pointer;
//           border-radius: 4px;
//           display: flex;
//           align-items: center;
//           gap: 5px;
//         }
//         @media (max-width: 992px) {
//           .masonry-grid {
//             column-count: 2;
//           }
//         }
//         @media (max-width: 600px) {
//           .masonry-grid {
//             column-count: 1;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { api } from "../api";
// import Navbar from "./Navbar";
// import Footer from "./Footer";
// import { useTheme } from "./ThemeContext";
// import { FaDownload } from "react-icons/fa";
// import QRCode from "react-qr-code";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";



// export default function Template8() {
//   const { dark } = useTheme();
//   const [menuItems, setMenuItems] = useState([]);
//   const restaurantId = localStorage.getItem("restaurantId");
//   const token = localStorage.getItem("token");
//   useEffect(() => {
//     const fetchMenuItems = async () => {
//       try {
//         const res = await api.get(`/restaurants/${restaurantId}/menu`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setMenuItems(res.data);
//       } catch (err) {
//         toast.error("Failed to fetch menu items");
//       }
//     };
//     fetchMenuItems();
//   }, [restaurantId, token]);
//   return (
//     <div style={{ background: dark ? "#1E2A38" : "#f8f9fa", minHeight: "100vh" }}>
//       <Navbar />
//       <main style={{ padding: "40px 20px" }}>
//         <h2 style={{ textAlign: "center", color: dark ? "#fff" : "#343a40" }}>
//           Masonry Layout Menu
//         </h2>
//         <div className="masonry-grid">
//           {menuItems.map((item) => (
//             <div className="masonry-item" key={item._id}>
//               <img
//                 src={item.imageUrl.startsWith("http") ? item.imageUrl : `http://localhost:5000${item.imageUrl}`}
//                 alt={item.name}
//                 style={{ width: "100%", borderRadius: "8px", marginBottom: "10px" }}
//               />
//               <h3>{item.name}</h3>
//               <p>{item.description}</p>
//               <strong style={{ color: "#28A745" }}>${item.price.toFixed(2)}</strong>
//               <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                 <span>{item.category}</span>
//                 <button className="download-btn">
//                   <FaDownload /> PDF
//                 </button>
//               </div>
//               <div style={{ marginTop: "10px", textAlign: "center" }}>
//                 <QRCode
//                   size={80}
//                   value={`${window.location.origin}/view/${restaurantId}/masonry`}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </main>
//       <ToastContainer position="top-right" autoClose={3000} />
//       <Footer />
//       {/* Inline CSS for Masonry */}
//       <style jsx>{`
//         .masonry-grid {
//           column-count: 3;
//           column-gap: 16px;
//           margin-top: 40px;
//         }
//         .masonry-item {
//           break-inside: avoid;
//           margin-bottom: 16px;
//           background: ${dark ? "#121212" : "#fff"};
//           padding: 15px;
//           border-radius: 8px;
//           box-shadow: 0 4px 8px rgba(0,0,0,0.2);
//           transition: transform 0.3s ease;
//         }
//         .masonry-item:hover {
//           transform: scale(1.02);
//         }
//         .download-btn {
//           background-color: #FFC107;
//           border: none;
//           color: white;
//           padding: 5px 10px;
//           cursor: pointer;
//           border-radius: 4px;
//           display: flex;
//           align-items: center;
//           gap: 5px;
//         }
//         @media (max-width: 992px) {
//           .masonry-grid {
//             column-count: 2;
//           }
//         }
//         @media (max-width: 600px) {
//           .masonry-grid {
//             column-count: 1;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }







import { useEffect, useState } from "react";
import { api } from "../api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useTheme } from "./ThemeContext";
import { FaDownload } from "react-icons/fa";
import QRCode from "react-qr-code";
import { toast, ToastContainer } from "react-toastify";
import { jsPDF } from "jspdf";
import "react-toastify/dist/ReactToastify.css";
import html2canvas from "html2canvas";
import { useRef } from "react";

// Utility to convert image URL to base64
const convertImageToDataURL = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = reject;
    img.src = url;
  });

export default function MasonryMenu() {
  const { dark } = useTheme();
  const [menuItems, setMenuItems] = useState([]);
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");
  const cardRefs = useRef({});


  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const res = await api.get(`/restaurants/${restaurantId}/menu`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenuItems(res.data);
      } catch (err) {
        toast.error("Failed to fetch menu items");
      }
    };
    fetchMenuItems();
  }, [restaurantId, token]);

  

// const handleDownloadPDF = async (item) => {
//   const element = cardRefs.current[item._id];
//   if (!element) return toast.error("Card not found for PDF");

//   try {
//     // Wait briefly to ensure image is fully rendered
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     const canvas = await html2canvas(element, {
//       scale: 2,
//       useCORS: true, // critical for image rendering
//     });

//     const imgData = canvas.toDataURL("image/png");

//     const pdf = new jsPDF("p", "pt", "a4");
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();

//     const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
//     const imgWidth = canvas.width * ratio;
//     const imgHeight = canvas.height * ratio;
//     const x = (pageWidth - imgWidth) / 2;
//     const y = 40;

//     pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
//     pdf.save(`${item.name}_menu_card.pdf`);
//   } catch (error) {
//     console.error("PDF download error:", error);
//     toast.error("Failed to generate PDF");
//   }
// };



// const handleDownloadPDF = async (item) => {
//   const element = cardRefs.current[item._id];
//   if (!element) return toast.error("Card not found for PDF");

//   const qrDiv = element.querySelector(".qr-container");
//   const downloadBtn = element.querySelector(".download-btn");

//   const originalMarginBottom = qrDiv?.style.marginBottom || "";
//   const originalBtnDisplay = downloadBtn?.style.display || "";

//   try {
//     // Hide the download button
//     if (downloadBtn) downloadBtn.style.display = "none";

//     // Adjust QR layout spacing temporarily
//     if (qrDiv) qrDiv.style.marginBottom = "50px";

//     // Allow DOM to update
//     await new Promise((resolve) => setTimeout(resolve, 300));

//     const canvas = await html2canvas(element, {
//       scale: 3,
//       useCORS: true,
//       backgroundColor: null,
//     });

//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "pt", "a4");
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();

//     const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
//     const imgWidth = canvas.width * ratio;
//     const imgHeight = canvas.height * ratio;

//     const x = (pageWidth - imgWidth) / 2;
//     const y = 40;

//     // 🟢 Ensure bottom margin for QR
//     const maxHeight = pageHeight - 70; // leave 30px bottom margin
//     const finalHeight = imgHeight > maxHeight ? maxHeight : imgHeight;

//     pdf.addImage(imgData, "PNG", x, y, imgWidth, finalHeight, undefined, "FAST");
//     pdf.save(`${item.name}_menu_card.pdf`);
//   } catch (error) {
//     console.error("PDF download error:", error);
//     toast.error("Failed to generate PDF");
//   } finally {
//     // Restore original styles
//     if (qrDiv) qrDiv.style.marginBottom = originalMarginBottom;
//     if (downloadBtn) downloadBtn.style.display = originalBtnDisplay;
//   }
// };



const handleDownloadPDF = async (item) => {
  const element = cardRefs.current[item._id];
  if (!element) return toast.error("Card not found for PDF");

  const qrDiv = element.querySelector(".qr-container");
  const downloadBtn = element.querySelector(".download-btn");

  const originalMarginBottom = qrDiv?.style.marginBottom || "";
  const originalBtnDisplay = downloadBtn?.style.display || "";

  try {
    // Hide the download button
    if (downloadBtn) downloadBtn.style.display = "none";

    // Adjust QR margin temporarily
    if (qrDiv) qrDiv.style.marginBottom = "50px";

    // Wait for layout to update
    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });

    // Crop only the image portion from the canvas (optional enhancement)
    const fullImgData = canvas.toDataURL("image/png");

    // Create PDF
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 🟩 Fix image height to 250px
    const fixedHeight = 250;

    // 🟩 Calculate image width based on canvas aspect ratio
    const aspectRatio = canvas.width / canvas.height;
    const computedWidth = fixedHeight * aspectRatio;

    // 🟩 Ensure it fits within page width
     const imgHeight = 550;
    const maxWidth = pageWidth - 80 ; // 40px padding each side
    
    const imgWidth = 350;
   



     

    const x = (pageWidth - imgWidth) / 2;
    const y = 40;

    pdf.addImage(fullImgData, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(`${item.name}_menu_card.pdf`);
  } catch (error) {
    console.error("PDF download error:", error);
    toast.error("Failed to generate PDF");
  } finally {
    // Restore original styles
    if (qrDiv) qrDiv.style.marginBottom = originalMarginBottom;
    if (downloadBtn) downloadBtn.style.display = originalBtnDisplay;
  }
};












  return (
    <div style={{ background: dark ? "#1E2A38" : "#f8f9fa", minHeight: "100vh" ,fontFamily:"Montserrat"}}>
      <Navbar />
      <main style={{ padding: "40px 20px" }}>
        <h2 style={{ textAlign: "center", color: dark ? "#fff" : "#343a40" }}>
          Masonry Layout Menu
        </h2>
        <div className="masonry-grid">
          {menuItems.map((item) => (
            <div
  className="masonry-item"
  key={item._id}
  ref={(el) => (cardRefs.current[item._id] = el)}
>

              <img
              crossOrigin="anonymous"
                src={item.imageUrl.startsWith("http") ? item.imageUrl : `http://localhost:5000${item.imageUrl}`}
                alt={item.name}
                style={{
      width: "100%",
      height: "250px",
      objectFit: "cover",
      borderRadius: "8px",
      marginBottom: "12px",
    }}  
              />
              
              <h3 style={{width:"90%", textAlign: "left",  wordWrap: "break-word"}}>{item.name}</h3>
              <p style={{width:"100%", textAlign: "left", paddingTop: "10px" , paddingBottom: "10px" , wordWrap: "break-word"}}>{item.description}</p>
              <strong style={{ color: "#28A745" }}>${item.price.toFixed(2)}</strong>
              <div style={{
                marginTop: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "left",
                width:"100%",
              }}>
                <span style={{width:"70%",wordWrap: "break-word"}}>{item.category}</span>
                <button style={{width:"30%"}} className="download-btn" onClick={() => handleDownloadPDF(item)}>
                  <FaDownload /> PDF
                </button>
              </div>
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                <QRCode
                  size={80}
                  value={`${window.location.origin}/view/${restaurantId}/masonry`}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
      <Footer />

      {/* Inline CSS for Masonry */}
      <style jsx>{`
        .masonry-grid {
          column-count: 3;
          column-gap: 16px;
          margin-top: 40px;
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 16px;
          background: ${dark ? "#121212" : "#fff"};
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          transition: transform 0.3s ease;
        }
        .masonry-item:hover {
          transform: scale(1.02);
        }
        .download-btn {
          background-color: #FFC107;
          border: none;
          color: white;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        @media (max-width: 992px) {
          .masonry-grid {
            column-count: 2;
          }
        }
        @media (max-width: 600px) {
          .masonry-grid {
            column-count: 1;
          }
        }
      `}</style>
    </div>
  );
}
