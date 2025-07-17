"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "../api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useTheme } from "./ThemeContext";
import { jsPDF } from "jspdf";
import {
  FaFacebookF,
  FaTwitter,
  FaWhatsapp,
  FaInstagram,
  FaLinkedinIn,
  FaLink,
} from "react-icons/fa";
import QRCode from "react-qr-code";
import { FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Menu.css";
import MenuQRCode from './MenuHeadingQRCode';

export default function Template4() {
  const { dark } = useTheme();
  const [menuItems, setMenuItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
  });
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
  });
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
        const res = await api.get(`/restaurants/${restaurantId}/menu`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenuItems(res.data);
      } catch (err) {
        console.error("Failed to fetch menu items:", err);
      }
    };
    fetchMenuItems();
  }, []);

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

  const scrollLeftFn = () =>
    scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRightFn = () =>
    scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });

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

    // ✅ Ensure full image path for preview
    const imageUrl = item.imageUrl.startsWith("http")
      ? item.imageUrl
      : `${import.meta.env.VITE_API_URL}${item.imageUrl}`;
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

      const res = await api.put(
        `/restaurants/${restaurantId}/menu/${editingItem._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMenuItems((prev) =>
        prev.map((item) => (item._id === editingItem._id ? res.data : item))
      );
      // toast.success("Item updated successfully!");
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
      const res = await api.post(
        `/restaurants/${restaurantId}/menu`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMenuItems([...menuItems, res.data]);
      setNewItem({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
      });
      setImagePreview(null);
      setShowAddModal(false);
      // toast.success("Menu item added");
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
      // toast.success("Item deleted successfully!");
    } catch {
      toast.error("Failed to delete item");
    }
  };
  const dynamicStyles = getStyles(dark);

  const handleDownloadPDF = async (item) => {
    const doc = new jsPDF("p", "pt", "a4");
    const pagePadding = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = pagePadding;

    const contentWidth = (pageWidth - 2 * pagePadding) * 0.5; // 50% of page
    const contentX = (pageWidth - contentWidth) / 2; // center alignment

    try {
      // 🖼️ Load Image
      const imageUrl = item.imageUrl.startsWith("http")
        ? item.imageUrl
        : `${import.meta.env.VITE_API_URL}${item.imageUrl}`;
      const imageDataURL = await convertImageToDataURL(imageUrl);

      // 🟫 Category
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(100, 100, 100);
      const catLines = doc.splitTextToSize(
        `Category: ${item.category}`,
        contentWidth
      );
      catLines.forEach((line) => {
        const lineWidth = doc.getTextWidth(line);
        doc.text(line, (pageWidth - lineWidth) / 2, y);
        y += 18;
      });

      const img = new Image();
      img.src = imageDataURL;
      await new Promise((resolve) => (img.onload = resolve));

      // Fixed dimensions for PDF image area
      const fixedHeight = 250;
      const fullWidth = pageWidth - pagePadding * 2;

      // Original image dimensions
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      const containerAspect = fullWidth / fixedHeight;
      const imageAspect = naturalWidth / naturalHeight;

      // Calculate crop box to simulate object-fit: cover
      let sx = 0,
        sy = 0,
        sWidth = naturalWidth,
        sHeight = naturalHeight;
      if (imageAspect > containerAspect) {
        // Image is too wide, crop left and right
        sWidth = naturalHeight * containerAspect;
        sx = (naturalWidth - sWidth) / 2;
      } else {
        // Image is too tall, crop top and bottom
        sHeight = naturalWidth / containerAspect;
        sy = (naturalHeight - sHeight) / 2;
      }

      // Convert image to canvas to crop it
      const canvas = document.createElement("canvas");
      canvas.width = sWidth;
      canvas.height = sHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
      const croppedDataURL = canvas.toDataURL("image/jpeg");

      // Draw the cropped image to fill container
      doc.addImage(
        croppedDataURL,
        "JPEG",
        pagePadding,
        y,
        fullWidth,
        fixedHeight
      );
      y += fixedHeight + 50;

      // 🧾 Name
      // 🧾 Name (left) + 💲 Price (right) in the same row
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(30, 30, 30);
      const nameLines = doc.splitTextToSize(item.name, contentWidth);

      // Render only first line of name left-aligned
      doc.text(nameLines[0], pagePadding, y);

      // Render price right-aligned
      doc.setFontSize(20);
      doc.setTextColor(40, 167, 69);
      const priceText = `$${item.price.toFixed(2)}`;
      const priceWidth = doc.getTextWidth(priceText);
      doc.text(priceText, pageWidth - pagePadding - priceWidth, y);

      y += 30;

      // Render any extra name lines (if word-wrapped)
      if (nameLines.length > 1) {
        doc.setFontSize(18);
        doc.setTextColor(30, 30, 30);
        for (let i = 1; i < nameLines.length; i++) {
          doc.text(nameLines[i], pagePadding, y);
          y += 20;
        }
      }

      // ─ Divider
      doc.setDrawColor(180);
      doc.setLineWidth(1);
      doc.line(pagePadding, y, pageWidth - pagePadding, y);
      y += 20;

      // 📝 Description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      const descLines = doc.splitTextToSize(
        `Description: ${item.description || "-"}`,
        contentWidth
      );
      descLines.forEach((line) => {
        const lineWidth = doc.getTextWidth(line);
        doc.text(line, (pageWidth - lineWidth) / 2, y);
        y += 14;
      });
      y += 10;

      // 📦 QR Code
      const qrElement = document.getElementById(`qr-${item._id}`);
      if (qrElement) {
        const qrImg = await convertSVGToPNG(qrElement);
        const qrSize = 100;
        const qrX = (pageWidth - qrSize) / 2;
        y += 10;
        doc.addImage(qrImg, "PNG", qrX, y, qrSize, qrSize);
        y += qrSize + 10;
      }

      doc.save(`${item.name}_menu_card.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF");
    }
  };

  // ✅ Utility: Convert image to base64 (cross-browser safe)
  function convertImageToDataURL(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width || img.naturalWidth;
          canvas.height = img.height || img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL("image/jpeg");
          resolve(base64);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src =
        src + (src.includes("?") ? "&" : "?") + "cacheBust=" + Date.now(); // avoid caching
    });
  }

  // ✅ Utility: Convert QR SVG to PNG for jsPDF
  function convertSVGToPNG(svgElement) {
    return new Promise((resolve, reject) => {
      const svg = new XMLSerializer().serializeToString(svgElement);
      const svgBase64 = `data:image/svg+xml;base64,${btoa(svg)}`;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width || 128;
        canvas.height = img.height || 128;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = svgBase64;
    });
  }

  // ✅ Utility: Load image and convert to base64
  function convertImageToDataURL(src) {
    return new Promise((resolve, reject) => {
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
      img.src = src;
    });
  }

  // ✅ Utility: Convert SVG QR to PNG
  function convertSVGToPNG(svgElement) {
    return new Promise((resolve, reject) => {
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
  }

  // Load image as HTMLImageElement
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Convert SVG QR to PNG
  function convertSVGToPNG(svgElement) {
    return new Promise((resolve, reject) => {
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
  }

  // 🧩 Utility: Load image as HTMLImageElement
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // 🧩 Utility: Convert SVG QR to PNG for jsPDF
  function convertSVGToPNG(svgElement) {
    return new Promise((resolve, reject) => {
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
  }

  // Image loader helper
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // SVG to PNG converter for QR
  function convertSVGToPNG(svgElement) {
    return new Promise((resolve, reject) => {
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
  }

  // ✅ Helper to load image
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // ✅ Helper to convert SVG QR to PNG
  function convertSVGToPNG(svgElement) {
    return new Promise((resolve, reject) => {
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
  }

  // ✅ Helper: Load image with Promise
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // ✅ Helper: Convert SVG QR to PNG
  function convertSVGToPNG(svgElement) {
    return new Promise((resolve, reject) => {
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
  }

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCardExpand = (itemId) => {
    setExpandedCard(expandedCard === itemId ? null : itemId);
  };

  return (
    <div
      style={{
        background: dark ? "#1E2A38" : "#f8f9fa",
        minHeight: "100vh",
        fontFamily: "Montserrat",
        overflowX: "hidden",
      }}
    >
      <Navbar />

      <main style={{ maxWidth: "1200px", margin: "auto", padding: "2rem 1rem", fontFamily: "Montserrat" }}>
        {/* <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: "bold", color: "#1e2a38", marginBottom: "2rem"}}>Menu Management</h2>
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
            display: "flex ",
            justifyContent: "center",
            gap: "5px",
          }}
        >
          <h2 style={{ marginBottom: "10px" }}>Scan to View Menu</h2>

          <QRCode
            value={`${window.location.origin}/view/${restaurantId}/template4`}
            size={120}
            bgColor="white"
            fgColor="black"
          />
        </div> */}
        <MenuQRCode restaurantId={restaurantId} />

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
              <button className="scroll-button" style={{ color: "white", backgroundColor: "#FFC107" }} onClick={scrollLeftFn}>
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
                    padding: "5px",
                    marginBottom: "20px",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    minWidth: "400px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform:
                      expandedCard === item._id ? "scale(1.05)" : "scale(1)",
                    zIndex: expandedCard === item._id ? 10 : 1,
                    position: "relative",
                    ...(expandedCard === item._id && {
                      boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                    }),
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontWeight: "bold",
                      color: "#555",
                      marginBottom: "5px",
                      width: "90%",
                      wordWrap: "break-word",
                    }}
                  >
                    {item.category}
                  </p>
                  <img
                    src={
                      item.imageUrl.startsWith("http")
                        ? item.imageUrl
                        : `${import.meta.env.VITE_API_URL}${item.imageUrl}`
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
                      alignItems: "center",
                      marginBottom: "0px",
                      marginTop: "5px",
                      width: "100%",
                    }}
                  >
                    <h5
                      style={{
                        margin: 0,
                        fontSize: "20px",
                        textAlign: "left",
                        alignSelf: "flex-end", // ensures heading sticks to top
                        width: "50%",
                        wordWrap: "break-word",
                      }}
                    >
                      {item.name}
                    </h5>
                    {/**/}

                    <strong
                      style={{
                        color: "#28A745",
                        width: "50%",
                        wordWrap: "break-word",
                        textAlign: "right",
                      }}
                    >
                      ${item.price.toFixed(2)}
                    </strong>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      width: "100%",
                      height: "2px",
                      backgroundColor: "#999", // darker than #ccc
                      marginBottom: "20px",
                      borderRadius: "2px",
                    }}
                  />

                  {/* Row 3: Description */}
                  <p
                    style={{
                      marginBottom: "20px",
                      color: "#444",
                      width: "100%",
                      wordWrap: "break-word",
                      textAlign: "center",
                    }}
                  >
                    {item.description}
                  </p>

                  {/* Visible QR */}
                  <QRCode
                    value={`${window.location.origin}/view/${restaurantId}/template4`}
                    size={120}
                    bgColor="white"
                    fgColor="black"
                  />

                  {/* Hidden QR for PDF rendering */}
                  <div
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      top: "-9999px",
                    }}
                  >
                    <QRCode
                      id={`qr-${item._id}`}
                      value={`${window.location.origin}/view/${restaurantId}/template4`}
                      size={256}
                      bgColor="white"
                      fgColor="black"
                    />
                  </div>

                  {/* PDF Download */}

                  {/* Edit / Delete Buttons */}
                  <div
                    className="menu-card-actions"
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                    }}
                  >
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
                        fontSize: "12px",
                        alignContent: "end",
                        justifyContent: "end",
                        marginTop: "10px",
                      }}
                    >
                      <FaDownload /> Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length >= 3 && (
              <button className="scroll-button" style={{ color: "white", backgroundColor: "#FFC107" }} onClick={scrollRightFn}>
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

      {showAddModal && (
        <div className="modal-overlay-add">
          <form
            className="modal-box-add"
            onSubmit={handleSubmit}
            style={dynamicStyles.form}
          >
            <h4 className="formfield1" style={{ justifyContent: "left" }}>
              Name *
            </h4>
            <input
              type="text"
              required
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              style={dynamicStyles.input}
            />
            <h4 className="formfield" style={{ justifyContent: "left" }}>
              Description
            </h4>
            <input
              type="text"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
              style={dynamicStyles.input}
            />
            <h4 className="formfield" style={{ justifyContent: "left" }}>
              Price *
            </h4>
            <input
              type="number"
              step="0.01"
              required
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
              style={dynamicStyles.input}
            />
            <h4 className="formfield" style={{ justifyContent: "left" }}>
              Category *
            </h4>
            <input
              type="text"
              required
              value={newItem.category}
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value })
              }
              style={dynamicStyles.input}
            />
            {/* <h4 className="formfield1" style={{  justifyContent: "left" }}>Item image </h4> */}
            <h4 className="formfield1" style={{ justifyContent: "left" }}>
              Image *
            </h4>
            <input
              type="file"
              required
              accept="image/*"
              onChange={handleImageChange}
              style={dynamicStyles.input}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  marginTop: "10px",
                }}
              />
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
                gap: "30px",
              }}
            >
              <button type="submit" className="add-btn">
                Add
              </button>
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
          <form
            className="modal-box-add"
            onSubmit={handleEditSubmit}
            style={dynamicStyles.form}
          >
            <h4 className="formfield1" style={{ justifyContent: "left" }}>
              Name *
            </h4>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              style={dynamicStyles.input}
            />

            <h4 className="formfield" style={{ justifyContent: "left" }}>
              Description
            </h4>
            <input
              type="text"
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              style={dynamicStyles.input}
            />

            <h4 className="formfield" style={{ justifyContent: "left" }}>
              Price
            </h4>
            <input
              type="number"
              step="0.01"
              required
              value={editForm.price}
              onChange={(e) =>
                setEditForm({ ...editForm, price: e.target.value })
              }
              style={dynamicStyles.input}
            />

            <h4 className="formfield" style={{ justifyContent: "left" }}>
              Category
            </h4>
            <input
              type="text"
              required
              value={editForm.category}
              onChange={(e) =>
                setEditForm({ ...editForm, category: e.target.value })
              }
              style={dynamicStyles.input}
            />

            <h4 className="formfield" style={{ justifyContent: "left" }}>
              Image
            </h4>
            <input
              type="file"
              accept="image/*"
              onChange={handleEditImageChange}
              style={dynamicStyles.input}
            />

            {editImagePreview && (
              <img
                src={editImagePreview}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  marginTop: "10px",
                }}
              />
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
                gap: "30px",
              }}
            >
              <button type="submit" className="add-btn">
                Update
              </button>
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

  function getStyles(dark) {
    const colors = {
      navy: "#1E2A38",
      green: "#28A745",
      yellow: "#FFC107",
      white: "#F8F9FA",
      charcoal: "#343A40",

      scrollButton: {
        fontSize: "1.5rem",
        padding: "0.5rem",
        cursor: "pointer",
        border: "none",
        backgroundColor: dark ? "#1E2A38" : "#F8F9FA",
        color: dark ? "#FFFFFF" : "#000000",
        borderRadius: "50%",
        margin: "0 10px",
      },
    };
    return {
      container: {
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "#F8F9FA",
        minHeight: "100vh",

        boxSizing: "border-box",
        color: dark ? colors.white : colors.charcoal,
      },
      main: {
        margin: "40px auto 40px",
        padding: "40px 20px 50px",
        background: dark ? "#263544" : "#ffff",
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
        marginTop: "40px",
        maxWidth: "90%",
      },
      welcome: {
        fontSize: "28px",
        color: dark ? colors.white : colors.charcoal,
        textAlign: "center",
        marginBottom: "20px",
      },
      email: {
        fontWeight: "normal",
        color: dark ? "#C0C0C0" : "#666",
        fontStyle: "italic",
      },
      heading: {
        fontSize: "22px",
        margin: "30px 0 15px",
        color: dark ? colors.white : colors.charcoal,
        borderBottom: `2px solid ${colors.navy}`,
        paddingBottom: "5px",
        textAlign: "center",
      },
      cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "40px",
      },
      cardId: {
        fontSize: "12px",
        color: dark ? "#bbb" : "#777",
        marginTop: "6px",
      },
      link: {
        color: dark ? "#FFC107" : "#007BFF",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "bold",
        marginRight: "5px",
      },
      form: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0px",
        marginTop: "40px",
      },
      input: {
        padding: "10px",
        borderRadius: "8px",
        border: `1px solid ${dark ? "#3a3a3a" : "#ccc"}`,
        width: "80%",
        maxWidth: "400px",
        outline: "none",
        fontSize: "16px",
        backgroundColor: dark ? "#1E2A38" : colors.white,
        color: dark ? "#fff" : "#000",
        transition: "border 0.2s ease",
      },
      button: {
        padding: "10px 20px",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer",
        marginTop: "20px",
      },
      boxbut: {
        padding: "0px 10px 0px 10px",
        color: "white",
      },
    };
  }
}
