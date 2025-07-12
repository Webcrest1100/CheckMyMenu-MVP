
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

export default function Template9() {
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
  const [hoveredCard, setHoveredCard] = useState(null);


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
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const cardWidth = 400;
//   const x = (pageWidth - cardWidth) / 2;
//   let y = 60;
//   const padding = 30;

//   try {
//     // 1. Load Image
//     const imageUrl = item.imageUrl?.startsWith("http")
//       ? item.imageUrl
//       : `http://localhost:5000${item.imageUrl}`;
//     const imageDataUrl = await convertImageToDataURL(imageUrl);

//     // 2. Card Background
//     doc.setFillColor(255, 255, 255);
//     doc.roundedRect(x, y, cardWidth, 620, 12, 12, "F");

//     // 3. Divider
//     const drawDivider = () => {
//       doc.setDrawColor(153, 153, 153); // #999
//       doc.setLineWidth(2);
//       doc.line(x + padding, y, x + cardWidth - padding, y);
//       y += 20;
//     };

//     // 4. Category + Price
//     drawDivider();

//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(14);
//     doc.setTextColor(85); // #555
//     doc.text(`Category: ${item.category}`, x + padding, y);

//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(40, 167, 69); // #28A745
//     doc.text(`$${item.price.toFixed(2)}`, x + cardWidth - padding, y, { align: "right" });

//     y += 25;

//     // Divider
//     drawDivider();

//     // 5. Image
//     // const imageHeight = 150;
//     // doc.addImage(imageDataUrl, "JPEG", x + padding, y, cardWidth - 2 * padding, imageHeight);
//     // y += imageHeight + 15;



//     // 5. Image (Fixed height 200px, maintain aspect ratio)
// const imageObj = new Image();
// imageObj.src = imageDataUrl;

// await new Promise((resolve) => {
//   imageObj.onload = () => resolve();
// });

// const fixedHeight = 200;
// const aspectRatio = imageObj.naturalWidth / imageObj.naturalHeight;
// const displayWidth = fixedHeight * aspectRatio;
// const imageX = x + padding + (cardWidth - 2 * padding - displayWidth) / 2;

// doc.addImage(imageDataUrl, "JPEG", imageX, y, displayWidth, fixedHeight);
// y += fixedHeight + 20;

//     y += 20;

//     // 6. Row 1: Name + QR
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(20);
//     doc.setTextColor(0, 0, 0);
//     doc.text(item.name, x + padding, y + 10);

//     const qrElement = document.getElementById(`qr-${item._id}`);
//     if (qrElement) {
//       const qrImg = await convertSVGToPNG(qrElement);
//       doc.addImage(qrImg, "PNG", x + cardWidth - padding - 70, y - 5, 60, 60);
//     }

//     y += 60;
//     y += 20;
//     // 7. Description
//     drawDivider();
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(12);
//     doc.setTextColor(68); // #444
//     const descLines = doc.splitTextToSize(item.description || "-", cardWidth - 2 * padding);
//     doc.text(descLines, x + padding, y + 10);

//     // 8. Final Save
//     doc.save(`${item.name}_menu_card.pdf`);
//   } catch (err) {
//     console.error("PDF generation failed", err);
//     toast.error("Failed to generate PDF");
//   }
// };













// const handleDownloadPDF = async (item) => {
//   const doc = new jsPDF("p", "pt", "a4");
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const cardWidth = 400;
//   const textMaxWidth = cardWidth * 0.5;
//   const x = (pageWidth - cardWidth) / 2;
//   let y = 60;
//   const padding = 30;

//   try {
//     // Load Image
//     const imageUrl = item.imageUrl?.startsWith("http")
//       ? item.imageUrl
//       : `http://localhost:5000${item.imageUrl}`;
//     const imageDataUrl = await convertImageToDataURL(imageUrl);

//     // Card Background
//     doc.setFillColor(255, 255, 255);
//     doc.roundedRect(x, y, cardWidth, 620, 12, 12, "F");

//     // Divider utility
//     const drawDivider = () => {
//       doc.setDrawColor(153, 153, 153); // #999
//       doc.setLineWidth(2);
//       doc.line(x + padding, y, x + cardWidth - padding, y);
//       y += 20;
//     };

//     // Divider + Category
//     drawDivider();

//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(14);
//     doc.setTextColor(85);

//     const categoryLines = doc.splitTextToSize(`Category: ${item.category}`, textMaxWidth);
//     doc.text(categoryLines, x + padding, y);
//     const catHeight = categoryLines.length * 16;

//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(40, 167, 69);
//     const priceText = `$${item.price.toFixed(2)}`;
//     doc.text(priceText, x + cardWidth - padding, y, { align: "right" });

//     y += catHeight + 10;

//     // Divider
//     drawDivider();

//     // Image
//     const imageObj = new Image();
//     imageObj.src = imageDataUrl;
//     await new Promise((res) => (imageObj.onload = res));

//     const fixedHeight = 200;
//     const aspectRatio = imageObj.naturalWidth / imageObj.naturalHeight;
//     const displayWidth = fixedHeight * aspectRatio;
//     const imageX = x + padding + (cardWidth - 2 * padding - displayWidth) / 2;

//     doc.addImage(imageDataUrl, "JPEG", imageX, y, displayWidth, fixedHeight);
//     y += fixedHeight + 20;

//     // Name + QR
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(20);
//     doc.setTextColor(0, 0, 0);

//     const wrappedName = doc.splitTextToSize(item.name, textMaxWidth);
//     doc.text(wrappedName, x + padding, y);
//     const nameHeight = wrappedName.length * 22;

//     const qrElement = document.getElementById(`qr-${item._id}`);
//     if (qrElement) {
//       const qrImg = await convertSVGToPNG(qrElement);
//       doc.addImage(qrImg, "PNG", x + cardWidth - padding - 70, y - 5, 60, 60);
//     }

//     y += Math.max(nameHeight, 60) + 20;

//     // Description
//     drawDivider();
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(12);
//     doc.setTextColor(68);

//     const descLines = doc.splitTextToSize(item.description || "-", textMaxWidth);
//     doc.text(descLines, x + padding, y);

//     // Save
//     doc.save(`${item.name}_menu_card.pdf`);
//   } catch (err) {
//     console.error("PDF generation failed", err);
//     toast.error("Failed to generate PDF");
//   }
// };




const handleDownloadPDF = async (item) => {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const cardWidth = 400;
  const textMaxWidth = cardWidth * 0.5;         // 50% for wrapped text
  const priceMaxWidth = cardWidth * 0.3;        // 30% for price
  const x = (pageWidth - cardWidth) / 2;
  let y = 60;
  const padding = 30;

  try {
    // Load Image
    const imageUrl = item.imageUrl?.startsWith("http")
      ? item.imageUrl
      : `http://localhost:5000${item.imageUrl}`;
    const imageDataUrl = await convertImageToDataURL(imageUrl);

    // Card Background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, cardWidth, 620, 12, 12, "F");

    // Divider utility
    const drawDivider = () => {
      doc.setDrawColor(153, 153, 153); // #999
      doc.setLineWidth(2);
      doc.line(x + padding, y, x + cardWidth - padding, y);
      y += 20;
    };

    // Divider + Category
    drawDivider();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(85); // #555

    const categoryLines = doc.splitTextToSize(`Category: ${item.category}`, textMaxWidth);
    doc.text(categoryLines, x + padding, y);
    const catHeight = categoryLines.length * 16;

    // Price (30% width + right-aligned + wrapped if needed)
    doc.setTextColor(40, 167, 69); // #28A745
    const priceText = `$${item.price.toFixed(2)}`;
    const wrappedPrice = doc.splitTextToSize(priceText, priceMaxWidth);
    const priceX = x + cardWidth - padding;

    wrappedPrice.forEach((line, idx) => {
      const lineY = y + idx * 16;
      doc.text(line, priceX, lineY, { align: "right" });
    });

    const priceHeight = wrappedPrice.length * 16;

    y += Math.max(catHeight, priceHeight) + 10;

    // Divider
    drawDivider();

  const fixedWidth = cardWidth - 2 * padding;
const fixedHeight = 250;

// Load original image
const imageObj = new Image();
imageObj.src = imageDataUrl;
await new Promise((res) => (imageObj.onload = res));

// Create canvas to crop like "object-fit: cover"
const tempCanvas = document.createElement("canvas");
tempCanvas.width = fixedWidth;
tempCanvas.height = fixedHeight;

const ctx = tempCanvas.getContext("2d");

// Calculate crop
const imgAspectRatio = imageObj.naturalWidth / imageObj.naturalHeight;
const canvasAspectRatio = fixedWidth / fixedHeight;

let sx, sy, sWidth, sHeight;

if (imgAspectRatio > canvasAspectRatio) {
  // Image is wider, crop horizontally
  sHeight = imageObj.naturalHeight;
  sWidth = sHeight * canvasAspectRatio;
  sx = (imageObj.naturalWidth - sWidth) / 2;
  sy = 0;
} else {
  // Image is taller, crop vertically
  sWidth = imageObj.naturalWidth;
  sHeight = sWidth / canvasAspectRatio;
  sx = 0;
  sy = (imageObj.naturalHeight - sHeight) / 2;
}

// Draw cropped image
ctx.drawImage(imageObj, sx, sy, sWidth, sHeight, 0, 0, fixedWidth, fixedHeight);

// Convert to Data URL
const croppedDataUrl = tempCanvas.toDataURL("image/jpeg");

// Center image horizontally
const imageX = x + padding;

// Draw image in PDF
doc.addImage(croppedDataUrl, "JPEG", imageX, y, fixedWidth, fixedHeight);
y += fixedHeight + 20;

// Name + QR
// Name + QR
doc.setFont("helvetica", "bold");
doc.setFontSize(20);
doc.setTextColor(0, 0, 0);

const wrappedName = doc.splitTextToSize(item.name, textMaxWidth);
const nameHeight = wrappedName.length * 22;

const qrHeight = 60;
const qrY = y - 5; // Y position of QR
const nameY = qrY + qrHeight - nameHeight; // Align name to bottom of QR

doc.text(wrappedName, x + padding, nameY); // draw name aligned to bottom of QR

const qrElement = document.getElementById(`qr-${item._id}`);
if (qrElement) {
  const qrImg = await convertSVGToPNG(qrElement);
  doc.addImage(qrImg, "PNG", x + cardWidth - padding - 70, qrY, 60, qrHeight);
}

// Add bottom margin of 80px after the name/QR block
y += qrHeight + 10;

// Description
drawDivider();
doc.setFont("helvetica", "normal");
doc.setFontSize(12);
doc.setTextColor(68); // #444

const descLines = doc.splitTextToSize(item.description || "-", textMaxWidth);

// Center-align each line
descLines.forEach((line, index) => {
  const lineWidth = doc.getTextWidth(line);
  const centerX = x + (cardWidth - lineWidth) / 2;
  doc.text(line, centerX, y + index * 18);
});

y += descLines.length * 18 + 20; // update Y after description


    // Save PDF
    doc.save(`${item.name}_menu_card.pdf`);
  } catch (err) {
    console.error("PDF generation failed", err);
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

  {/* 🔍 Search Bar */}
 

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
          paddingTop: "100px",
          paddingBottom:"100px",
          padding:"20px",
          background:"#000000"
        }}
      >
       {filteredItems.map((item) => (
<div
  key={item._id}
  className="menu-card"
  onClick={() => toggleCardExpand(item._id)}
  style={{
    border: "1px solid #ccc",
    overflow: "hidden",
    padding: "35px",
    marginBottom: "20px",
    background: "#ffff", // ✅ Gradient background
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    cursor: "pointer",
    position: "relative",
    transition: "none",
    transform: "none",
    clipPath: "none",
  }}
>

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


  {/* Row 2: Category + Price */}
  <div
    style={{
      display: "flex",
      // justifyContent: "space-between",
      // alignItems: "center",
      marginBottom: "10px",
      marginTop:"0px",
      width:"100%"
    }}
  >
    <p
      style={{
        margin: 0,
        fontWeight: "bold",
        color: "#555",
        width:"50%",
        textAlign:"left",
        wordWrap: "break-word"
      }}
    >
      Category: {item.category}
    </p>
    <strong style={{ color: "#28A745", width:"50%", textAlign:"right", marginTop:"5px", wordWrap: "break-word"  }}>${item.price.toFixed(2)}</strong>
  </div>

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
  <div
    style={{
    display: "flex",
          width: "100%",
          marginBottom: "0px",
          marginTop: "20px",
      
    }}
  >
    <h4  style={{
     margin: 0,
          fontSize: "30px",
          textAlign: "left",
          alignSelf: "flex-end", // ensures heading sticks to top
          width:"60%",
          wordWrap: "break-word"
    }}>{item.name}</h4>
    <QRCode
      id={`qr-${item._id}`}
      size={80}
      bgColor="white"
      fgColor="black"
      style={{width:"40%"}}
      
      value={`${window.location.origin}/view/${restaurantId}/template9`}
    />
  </div>

  {/* Row 3: Description */}
  <p style={{ marginBottom: "0px", color: "#444",width: "100%", wordWrap: "break-word"}}>{item.description}</p>
  



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
      marginTop:"30px",
    }}
  >
    <FaDownload /> Download PDF
  </button>




 
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
