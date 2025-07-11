// "use client";
// import { useEffect, useState, useRef } from "react";
// import { api } from "../api";
// import Navbar from "./Navbar";
// import Footer from "./Footer";
// import { useTheme } from "./ThemeContext";
// import { jsPDF } from "jspdf";
// import QRCode from "react-qr-code";
// import {
//   FaFacebookF,
//   FaTwitter,
//   FaWhatsapp,
//   FaInstagram,
//   FaLinkedinIn,
//   FaLink,
//   FaEdit,
//   FaTrash,
//   FaDownload,
// } from "react-icons/fa";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./Template6.css";

// export default function Template6() {
//   const { dark } = useTheme();
//   const [menuItems, setMenuItems] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [newItem, setNewItem] = useState({
//     name: "",
//     description: "",
//     price: "",
//     category: "",
//     image: null,
//   });
//   const [editForm, setEditForm] = useState({
//     name: "",
//     description: "",
//     price: "",
//     category: "",
//     image: null,
//   });
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

//   // const scrollLeftFn = () => scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
//   // const scrollRightFn = () => scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });

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
//     const imageUrl = item.imageUrl?.startsWith("http")
//       ? item.imageUrl
//       : `http://localhost:5000${item.imageUrl}`;
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
//       const res = await api.put(
//         `/restaurants/${restaurantId}/menu/${editingItem._id}`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       setMenuItems((prev) =>
//         prev.map((item) => (item._id === editingItem._id ? res.data : item))
//       );
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
//       const res = await api.post(
//         `/restaurants/${restaurantId}/menu`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       setMenuItems([...menuItems, res.data]);
//       setNewItem({
//         name: "",
//         description: "",
//         price: "",
//         category: "",
//         image: null,
//       });
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

//   const convertImageToDataURL = (src) =>
//     new Promise((resolve, reject) => {
//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         canvas.width = img.naturalWidth;
//         canvas.height = img.naturalHeight;
//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(img, 0, 0);
//         resolve(canvas.toDataURL("image/jpeg"));
//       };
//       img.onerror = reject;
//       img.src =
//         src + (src.includes("?") ? "&" : "?") + "cacheBust=" + Date.now();
//     });

//   const convertSVGToPNG = (svgElement) =>
//     new Promise((resolve, reject) => {
//       const svg = new XMLSerializer().serializeToString(svgElement);
//       const svgBase64 = `data:image/svg+xml;base64,${btoa(svg)}`;
//       const img = new Image();
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         canvas.width = img.width;
//         canvas.height = img.height;
//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(img, 0, 0);
//         resolve(canvas.toDataURL("image/png"));
//       };
//       img.onerror = reject;
//       img.src = svgBase64;
//     });

//   const handleDownloadPDF = async (item) => {
//     const doc = new jsPDF("p", "pt", "a4");

//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const padding = 40;

//     const cardWidth = pageWidth - padding * 2;
//     const cardHeight = 300;
//     const cardX = padding;
//     const cardY = (pageHeight - cardHeight) / 2;

//     const imageWidth = cardWidth * 0.5;
//     const imageHeight = cardHeight;

//     const contentX = cardX + imageWidth + 20;
//     let contentY = cardY + 40;

//     try {
//       const imageUrl = item.imageUrl.startsWith("http")
//         ? item.imageUrl
//         : `http://localhost:5000${item.imageUrl}`;
//       const imgData = await convertImageToDataURL(imageUrl);

//       // 🔄 Get hidden QR
//       const qrElement = document.getElementById(`qr-hidden-${item._id}`);
//       if (!qrElement) {
//         toast.error("Hidden QR code not found in DOM.");
//         return;
//       }

//       const qrImg = await convertSVGToPNG(qrElement);

//       // 🎨 Page background
//       doc.setFillColor(248, 249, 250);
//       doc.rect(0, 0, pageWidth, pageHeight, "F");

//       // 🧾 Card background
//       doc.setFillColor(255, 255, 255);
//       doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 12, 12, "F");

//       // 🖼️ Image
//       doc.addImage(imgData, "JPEG", cardX, cardY, imageWidth, imageHeight);

//       // 📛 Name
//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(24);
//       doc.setTextColor(0, 0, 0);
//       doc.text(item.name, contentX, contentY);
//       contentY += 40;

//       // 💵 Price
//       doc.setFontSize(22);
//       doc.setTextColor(40, 167, 69);
//       doc.text(`$${item.price.toFixed(2)}`, contentX, contentY);
//       contentY += 30;

//       // 🔳 QR
//       doc.addImage(qrImg, "PNG", contentX, contentY, 100, 100);

//       doc.save(`${item.name}_menu_card.pdf`);
//     } catch (err) {
//       console.error("PDF generation failed:", err);
//       toast.error("Failed to generate PDF");
//     }
//   };

//   const filteredItems = menuItems.filter((item) =>
//     item.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const toggleCardExpand = (itemId) => {
//     setExpandedCard(expandedCard === itemId ? null : itemId);
//   };

//   const dynamicStyles = getStyles(dark);

//   return (
//     <div
//       style={{ background: dark ? "#1E2A38" : "#f8f9fa", minHeight: "100vh" }}
//     >
//       <Navbar />

//       <main style={{ padding: "40px 20px" }}>
//         <h2 style={{ textAlign: "center", color: dark ? "#fff" : "#343a40" }}>
//           Menu Items
//         </h2>

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
//             value={`${window.location.origin}/view/${restaurantId}/template6`}
//             size={120}
//             bgColor="white"
//             fgColor="black"
//           />
//         </div>

//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center", // ✅ Center horizontally
//             gap: "20px", // ✅ Spacing between cards
//             padding: "20px", // ✅ Optional: spacing from sides
//             background: "#F8F9FA",
//           }}
//         >
//           {filteredItems.map((item) => (
//             <div
//               className="menu-card"
//               key={item._id}
//               style={{
//                 display: "flex",
//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 border: "1px solid #ccc",
//                 borderRadius: "10px",
//                 padding: "16px",
//                 backgroundColor: "#fff",
//                 boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                 maxWidth: "70%", // ✅ Limits width
//                 width: "100%", // ✅ Responsive width inside maxWidth
//                 height: "150px",
//                 gap: "20px",
//                 background: "#F8F9FA",
//               }}
//             >
//               {/* Left: Image */}
//               <img
//                 src={
//                   item.imageUrl.startsWith("http")
//                     ? item.imageUrl
//                     : `http://localhost:5000${item.imageUrl}`
//                 }
//                 alt={item.name}
//                 style={{
//                   width: "50%",
//                   height: "300px",
//                   objectFit: "cover",
//                   borderRadius: "8px",
//                 }}
//               />
//               <QRCode
//                 id={`qr-hidden-${item._id}`}
//                 value={`${window.location.origin}/view/${restaurantId}/template6`}
//                 size={120}
//                 bgColor="white"
//                 fgColor="black"
//               />

//               {/* Right: Name + Price */}
//               <div
//                 style={{
//                   flex: 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "end",
//                   justifyContent: "center",
//                   height: "100%",
//                   gap: "20px",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontSize: "40px",
//                     fontWeight: "bold",
//                     textAlign: "right",
//                   }}
//                 >
//                   {item.name}
//                 </div>

//                 <div
//                   style={{
//                     fontSize: "38px",
//                     color: "#28A745",
//                     fontWeight: "bold",
//                     textAlign: "right",
//                   }}
//                 >
//                   ${item.price.toFixed(2)}
//                 </div>

//                 {/* <div style={{  marginBottom: "0px" }}>
//   <p style={{ marginBottom: "20px" }}>Scan to View Menu</p>
//   <QRCode
//     value={`${window.location.origin}/view/${restaurantId}/menu`}
//     size={80}
//     bgColor="white"
//     fgColor="black"
//   />
// </div> */}

//                 <button
//                   onClick={() => handleDownloadPDF(item)}
//                   className="btn-download"
//                   title="Download as PDF"
//                   style={{
//                     marginRight: "0px",
//                     marginBottom: "0px",
//                     backgroundColor: "#FFC107",
//                     color: "#ffff",
//                     padding: "5px",
//                     border: "none",
//                     borderRadius: "6px",
//                     cursor: "pointer",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "02px",
//                     fontSize: "12px",
//                     alignContent: "end",
//                     justifyContent: "end",
//                     marginTop: "5px",
//                     maxWidth: "250px",
//                   }}
//                 >
//                   <FaDownload /> Download PDF
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </main>

//       {showAddModal && (
//         <div className="modal-overlay-add">
//           <form
//             className="modal-box-add"
//             onSubmit={handleSubmit}
//             style={dynamicStyles.form}
//           >
//             <h4 className="formfield1" style={{ justifyContent: "left" }}>
//               Name *
//             </h4>
//             <input
//               type="text"
//               required
//               value={newItem.name}
//               onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
//               style={dynamicStyles.input}
//             />
//             <h4 className="formfield" style={{ justifyContent: "left" }}>
//               Description
//             </h4>
//             <input
//               type="text"
//               value={newItem.description}
//               onChange={(e) =>
//                 setNewItem({ ...newItem, description: e.target.value })
//               }
//               style={dynamicStyles.input}
//             />
//             <h4 className="formfield" style={{ justifyContent: "left" }}>
//               Price *
//             </h4>
//             <input
//               type="number"
//               step="0.01"
//               required
//               value={newItem.price}
//               onChange={(e) =>
//                 setNewItem({ ...newItem, price: e.target.value })
//               }
//               style={dynamicStyles.input}
//             />
//             <h4 className="formfield" style={{ justifyContent: "left" }}>
//               Category *
//             </h4>
//             <input
//               type="text"
//               required
//               value={newItem.category}
//               onChange={(e) =>
//                 setNewItem({ ...newItem, category: e.target.value })
//               }
//               style={dynamicStyles.input}
//             />
//             {/* <h4 className="formfield1" style={{  justifyContent: "left" }}>Item image </h4> */}
//             <h4 className="formfield1" style={{ justifyContent: "left" }}>
//               Image *
//             </h4>
//             <input
//               type="file"
//               required
//               accept="image/*"
//               onChange={handleImageChange}
//               style={dynamicStyles.input}
//             />
//             {imagePreview && (
//               <img
//                 src={imagePreview}
//                 alt="Preview"
//                 style={{
//                   maxWidth: "100%",
//                   maxHeight: "300px",
//                   marginTop: "10px",
//                 }}
//               />
//             )}
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 marginTop: "10px",
//                 gap: "30px",
//               }}
//             >
//               <button type="submit" className="add-btn">
//                 Add
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowAddModal(false)}
//                 className="cancel-btn"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {showEditModal && (
//         <div className="modal-overlay-add">
//           <form
//             className="modal-box-add"
//             onSubmit={handleEditSubmit}
//             style={dynamicStyles.form}
//           >
//             <h4 className="formfield1" style={{ justifyContent: "left" }}>
//               Name *
//             </h4>
//             <input
//               type="text"
//               required
//               value={editForm.name}
//               onChange={(e) =>
//                 setEditForm({ ...editForm, name: e.target.value })
//               }
//               style={dynamicStyles.input}
//             />

//             <h4 className="formfield" style={{ justifyContent: "left" }}>
//               Description
//             </h4>
//             <input
//               type="text"
//               value={editForm.description}
//               onChange={(e) =>
//                 setEditForm({ ...editForm, description: e.target.value })
//               }
//               style={dynamicStyles.input}
//             />

//             <h4 className="formfield" style={{ justifyContent: "left" }}>
//               Price
//             </h4>
//             <input
//               type="number"
//               step="0.01"
//               required
//               value={editForm.price}
//               onChange={(e) =>
//                 setEditForm({ ...editForm, price: e.target.value })
//               }
//               style={dynamicStyles.input}
//             />

//             <h4 className="formfield" style={{ justifyContent: "left" }}>
//               Category
//             </h4>
//             <input
//               type="text"
//               required
//               value={editForm.category}
//               onChange={(e) =>
//                 setEditForm({ ...editForm, category: e.target.value })
//               }
//               style={dynamicStyles.input}
//             />

//             <h4 className="formfield" style={{ justifyContent: "left" }}>
//               Image
//             </h4>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleEditImageChange}
//               style={dynamicStyles.input}
//             />

//             {editImagePreview && (
//               <img
//                 src={editImagePreview}
//                 alt="Preview"
//                 style={{
//                   maxWidth: "100%",
//                   maxHeight: "300px",
//                   marginTop: "10px",
//                 }}
//               />
//             )}

//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 marginTop: "10px",
//                 gap: "30px",
//               }}
//             >
//               <button type="submit" className="add-btn">
//                 Update
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowEditModal(false)}
//                 className="cancel-btn"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

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
import "./Template6.css";

export default function Template6() {
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

  // const scrollLeftFn = () => scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
  // const scrollRightFn = () => scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });

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

const handleDownloadPDF = async (item) => {
  const doc = new jsPDF("p", "pt", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const padding = 40;

  const cardWidth = pageWidth - padding * 2;
  const cardHeight = 300;
  const cardX = padding;
  const cardY = (pageHeight - cardHeight) / 2;

  const imageWidth = cardWidth * 0.5;
  const imageHeight = cardHeight;

  const contentX = cardX + imageWidth + 20;
  let contentY = cardY + 40;

  try {
    const imageUrl = item.imageUrl.startsWith("http")
      ? item.imageUrl
      : `http://localhost:5000${item.imageUrl}`;
    const imgData = await convertImageToDataURL(imageUrl);

    // 🔄 Get hidden QR
    const qrElement = document.getElementById(`qr-hidden-${item._id}`);
    if (!qrElement) {
      toast.error("Hidden QR code not found in DOM.");
      return;
    }

    const qrImg = await convertSVGToPNG(qrElement);

    // 🎨 Page background
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // 🧾 Card background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 12, 12, "F");

    // 🖼️ Image
    doc.addImage(imgData, "JPEG", cardX, cardY, imageWidth, imageHeight);

    // 📛 Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text(item.name, contentX, contentY);
    contentY += 40;

    // 💵 Price
    doc.setFontSize(22);
    doc.setTextColor(40, 167, 69);
    doc.text(`$${item.price.toFixed(2)}`, contentX, contentY);
    contentY += 30;

    // 🔳 QR
    doc.addImage(qrImg, "PNG", contentX, contentY, 100, 100);

    doc.save(`${item.name}_menu_card.pdf`);
  } catch (err) {
    console.error("PDF generation failed:", err);
    toast.error("Failed to generate PDF");
  }
};






  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCardExpand = (itemId) => {
    setExpandedCard(expandedCard === itemId ? null : itemId);
  };

  const dynamicStyles = getStyles(dark);

  return (
    <div style={{ background: dark ? "#1E2A38" : "#f8f9fa", minHeight: "100vh",fontFamily:"Montserrat" }}>
      <Navbar />
      
      






           <main style={{ padding: "40px 20px" }}>
  <h2 style={{ textAlign: "center", color: dark ? "#fff" : "#343a40" }}>Menu Items</h2>

<div style={{ textAlign: "center", marginBottom: "30px",display:"flex ", justifyContent:"center",gap:"5px" }}>
  <h2 style={{ marginBottom: "10px" }}>Scan to View Menu</h2>
  <QRCode
    value={`${window.location.origin}/view/${restaurantId}/template6`}
    size={120}
    bgColor="white"
    fgColor="black"
  />
</div>


<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // ✅ Center horizontally
    gap: "20px",           // ✅ Spacing between cards
    padding: "20px",       // ✅ Optional: spacing from sides
    background:"#F8F9FA",
  }}
>
  {filteredItems.map((item) => (
    <div
      className="menu-card"
      key={item._id}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "16px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        maxWidth: "70%",     // ✅ Limits width
        width: "100%",       // ✅ Responsive width inside maxWidth
        height:"150px",
        gap: "20px",
        background:"#F8F9FA"
      }}
    >
    {/* Left: Image */}
    <img
      src={
        item.imageUrl.startsWith("http")
          ? item.imageUrl
          : `http://localhost:5000${item.imageUrl}`
      }
      alt={item.name}
      style={{
        width: "50%",
        height:"300px",
        objectFit: "cover",
        borderRadius: "8px",
      }}
    /><QRCode
    id={`qr-hidden-${item._id}`}
    value={`${window.location.origin}/view/${restaurantId}/template6`}
    size={120}
    bgColor="white"
    fgColor="black"
  />

    {/* Right: Name + Price */}
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems:"end",
        justifyContent: "center",
        height: "100%",
        gap:"20px"
      }}
    >
      <div
        style={{
          fontSize: "40px",
          fontWeight: "bold",
          textAlign: "right",
        }}
      >
        {item.name}
      </div>

      <div
        style={{
          fontSize: "38px",
          color: "#28A745",
          fontWeight: "bold",
          textAlign: "right",
        }}
      >
        ${item.price.toFixed(2)}
      </div>

{/* <div style={{  marginBottom: "0px" }}>
  <p style={{ marginBottom: "20px" }}>Scan to View Menu</p>
  <QRCode
    value={`${window.location.origin}/view/${restaurantId}/menu`}
    size={80}
    bgColor="white"
    fgColor="black"
  />
</div> */}


       <button
    onClick={() => handleDownloadPDF(item)}
    className="btn-download"
    title="Download as PDF"
    style={{
      marginRight:"0px",
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
      marginTop:"5px",
      maxWidth:"250px"
    }}
  >
    <FaDownload /> Download PDF
  </button>
    </div>
  </div>
))}
</div>

</main>


















      {showAddModal && (
        <div className="modal-overlay-add">
          <form className="modal-box-add" onSubmit={handleSubmit} style={dynamicStyles.form}>
        <h4 className="formfield1" style={{  justifyContent: "left" }}>Name *</h4>
        <input
          type="text"
          required 
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          style={dynamicStyles.input}
        />
        <h4 className="formfield" style={{  justifyContent: "left" }}>Description</h4>
        <input
          type="text"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          style={dynamicStyles.input}
        />
        <h4 className="formfield" style={{  justifyContent: "left" }}>Price *</h4>
        <input
          type="number"
          step="0.01"
          required 
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          style={dynamicStyles.input}
        />
        <h4 className="formfield" style={{  justifyContent: "left" }}>Category *</h4>
        <input
          type="text"
          required 
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          style={dynamicStyles.input}
        />
        {/* <h4 className="formfield1" style={{  justifyContent: "left" }}>Item image </h4> */}
        <h4 className="formfield1" style={{  justifyContent: "left" }}>Image *</h4>
        <input
          type="file"
          required 
          accept="image/*"
          onChange={handleImageChange}
          style={dynamicStyles.input}
        />
        {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%",maxHeight:"300px", marginTop: "10px" }} />}
         <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", gap:"30px" }}>
          <button type="submit" className="add-btn">Add</button>
          <button
            type="button"
            onClick={() => setShowAddModal(false)}
            className="cancel-btn"
          >
            Cancel
          </button>
          </div>
      </form> 
        </div>
      )}

     {showEditModal && (
  <div className="modal-overlay-add">
    <form className="modal-box-add" onSubmit={handleEditSubmit} style={dynamicStyles.form}>
      <h4 className="formfield1" style={{ justifyContent: "left" }}>Name *</h4>
      <input
        type="text"
        required
        value={editForm.name}
        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
        style={dynamicStyles.input}
      />

      <h4 className="formfield" style={{ justifyContent: "left" }}>Description</h4>
      <input
        type="text"
        value={editForm.description}
        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
        style={dynamicStyles.input}
      />

      <h4 className="formfield" style={{ justifyContent: "left" }}>Price</h4>
      <input
        type="number"
        step="0.01"
        required
        value={editForm.price}
        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
        style={dynamicStyles.input}
      />

      <h4 className="formfield" style={{ justifyContent: "left" }}>Category</h4>
      <input
        type="text"
        required
        value={editForm.category}
        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
        style={dynamicStyles.input}
      />

      <h4 className="formfield" style={{ justifyContent: "left" }}>Image</h4>
      <input
        type="file"
        accept="image/*"
        onChange={handleEditImageChange}
        style={dynamicStyles.input}
      />

      {editImagePreview && (
        <img src={editImagePreview} alt="Preview" style={{ maxWidth: "100%",maxHeight:"300px", marginTop: "10px" }} />
      )}


   

      <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", gap: "30px" }}>
        <button type="submit" className="add-btn">Update</button>
        <button
          type="button"
          onClick={() => setShowEditModal(false)}
          className="cancel-btn"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}

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