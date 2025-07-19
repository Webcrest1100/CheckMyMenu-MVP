"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "../api";

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

export default function MenuPage() {
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

  // const handleDownloadPDF = async (item) => {
  //   const doc = new jsPDF("p", "pt", "a4");
  //   const pagePadding = 40;

  //   const imageUrl = item.imageUrl.startsWith("http")
  //     ? item.imageUrl
  //     : `${import.meta.env.VITE_API_URL}${item.imageUrl}`;

  //   // ✅ Convert image to base64
  //   let bgDataUrl;
  //   try {
  //     bgDataUrl = await convertImageToDataURL(imageUrl);
  //   } catch (err) {
  //     console.error("Image load failed:", err);
  //     alert("Failed to load background image.");
  //     return;
  //   }

  //   const pageWidth = doc.internal.pageSize.getWidth();
  //   const pageHeight = doc.internal.pageSize.getHeight();

  //   // ✅ Draw background image (full-page)
  //   try {
  //     doc.addImage(bgDataUrl, "JPEG", 0, 0, pageWidth, pageHeight);
  //   } catch (err) {
  //     console.error("addImage failed:", err);
  //     alert("Error adding image to PDF.");
  //     return;
  //   }

  //   // ✅ Semi-transparent black overlay
  //   doc.setFillColor(0, 0, 0);
  //   doc.setDrawColor(0, 0, 0);
  //   doc.setGState(new doc.GState({ opacity: 0.7 }));
  //   doc.rect(0, 0, pageWidth, pageHeight, "F");

  //   // Reset opacity to 1 for content
  //   doc.setGState(new doc.GState({ opacity: 1 }));

  //   let y = pagePadding + 20;

  //   // ITEM NAME and QR CODE on the same row
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(26);
  //   doc.setTextColor(255, 255, 255);
  //   doc.text(item.name, pagePadding, y + 85); // name vertically centered relative to QR

  //   // QR Code (right side)
  //   const qrElement = document.getElementById(`qr-${item._id}`);
  //   if (qrElement) {
  //     const qrImg = await convertSVGToPNG(qrElement);
  //     doc.addImage(qrImg, "PNG", pageWidth - pagePadding - 100, y, 100, 100);
  //   }

  //   y += 120; // add spacing after QR row

  //   // Divider
  //   doc.setDrawColor(200);
  //   doc.setLineWidth(1);
  //   doc.line(pagePadding, y, pagePadding + 520, y);
  //   y += 20;

  //   // Category & Price
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(14);
  //   doc.setTextColor(255);
  //   doc.text(`Category: ${item.category}`, pagePadding, y);

  //   doc.setTextColor(40, 255, 69);
  //   doc.text(`Price: $${item.price.toFixed(2)}`, pagePadding + 350, y);
  //   y += 30;

  //   // Divider
  //   doc.setDrawColor(200);
  //   doc.setLineWidth(1);
  //   doc.line(pagePadding, y, pagePadding + 520, y);
  //   y += 20;

  //   // Description
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(12);
  //   doc.setTextColor(255);
  //   doc.text("Description:", pagePadding, y);
  //   const splitDesc = doc.splitTextToSize(item.description || "-", 500);
  //   doc.text(splitDesc, pagePadding, y + 20);

  //   // Save
  //   doc.save(`${item.name}_menu_card.pdf`);
  // };

  const handleDownloadPDF = async (item) => {
    const doc = new jsPDF("p", "pt", "a4");
    const pagePadding = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const imageUrl = item.imageUrl.startsWith("http")
      ? item.imageUrl
      : `${import.meta.env.VITE_API_URL}${item.imageUrl}`;

    try {
      const bgDataUrl = await convertImageToDataURL(imageUrl);

      // 🔲 Full-page background image
      doc.addImage(bgDataUrl, "JPEG", 0, 0, pageWidth, pageHeight);

      // 🟫 Black semi-transparent overlay
      doc.setFillColor(0, 0, 0);
      doc.setDrawColor(0, 0, 0);
      doc.setGState(new doc.GState({ opacity: 0.7 }));
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // ♻️ Reset opacity
      doc.setGState(new doc.GState({ opacity: 1 }));

      let y = pagePadding + 20;
      const textWidth = pageWidth * 0.5;
      const priceWidth = pageWidth * 0.3;

      // 🧾 Item Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(255, 255, 255);

      const wrappedName = doc.splitTextToSize(item.name, textWidth);
      doc.text(wrappedName, pagePadding, y);
      const nameHeight = wrappedName.length * 20;

      // 🔳 QR Code
      const qrElement = document.getElementById(`qr-${item._id}`);
      if (qrElement) {
        const qrImg = await convertSVGToPNG(qrElement);
        doc.addImage(
          qrImg,
          "PNG",
          pageWidth - pagePadding - 100,
          y - 65,
          100,
          100
        );
      }

      y += nameHeight + 40;

      // ───── Divider
      doc.setDrawColor(200);
      doc.setLineWidth(1);
      doc.line(pagePadding, y, pagePadding + 520, y);
      y += 20;

      // 🏷️ Category
      doc.setFontSize(14);
      doc.setTextColor(255);
      const wrappedCategory = doc.splitTextToSize(
        `Category: ${item.category}`,
        textWidth
      );
      doc.text(wrappedCategory, pagePadding, y);
      const catHeight = wrappedCategory.length * 16;

      // 💲 Price
      doc.setTextColor(40, 255, 69);
      const priceText = `Price: $${item.price.toFixed(2)}`;
      const wrappedPrice = doc.splitTextToSize(priceText, priceWidth);
      doc.text(wrappedPrice, pagePadding + 350, y);
      const priceHeight = wrappedPrice.length * 16;

      y += Math.max(catHeight, priceHeight) + 20;

      // ───── Divider
      doc.setDrawColor(200);
      doc.line(pagePadding, y, pagePadding + 520, y);
      y += 20;

      // 📝 Description
      doc.setFontSize(12);
      doc.setTextColor(255);
      doc.text("Description:", pagePadding, y);
      const wrappedDesc = doc.splitTextToSize(
        item.description || "-",
        textWidth
      );
      doc.text(wrappedDesc, pagePadding, y + 20);
      const descHeight = wrappedDesc.length * 14;

      y += 20 + descHeight + 20;

      // 💾 Save
      doc.save(`${item.name}_menu_card.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
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

  // // ✅ Helper to load image
  // function loadImage(src) {
  //   return new Promise((resolve, reject) => {
  //     const img = new Image();
  //     img.crossOrigin = "anonymous";
  //     img.onload = () => resolve(img);
  //     img.onerror = reject;
  //     img.src = src;
  //   });
  // }

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
    <div style={dynamicStyles.container}>
      <main style={{ maxWidth: "1048px", margin: "auto" }}>
        <h2 style={{ textAlign: "center", color: dark ? "#fff" : "#343a40" }}>
          Menu Items
        </h2>

        {/* 🔍 Search Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "20px 0",
          }}
        >
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "400px",
              border: "1px solid #ccc",
              fontSize: "16px",
              outline: "none",
            }}
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "block",
            margin: "20px auto",
            padding: "10px 20px",
            backgroundColor: "#28A745",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Add Menu Item
        </button>

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
              <button
                style={{ color: "white", backgroundColor: "#FFC107" }}
                className="scroll-button"
                onClick={scrollLeftFn}
              >
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
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    maxWidth: "400px",
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
                      width: "100%",
                      marginBottom: "0px",
                      marginTop: "20px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "20px",
                        alignItems: "left",
                        textAlign: "left",
                        alignSelf: "flex-end", // ensures heading sticks to top
                        width: "60%",
                        margin: "0px",
                        wordWrap: "break-word",
                      }}
                    >
                      {item.name}
                    </h4>
                  </div>

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
                      marginBottom: "10px",
                      marginTop: "0px",
                      wordWrap: "break-word",
                      width: "100%",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: "bold",
                        color: "#555",
                        width: "50%",
                        textAlign: "left",
                        marginTop: "10px",
                      }}
                    >
                      Category: {item.category}
                    </p>
                    <strong
                      style={{
                        color: "#28A745",
                        width: "50%",
                        textAlign: "right",
                        marginTop: "10px",
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
                      marginBottom: "0px",
                      color: "#444",
                      width: "100%",
                      wordWrap: "break-word",
                      textAlign: "left",
                    }}
                  >
                    {item.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0px",
                      marginTop: "0px",
                      width: "100%",
                      height: "100%",
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
                        marginTop: "30px",
                      }}
                    >
                      <FaDownload /> Download PDF
                    </button>

                    {/* Share Buttons */}
                    <div
                      className="share-container"
                      style={{ marginBottom: "0px" }}
                    >
                      <h4 style={{ marginBottom: "6px", fontSize: "12px" }}>
                        Share This Item
                      </h4>
                      <div
                        className="share-buttons"
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            window.location.origin +
                              `/view/${restaurantId}/menu/${item._id}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Share on WhatsApp"
                          className="share-button"
                          style={{ color: "#25D366", fontSize: "25px" }}
                        >
                          <FaWhatsapp />
                        </a>
                        <a
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/view/${restaurantId}/menu/${item._id}`
                            );
                            // toast.success("Link Copied to Clipboard!");
                          }}
                          className="btn-copy"
                          style={{
                            cursor: "pointer",
                            color: "#000000",
                            fontSize: "23px",
                          }}
                        >
                          <FaLink />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div
                    className="menu-card-actions"
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                    }}
                  >
                    <button
                      className="edit-btn"
                      onClick={() => handleStartEdit(item)}
                      style={{
                        padding: "6px 10px",
                        paddingLeft: "25px",
                        paddingRight: "25px",
                        backgroundColor: "#28A745",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteItem(item._id)}
                      style={{
                        padding: "6px 10px",
                        paddingLeft: "25px",
                        paddingRight: "25px",
                        backgroundColor: "#DC3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length >= 3 && (
              <button
                style={{ color: "white", backgroundColor: "#FFC107" }}
                className="scroll-button"
                onClick={scrollRightFn}
              >
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
            <h4 className="formfield1">
              Name <span style={{ color: "red" }}> * </span>
            </h4>
            <input
              type="text"
              required
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              style={dynamicStyles.input}
            />
            <h4 className="formfield">Description</h4>
            <input
              type="text"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
              style={dynamicStyles.input}
            />
            <h4 className="formfield">
              Price <span style={{ color: "red" }}> * </span>
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
            <h4 className="formfield">
              Category <span style={{ color: "red" }}> * </span>
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
              Image <span style={{ color: "red" }}> * </span>
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
              <button
                type="submit"
                style={{ backgroundColor: "#FFC107" }}
                className="add-btn"
              >
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
            <h4 className="formfield1">
              Name <span style={{ color: "red" }}> * </span>
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
              Price <span style={{ color: "red" }}> * </span>
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
              Category <span style={{ color: "red" }}> * </span>
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
              Image <span style={{ color: "red" }}> * </span>
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
              <button
                type="submit"
                style={{ backgroundColor: "#FFC107", padding: "12px" }}
                className="add-btn"
              >
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
    </div>
  );

  function getStyles(dark) {
    const colors = {
      navy: "#1E2A38",
      green: "#28A745",
      yellow: "#FFC107",
      charcoal: "#343A40",

      scrollButton: {
        fontSize: "1.5rem",
        padding: "0.5rem",
        cursor: "pointer",
        border: "none",
        borderRadius: "50%",
        margin: "0 10px",
      },
    };
    return {
      container: {
        fontFamily: "Montserrat",
        boxSizing: "border-box",
        overflowX: "hidden",
        backgroundColor: "white",
        userSelect:"none",
      },
      main: {
        margin: "40px auto 40px",
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
        marginTop: "40px",
        maxWidth: "90%",
        height: "80vh",
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
