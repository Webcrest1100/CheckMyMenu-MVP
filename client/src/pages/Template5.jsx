
// "use client";
// import { useEffect, useState, useRef } from "react";
// import { api } from "../api";
// import Navbar from "./Navbar";
// import Footer from "./Footer";
// import { useTheme } from "./ThemeContext";
// import { jsPDF } from "jspdf";
// import QRCode from "react-qr-code";
// import { FaFacebookF, FaTwitter, FaWhatsapp, FaInstagram, FaLinkedinIn, FaLink, FaEdit, FaTrash, FaDownload } from "react-icons/fa";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./Menu.css";
// import { SketchPicker } from "react-color";
// import { FaPalette } from "react-icons/fa"; // Tiny color picker icon


// export default function Template5() {
//   const { dark } = useTheme();
//   const [menuItems, setMenuItems] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [newItem, setNewItem] = useState({ name: "", description: "", price: "", category: "", image: null });
//   const [editForm, setEditForm] = useState({ name: "", description: "", price: "", category: "", image: null });
//   const [editingItem, setEditingItem] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [editImagePreview, setEditImagePreview] = useState(null);
//   const scrollContainerRef = useRef(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [startX, setStartX] = useState(0);
//   const [scrollLeft, setScrollLeft] = useState(0);
//   const [searchTerm, setSearchTerm] = useState("");
//   const restaurantId = localStorage.getItem("restaurantId");
//   const token = localStorage.getItem("token");
//   const [expandedCard, setExpandedCard] = useState(null);
//   const [cardColors, setCardColors] = useState({});
// const [activeColorPicker, setActiveColorPicker] = useState(null);
// const [cardFonts, setCardFonts] = useState({});
// const fontOptions = [
//   "Arial, sans-serif",
//   "'Times New Roman', serif",
//   "'Courier New', monospace",
//   "'Comic Sans MS', cursive",
//   "'Georgia', serif"
// ];



//   useEffect(() => {
//     const fetchMenuItems = async () => {
//       try {
//         if (!restaurantId) return;
//         const res = await api.get(`/restaurants/${restaurantId}/menu`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setMenuItems(res.data);
//       } catch (err) {
//         console.error("Failed to fetch menu items:", err);
//       }
//     };
//     fetchMenuItems();
//   }, [restaurantId, token]);

//   const handleMouseDown = (e) => {
//     setIsDragging(true);
//     setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
//     setScrollLeft(scrollContainerRef.current.scrollLeft);
//   };
//   const handleMouseLeave = () => setIsDragging(false);
//   const handleMouseUp = () => setIsDragging(false);
//   const handleMouseMove = (e) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     const x = e.pageX - scrollContainerRef.current.offsetLeft;
//     const walk = (x - startX) * 1.5;
//     scrollContainerRef.current.scrollLeft = scrollLeft - walk;
//   };

//   const scrollLeftFn = () => scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
//   const scrollRightFn = () => scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     setNewItem({ ...newItem, image: file });
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleEditImageChange = (e) => {
//     const file = e.target.files[0];
//     setEditForm({ ...editForm, image: file });
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setEditImagePreview(reader.result);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleStartEdit = (item) => {
//     setEditingItem(item);
//     setEditForm({
//       name: item.name,
//       description: item.description,
//       price: item.price,
//       category: item.category,
//       image: null,
//     });
//     const imageUrl = item.imageUrl?.startsWith("http") ? item.imageUrl : `http://localhost:5000${item.imageUrl}`;
//     setEditImagePreview(imageUrl);
//     setShowEditModal(true);
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();
//       Object.entries(editForm).forEach(([key, val]) => {
//         if (val) formData.append(key, val);
//       });
//       const res = await api.put(`/restaurants/${restaurantId}/menu/${editingItem._id}`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       setMenuItems((prev) => prev.map((item) => (item._id === editingItem._id ? res.data : item)));
//       setEditingItem(null);
//       setShowEditModal(false);
//     } catch (err) {
//       toast.error("Failed to update item");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!newItem.name || !newItem.price) {
//       toast.error("Name and price are required");
//       return;
//     }
//     try {
//       const formData = new FormData();
//       Object.entries(newItem).forEach(([key, val]) => {
//         if (val) formData.append(key, val);
//       });
//       const res = await api.post(`/restaurants/${restaurantId}/menu`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       setMenuItems([...menuItems, res.data]);
//       setNewItem({ name: "", description: "", price: "", category: "", image: null });
//       setImagePreview(null);
//       setShowAddModal(false);
//     } catch (err) {
//       toast.error("Failed to add item");
//     }
//   };

//   const handleDeleteItem = async (id) => {
//     try {
//       await api.delete(`/restaurants/${restaurantId}/menu/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMenuItems((prev) => prev.filter((item) => item._id !== id));
//     } catch {
//       toast.error("Failed to delete item");
//     }
//   };

//   const convertImageToDataURL = (src) => new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       canvas.width = img.naturalWidth;
//       canvas.height = img.naturalHeight;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(img, 0, 0);
//       resolve(canvas.toDataURL("image/jpeg"));
//     };
//     img.onerror = reject;
//     img.src = src + (src.includes("?") ? "&" : "?") + "cacheBust=" + Date.now();
//   });

//   const convertSVGToPNG = (svgElement) => new Promise((resolve, reject) => {
//     const svg = new XMLSerializer().serializeToString(svgElement);
//     const svgBase64 = `data:image/svg+xml;base64,${btoa(svg)}`;
//     const img = new Image();
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(img, 0, 0);
//       resolve(canvas.toDataURL("image/png"));
//     };
//     img.onerror = reject;
//     img.src = svgBase64;
//   });

//   const handleDownloadPDF = async (item) => {
//   const doc = new jsPDF("p", "pt", "a4");
//   const pagePadding = 40;
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const cardWidth = pageWidth - pagePadding * 2;

//   let y = pagePadding;

//   // Load main image
//   const imageUrl = item.imageUrl?.startsWith("http") ? item.imageUrl : `http://localhost:5000${item.imageUrl}`;
//   let imageDataURL;
//   try {
//     imageDataURL = await convertImageToDataURL(imageUrl);
//   } catch {
//     toast.error("Failed to load item image");
//     return;
//   }

//   // Get QR
//   let qrDataURL = null;
//   const qrElement = document.getElementById(`qr-${item._id}`);
//   if (qrElement) {
//     try {
//       qrDataURL = await convertSVGToPNG(qrElement);
//     } catch {
//       toast.error("Failed to load QR code");
//     }
//   }

//   // Card background
//   const cardColor = cardColors[item._id] || "#ffffff";
//   doc.setFillColor(cardColor);
//   doc.roundedRect(pagePadding, y, cardWidth, 480, 12, 12, "F");

//   y += 20;

//   // Image
//    // --- Title Row: Name + QR code (above image) ---
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(26);
//   doc.setTextColor(30, 30, 30);
//   doc.text(item.name, pagePadding + 20, y); // Name on left

//   if (qrDataURL) {
//     doc.addImage(qrDataURL, "PNG", pageWidth - pagePadding - 90, y - 10, 80, 80); // QR on right
//   }

//   y += 80 + 20;  // Move down by QR height + gap

//   // --- Image ---
//   doc.addImage(imageDataURL, "JPEG", pagePadding + 10, y, cardWidth - 20, 150);
//   y += 150 + 20;  // image height + spacing


//   // Divider
//   doc.setDrawColor(150);
//   doc.setLineWidth(1);
//   doc.line(pagePadding + 10, y, pagePadding + cardWidth - 10, y);
//   y += 20;

//   // Category + Price
//   doc.setFontSize(14);
//   doc.setTextColor(80, 80, 80);
//   doc.text(`Category: ${item.category}`, pagePadding + 20, y);

//   doc.setFont("helvetica", "bold");
//   doc.setTextColor(40, 167, 69); // emerald green
//   const price = `$${item.price.toFixed(2)}`;
//   const priceWidth = doc.getTextWidth(price);
//   doc.text(price, pagePadding + cardWidth - 20 - priceWidth, y);

//   y += 25;

//   // Divider
//   doc.setDrawColor(150);
//   doc.line(pagePadding + 10, y, pagePadding + cardWidth - 10, y);
//   y += 20;

//   // Description
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(12);
//   doc.setTextColor(60, 60, 60);
//   doc.text("Description:", pagePadding + 20, y);
//   y += 18;

//   const desc = item.description || "-";
//   const descLines = doc.splitTextToSize(desc, cardWidth - 40);
//   doc.text(descLines, pagePadding + 20, y);

//   // Final save
//   doc.save(`${item.name}_menu_card.pdf`);
// };


//   const filteredItems = menuItems.filter((item) =>
//     item.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const toggleCardExpand = (itemId) => {
//     setExpandedCard(expandedCard === itemId ? null : itemId);
//   };

//   const dynamicStyles = getStyles(dark);


//   const handleCardColorChange = (itemId, color) => {
//   setCardColors((prev) => ({ ...prev, [itemId]: color.hex }));
// };

// const handleCardFontChange = (itemId, font) => {
//   setCardFonts((prev) => ({ ...prev, [itemId]: font }));
// };

//   return (
//     <div style={{ background: dark ? "#1E2A38" : "#f8f9fa", minHeight: "100vh" }}>
//       <Navbar />
      
      






//            <main style={{ padding: "40px 20px" }}>
//   <h2 style={{ textAlign: "center", color: dark ? "#fff" : "#343a40" }}>Menu Items</h2>

 

//   {filteredItems.length > 0 ? (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         userSelect: "none",
//       }}
//     >
//       {filteredItems.length >= 3 && (
//         <button className="scroll-button" onClick={scrollLeftFn}>
//           ←
//         </button>
//       )}

//       <div
//         ref={scrollContainerRef}
//         onMouseDown={handleMouseDown}
//         onMouseLeave={handleMouseLeave}
//         onMouseUp={handleMouseUp}
//         onMouseMove={handleMouseMove}
//         className="menu-card-list"
//         style={{
//           display: "flex",
//           overflowX: "hidden",
//           gap: "20px",
//           cursor: isDragging ? "grabbing" : "grab",
//           padding: "10px",
//         }}
//       >
//        {filteredItems.map((item) => (
//   <div
//     className="menu-card" 
//     key={item._id}
//     onClick={() => toggleCardExpand(item._id)}
//     style={{
//       border: "1px solid #ccc",
//       borderRadius: "10px",
//       padding: "16px",
//       marginBottom: "20px",
//        backgroundColor: cardColors[item._id] || "#fff",
//       boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//       maxWidth: "400px",
//       cursor: "pointer",
//       transition: "all 0.3s ease",
//       transform: expandedCard === item._id ? "scale(1.05)" : "scale(1)",
//       zIndex: expandedCard === item._id ? 10 : 1,
//       position: "relative",
//       ...(expandedCard === item._id && {
//         boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
//       })
//     }}
//   >
//     {/* <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
//   <label htmlFor={`font-select-${item._id}`} style={{ fontSize: "12px" }}>Font:</label>
//   <select
//     id={`font-select-${item._id}`}
//     value={cardFonts[item._id] || fontOptions[0]}
//     onChange={(e) => handleCardFontChange(item._id, e.target.value)}
//     style={{
//       padding: "4px 6px",
//       borderRadius: "6px",
//       fontSize: "12px",
//       cursor: "pointer"
//     }}
//   >
//     {fontOptions.map((font, idx) => (
//       <option key={idx} value={font} style={{ fontFamily: font }}>
//         {font.split(",")[0].replace(/['"]/g, '')}
//       </option>
//     ))}
//   </select>
// </div> */}



// <div
//     style={{
//       display: "flex",
//       justifyContent: "space-between",
//       alignItems: "center",
//       width:"80%",
//       marginBottom: "20px",
//       marginTop:"20px",
      
//     }}
//   >

    
//     {/* <div style={{ display: "flex", justifyContent: "center", marginTop: "45px" }}>
//   <FaPalette
//     size={25}
//     style={{ cursor: "pointer" }}
//     onClick={(e) => {
//       e.stopPropagation();
//       setActiveColorPicker(activeColorPicker === item._id ? null : item._id);
//     }}
//     title="Customize Card Color"
//   />
// </div>
// {activeColorPicker === item._id && (
//   <div style={{  top: "40px", right: "10px", zIndex: 999 }}>
//     <SketchPicker
//       color={cardColors[item._id] || "#fff"}
//       onChangeComplete={(color) => handleCardColorChange(item._id, color)}
//     />
//   </div>
// )} */}


    
   
//   </div>



//  <button
//     onClick={() => handleDownloadPDF(item)}
//     className="btn-download"
//     title="Download as PDF"
//     style={{
//       marginBottom: "0px",
//       backgroundColor: "#FFC107",
//       color: "#ffff",
//       padding: "5px",
//       border: "none",
//       borderRadius: "6px",
//       cursor: "pointer",
//       display: "flex",
//       alignItems: "center",
//       gap: "02px",
//       fontSize:"12px",
//       alignContent:"end",
//       justifyContent:"end",
//       marginTop:"-20px",
//     }}
//   >
//     <FaDownload /> Download PDF
//   </button>
    
   

// <div
//     style={{
//       display: "flex",
//       justifyContent: "space-between",
//       alignItems: "center",
//       width:"100%",
//       marginBottom: "20px",
//       marginTop:"20px",
      
//     }}
//   >
//    <div style={{ fontFamily: cardFonts[item._id] || fontOptions[0] }}>
//     <h4  style={{
//       margin: 0,
//       fontSize: "40px",
//       textAlign: "left",
//       alignSelf: "flex-end", // ensures heading sticks to top
//     }}>{item.name}</h4>
//     </div>
   
   
   
//     <QRCode
//       id={`qr-${item._id}`}
//       size={80}
//       bgColor="white"
//       fgColor="black"
      
//       value={`${window.location.origin}/view/${restaurantId}/template5`}
//     />
//   </div>



//   <img
//     src={
//       item.imageUrl.startsWith("http")
//         ? item.imageUrl
//         : `http://localhost:5000${item.imageUrl}`
//     }
//     alt={item.name}
//     className="menu-img"
//     style={{
//       width: "100%",
//       height: "150px",
//       objectFit: "cover",
//       borderRadius: "8px",
//       marginBottom: "12px",
//     }}
//   />

//   {/* Row 1: Name + QR */}
  




//   {/* Divider */}
// <div
//   style={{
//     width: "100%",
//     height: "2px",
//     backgroundColor: "#999", // darker than #ccc
//     margin: "10px 0",
//     borderRadius: "2px",
//   }}
// />


//   <div style={{ fontFamily: cardFonts[item._id] || fontOptions[0] }}>
//   <div
//     style={{
//       display: "flex",
//       justifyContent: "space-between",
//       alignItems: "center",
//       marginBottom: "10px",
//       marginTop:"0px",
//       gap:"100px",
//     }}
//   >
//     <p
//       style={{
//         margin: 0,
//         fontWeight: "bold",
//         color: "#555",
//       }}
//     >
//       Category: {item.category}
//     </p>
//     <strong style={{ color: "#28A745" }}>${item.price.toFixed(2)}</strong>
//   </div>
//   </div>

//   {/* Divider */}
// <div
//   style={{
//     width: "100%",
//     height: "2px",
//     backgroundColor: "#999", // darker than #ccc
//    marginBottom:"20px",
//     borderRadius: "2px",
//   }}
// />


//   {/* Row 3: Description */}
//   <div style={{ fontFamily: cardFonts[item._id] || fontOptions[0] }}>
//   <p style={{ marginBottom: "0px", color: "#444" }}>{item.description}</p>
//   </div>
  








//   {/* PDF Download */}
  

//   {/* Edit / Delete Buttons */}
 
// </div>
//         ))}
//       </div>

//       {filteredItems.length >= 3 && (
//         <button className="scroll-button" onClick={scrollRightFn}>
//           →
//         </button>
//       )}
//     </div>
//   ) : (
//     <p style={{ textAlign: "center", marginTop: "40px" }}>
//       No menu items found.
//     </p>
//   )}
// </main>


















 











      
//       <ToastContainer position="top-right" autoClose={3000} />
//       <Footer />
//     </div>
//   );
// }

// function getStyles(dark) {
//   return {
//     input: {
//       padding: "10px",
//       borderRadius: "8px",
//       border: `1px solid ${dark ? "#3a3a3a" : "#ccc"}`,
//       width: "80%",
//       maxWidth: "400px",
//       outline: "none",
//       fontSize: "16px",
//       backgroundColor: dark ? "#1E2A38" : "#F8F9FA",
//       color: dark ? "#fff" : "#000",
//     },
//     form: {
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//       gap: "10px",
//       marginTop: "40px",
//     },
//   };
// }


"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "../api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useTheme } from "./ThemeContext";
import { jsPDF } from "jspdf";
import QRCode from "react-qr-code";
import { FaFacebookF, FaTwitter, FaWhatsapp, FaInstagram, FaLinkedinIn, FaLink, FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Menu.css";
import { SketchPicker } from "react-color";
import { FaPalette } from "react-icons/fa"; // Tiny color picker icon


export default function Template5() {
  const { dark } = useTheme();
  const [menuItems, setMenuItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "", category: "", image: null });
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "", category: "", image: null });
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");
  const [expandedCard, setExpandedCard] = useState(null);
  const [cardColors, setCardColors] = useState({});
const [activeColorPicker, setActiveColorPicker] = useState(null);
const [cardFonts, setCardFonts] = useState({});
const fontOptions = [
  "Arial, sans-serif",
  "'Times New Roman', serif",
  "'Courier New', monospace",
  "'Comic Sans MS', cursive",
  "'Georgia', serif"
];



  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        if (!restaurantId) return;
        const res = await api.get(`/restaurants/${restaurantId}/menu`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenuItems(res.data);
      } catch (err) {
        console.error("Failed to fetch menu items:", err);
      }
    };
    fetchMenuItems();
  }, [restaurantId, token]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollLeftFn = () => scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRightFn = () => scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewItem({ ...newItem, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    setEditForm({ ...editForm, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: null,
    });
    const imageUrl = item.imageUrl?.startsWith("http") ? item.imageUrl : `http://localhost:5000${item.imageUrl}`;
    setEditImagePreview(imageUrl);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, val]) => {
        if (val) formData.append(key, val);
      });
      const res = await api.put(`/restaurants/${restaurantId}/menu/${editingItem._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMenuItems((prev) => prev.map((item) => (item._id === editingItem._id ? res.data : item)));
      setEditingItem(null);
      setShowEditModal(false);
    } catch (err) {
      toast.error("Failed to update item");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      toast.error("Name and price are required");
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(newItem).forEach(([key, val]) => {
        if (val) formData.append(key, val);
      });
      const res = await api.post(`/restaurants/${restaurantId}/menu`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMenuItems([...menuItems, res.data]);
      setNewItem({ name: "", description: "", price: "", category: "", image: null });
      setImagePreview(null);
      setShowAddModal(false);
    } catch (err) {
      toast.error("Failed to add item");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/restaurants/${restaurantId}/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems((prev) => prev.filter((item) => item._id !== id));
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const convertImageToDataURL = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = reject;
    img.src = src + (src.includes("?") ? "&" : "?") + "cacheBust=" + Date.now();
  });

  const convertSVGToPNG = (svgElement) => new Promise((resolve, reject) => {
    const svg = new XMLSerializer().serializeToString(svgElement);
    const svgBase64 = `data:image/svg+xml;base64,${btoa(svg)}`;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = svgBase64;
  });

// const handleDownloadPDF = async (item) => {
//   const doc = new jsPDF("p", "pt", "a4");
//   const pagePadding = 40;
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const cardWidth = pageWidth - pagePadding * 2;
//   const textWidth = cardWidth * 0.5;

//   let y = pagePadding;

//   // Load main image
//   const imageUrl = item.imageUrl?.startsWith("http")
//     ? item.imageUrl
//     : `http://localhost:5000${item.imageUrl}`;
//   let imageDataURL;
//   try {
//     imageDataURL = await convertImageToDataURL(imageUrl);
//   } catch {
//     toast.error("Failed to load item image");
//     return;
//   }

//   // Get QR
//   let qrDataURL = null;
//   const qrElement = document.getElementById(`qr-${item._id}`);
//   if (qrElement) {
//     try {
//       qrDataURL = await convertSVGToPNG(qrElement);
//     } catch {
//       toast.error("Failed to load QR code");
//     }
//   }

//   // Card background
//   const cardColor = cardColors[item._id] || "#ffffff";
//   doc.setFillColor(cardColor);
//   doc.roundedRect(pagePadding, y, cardWidth, 480, 12, 12, "F");

//   y += 20;

//   // Name
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(26);
//   doc.setTextColor(30, 30, 30);

//   const wrappedName = doc.splitTextToSize(item.name, textWidth);
//   doc.text(wrappedName, pagePadding + 20, y);

//   const nameHeight = wrappedName.length * 20;

//   // QR
//   if (qrDataURL) {
//     doc.addImage(qrDataURL, "PNG", pageWidth - pagePadding - 90, y - 10, 80, 80);
//   }

//   y += Math.max(80, nameHeight) + 20;

//   // Image
//   doc.addImage(imageDataURL, "JPEG", pagePadding + 10, y, cardWidth - 20, 150);
//   y += 150 + 20;

//   // Divider
//   doc.setDrawColor(150);
//   doc.setLineWidth(1);
//   doc.line(pagePadding + 10, y, pagePadding + cardWidth - 10, y);
//   y += 20;

//   // Category
//   doc.setFontSize(14);
//   doc.setTextColor(80, 80, 80);
//   const wrappedCategory = doc.splitTextToSize(`Category: ${item.category}`, textWidth);
//   doc.text(wrappedCategory, pagePadding + 20, y);
//   const categoryHeight = wrappedCategory.length * 16;

//   // Price
//   doc.setFont("helvetica", "bold");
//   doc.setTextColor(40, 167, 69);
//   const price = `$${item.price.toFixed(2)}`;
//   const wrappedPrice = doc.splitTextToSize(price, textWidth);
//   doc.text(wrappedPrice, pagePadding + cardWidth - 20 - doc.getTextWidth(price), y);
//   const priceHeight = wrappedPrice.length * 16;

//   y += Math.max(categoryHeight, priceHeight) + 20;

//   // Divider
//   doc.setDrawColor(150);
//   doc.line(pagePadding + 10, y, pagePadding + cardWidth - 10, y);
//   y += 20;

//   // Description
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(12);
//   doc.setTextColor(60, 60, 60);
//   doc.text("Description:", pagePadding + 20, y);
//   y += 18;

//   const desc = item.description || "-";
//   const wrappedDesc = doc.splitTextToSize(desc, textWidth);
//   doc.text(wrappedDesc, pagePadding + 20, y);

//   // Save
//   doc.save(`${item.name}_menu_card.pdf`);
// };







const handleDownloadPDF = async (item) => {
  const doc = new jsPDF("p", "pt", "a4");
  const pagePadding = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const cardWidth = pageWidth - pagePadding * 2;
  const textWidth = cardWidth * 0.5;

  let y = pagePadding;

  // Load main image
  const imageUrl = item.imageUrl?.startsWith("http")
    ? item.imageUrl
    : `http://localhost:5000${item.imageUrl}`;
  
  const img = new Image();
  img.crossOrigin = "Anonymous";

  const imageDataURL = await new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const targetHeight = 250;
      const scale = targetHeight / img.naturalHeight;
      const targetWidth = img.naturalWidth * scale;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = reject;
    img.src = imageUrl + (imageUrl.includes("?") ? "&" : "?") + "cacheBust=" + Date.now();
  });

  // QR
  let qrDataURL = null;
  const qrElement = document.getElementById(`qr-${item._id}`);
  if (qrElement) {
    try {
      qrDataURL = await convertSVGToPNG(qrElement);
    } catch {
      toast.error("Failed to load QR code");
    }
  }

  // Card background
  const cardColor = cardColors[item._id] || "#ffffff";
  doc.setFillColor(cardColor);
  doc.roundedRect(pagePadding, y, cardWidth, 500, 12, 12, "F");

  y += 20;

 // Name
doc.setFont("helvetica", "bold");
doc.setFontSize(26);
doc.setTextColor(30, 30, 30);

const wrappedName = doc.splitTextToSize(item.name, textWidth);
const nameHeight = wrappedName.length * 20;

y += 40; // 👈 Add margin/padding above the name to push it down

doc.text(wrappedName, pagePadding + 20, y);

y += nameHeight + -80; // spacing after name


  // QR
  if (qrDataURL) {
    doc.addImage(qrDataURL, "PNG", pageWidth - pagePadding - 90, y - 10, 80, 80);
  }

  y += Math.max(80, nameHeight) + 20;

  // Target dimensions
const targetWidth = cardWidth;
const targetHeight = 250;

// Image natural dimensions
const imgWidth = img.naturalWidth;
const imgHeight = img.naturalHeight;
const imgRatio = imgWidth / imgHeight;
const targetRatio = targetWidth / targetHeight;

// Crop logic for object-fit: cover
let drawWidth = targetWidth;
let drawHeight = targetHeight;
let sx = 0, sy = 0, sWidth = imgWidth, sHeight = imgHeight;

if (imgRatio > targetRatio) {
  // Image is wider than target: crop sides
  sWidth = imgHeight * targetRatio;
  sx = (imgWidth - sWidth) / 2;
} else {
  // Image is taller than target: crop top/bottom
  sHeight = imgWidth / targetRatio;
  sy = (imgHeight - sHeight) / 2;
}

// Create canvas to crop the image manually
const canvas = document.createElement("canvas");
canvas.width = sWidth;
canvas.height = sHeight;
const ctx = canvas.getContext("2d");

// Draw cropped image on canvas
ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

// Convert cropped image to base64
const croppedDataURL = canvas.toDataURL("image/jpeg");

// Draw to PDF
doc.addImage(croppedDataURL, "JPEG", pagePadding, y, targetWidth, targetHeight);
y += targetHeight + 20;


  // Divider
  doc.setDrawColor(150);
  doc.setLineWidth(1);
  doc.line(pagePadding + 10, y, pagePadding + cardWidth - 10, y);
  y += 20;

  // Category
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  const wrappedCategory = doc.splitTextToSize(`Category: ${item.category}`, textWidth);
  doc.text(wrappedCategory, pagePadding + 20, y);
  const categoryHeight = wrappedCategory.length * 16;

  // Price
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 167, 69);
  const price = `$${item.price.toFixed(2)}`;
  const wrappedPrice = doc.splitTextToSize(price, textWidth);
  doc.text(wrappedPrice, pagePadding + cardWidth - 20 - doc.getTextWidth(price), y);
  const priceHeight = wrappedPrice.length * 16;

  y += Math.max(categoryHeight, priceHeight) + 20;

  // Divider
  doc.setDrawColor(150);
  doc.line(pagePadding + 10, y, pagePadding + cardWidth - 10, y);
  y += 20;

  // Description
doc.setFont("helvetica", "normal");
doc.setFontSize(12);
doc.setTextColor(60, 60, 60);

const desc = item.description || "-";
const label = "Description:";
const labelWidth = doc.getTextWidth(label);
const labelX = (pageWidth - labelWidth) / 2;

doc.text(label, labelX, y); // center the "Description:" label
y += 18;

const wrappedDesc = doc.splitTextToSize(desc, textWidth);

// Loop to center each line of description
wrappedDesc.forEach((line, index) => {
  const lineWidth = doc.getTextWidth(line);
  const lineX = (pageWidth - lineWidth) / 2;
  doc.text(line, lineX, y + index * 18);
});

y += wrappedDesc.length * 18 + 20; // update Y after all lines

doc.save(`${item.name}_menu_card.pdf`);
}




  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCardExpand = (itemId) => {
    setExpandedCard(expandedCard === itemId ? null : itemId);
  };

  const dynamicStyles = getStyles(dark);


  const handleCardColorChange = (itemId, color) => {
  setCardColors((prev) => ({ ...prev, [itemId]: color.hex }));
};

const handleCardFontChange = (itemId, font) => {
  setCardFonts((prev) => ({ ...prev, [itemId]: font }));
};

  return (
    <div style={{ background: dark ? "#1E2A38" : "#f8f9fa", minHeight: "100vh",fontFamily:"Montserrat", overflowX:"hidden" }}>
      <Navbar />
    
           <main style={{ padding: "40px 20px" }}>
  <h2 style={{ textAlign: "center", color: dark ? "#fff" : "#343a40" }}>Menu Items</h2>

 

  {filteredItems.length > 0 ? (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        userSelect: "none",
      }}
    >
      {filteredItems.length >= 3 && (
        <button className="scroll-button" onClick={scrollLeftFn}>
          ←
        </button>
      )}

      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="menu-card-list"
        style={{
          display: "flex",
          overflowX: "hidden",
          gap: "20px",
          cursor: isDragging ? "grabbing" : "grab",
          padding: "10px",
        }}
      >
       {filteredItems.map((item) => (
  <div
    className="menu-card" 
    key={item._id}
    onClick={() => toggleCardExpand(item._id)}
    style={{
      border: "1px solid #ccc",
      borderRadius: "10px",
      padding: "16px",
      marginBottom: "20px",
       backgroundColor: cardColors[item._id] || "#fff",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      maxWidth: "400px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      transform: expandedCard === item._id ? "scale(1.05)" : "scale(1)",
      zIndex: expandedCard === item._id ? 10 : 1,
      position: "relative",
      ...(expandedCard === item._id && {
        boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
      })
    }}
  >
    {/* <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
  <label htmlFor={`font-select-${item._id}`} style={{ fontSize: "12px" }}>Font:</label>
  <select
    id={`font-select-${item._id}`}
    value={cardFonts[item._id] || fontOptions[0]}
    onChange={(e) => handleCardFontChange(item._id, e.target.value)}
    style={{
      padding: "4px 6px",
      borderRadius: "6px",
      fontSize: "12px",
      cursor: "pointer"
    }}
  >
    {fontOptions.map((font, idx) => (
      <option key={idx} value={font} style={{ fontFamily: font }}>
        {font.split(",")[0].replace(/['"]/g, '')}
      </option>
    ))}
  </select>
</div> */}



<div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width:"80%",
      marginBottom: "20px",
      marginTop:"20px",
      
    }}
  >

    
    {/* <div style={{ display: "flex", justifyContent: "center", marginTop: "45px" }}>
  <FaPalette
    size={25}
    style={{ cursor: "pointer" }}
    onClick={(e) => {
      e.stopPropagation();
      setActiveColorPicker(activeColorPicker === item._id ? null : item._id);
    }}
    title="Customize Card Color"
  />
</div>
{activeColorPicker === item._id && (
  <div style={{  top: "40px", right: "10px", zIndex: 999 }}>
    <SketchPicker
      color={cardColors[item._id] || "#fff"}
      onChangeComplete={(color) => handleCardColorChange(item._id, color)}
    />
  </div>
)} */}


    
   
  </div>



 <button
    onClick={() => handleDownloadPDF(item)}
    className="btn-download"
    title="Download as PDF"
    style={{
      marginBottom: "0px",
      backgroundColor: "#FFC107",
      color: "#ffff",
      padding: "5px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "02px",
      fontSize:"12px",
      alignContent:"end",
      justifyContent:"end",
      marginTop:"-20px",
    }}
  >
    <FaDownload /> Download PDF
  </button>
    
   

<div
    style={{
      display: "flex",
      // justifyContent: "space-between",
      alignItems: "left",
      width:"100%",
      marginBottom: "20px",
      marginTop:"20px",
      
    }}
  >
   {/* <div style={{ fontFamily: cardFonts[item._id] || fontOptions[0] }}> */}
    <h4  style={{
      marginTop: "20px",
      fontSize: "20px",
      textAlign: "left",
      // alignSelf: "flex-end", // ensures heading sticks to top
      width:"60%",
    wordWrap: "break-word"
    }}>{item.name}</h4>
    {/* </div> */}
   
   
    <QRCode
      id={`qr-${item._id}`}
      size={80}
      bgColor="white"
      fgColor="black"
      style={{width:"40%"}}
      
      value={`${window.location.origin}/view/${restaurantId}/template5`}
    />
  </div>



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

  {/* Row 1: Name + QR */}
  




  {/* Divider */}
<div
  style={{
    width: "100%",
    height: "2px",
    backgroundColor: "#999", // darker than #ccc
    margin: "10px 0",
    borderRadius: "2px",
  }}
/>


  {/* <div style={{ fontFamily: cardFonts[item._id] || fontOptions[0] }}> */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
      marginTop:"0px",
      // gap:"100px",
      width:"100%"
    }}
  >
    <p
      style={{
        margin: 0,
        fontWeight: "bold",
        color: "#555",
        textAlign: "left",
    width:"50%",
    wordWrap: "break-word"
      }}
    >
      Category: {item.category}
    </p>
    <strong style={{ color: "#28A745" , width:"50%", wordWrap: "break-word"}}>${item.price.toFixed(2)}</strong>
  </div>
  {/* </div> */}

  {/* Divider */}
<div
  style={{
    width: "100%",
    height: "2px",
    backgroundColor: "#999", // darker than #ccc
   marginBottom:"20px",
    borderRadius: "2px",
  }}
/>


  {/* Row 3: Description */}
  {/* <div style={{ fontFamily: cardFonts[item._id] || fontOptions[0] }}> */}
  <p style={{ marginBottom: "0px", color: "#444", width:"100%", wordWrap: "break-word" }}>{item.description}</p>
  {/* </div> */}
  
  {/* PDF Download */}
  

  {/* Edit / Delete Buttons */}
 
</div>
        ))}
      </div>

      {filteredItems.length >= 3 && (
        <button className="scroll-button" onClick={scrollRightFn}>
          →
        </button>
      )}
    </div>
  ) : (
    <p style={{ textAlign: "center", marginTop: "40px" }}>
      No menu items found.
    </p>
  )}
</main>

      <ToastContainer position="top-right" autoClose={3000} />
      <Footer />
    </div>
  );
}

function getStyles(dark) {
  return {
    input: {
      padding: "10px",
      borderRadius: "8px",
      border: `1px solid ${dark ? "#3a3a3a" : "#ccc"}`,
      width: "80%",
      maxWidth: "400px",
      outline: "none",
      fontSize: "16px",
      backgroundColor: dark ? "#1E2A38" : "#F8F9FA",
      color: dark ? "#fff" : "#000",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
      marginTop: "40px",
    },
  };
}