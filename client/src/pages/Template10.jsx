"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "../api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useTheme } from "./ThemeContext";
import { jsPDF } from "jspdf";
import QRCode from "react-qr-code";
import {
  FaFacebookF,
  FaTwitter,
  FaWhatsapp,
  FaInstagram,
  FaLinkedinIn,
  FaLink,
  FaEdit,
  FaTrash,
  FaDownload,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Menu.css";
import UploadLogo from "./UploadLogo";
import MenuQRCode from './MenuHeadingQRCode';

export default function Template10() {
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
  const fontOptions = [
    "Arial",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Verdana",
    "Tahoma",
    "Trebuchet MS",
    "Lucida Console",
    "Segoe UI",
    "Comic Sans MS",
  ];
  const [cardFonts, setCardFonts] = useState({});
  const colorOptions = [
    "#ffffff",
    "#f8f9fa",
    "#ffc107",
    "#28a745",
    "#343a40",
    "#007bff",
    "#6f42c1",
    "#dc3545",
    "#17a2b8",
    "#fd7e14",
    "#20c997",
    "#6610f2",
    "#e83e8c",
    "#ff6b6b",
    "#1E2A38",
    "#00bcd4",
    "#9c27b0",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ff9800",
    "#795548",
    "#607d8b",
    "#3f51b5",
    "#f44336",
    "#2196f3",
    "#00bfa5",
    "#ff5722",
    "#880e4f",
  ];
  const [cardColors, setCardColors] = useState({});
  const [restaurantLogoUrl, setRestaurantLogoUrl] = useState(null);
  const [fontColors, setFontColors] = useState({});

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        if (!restaurantId) return;

        const res = await api.get(`/restaurants/${restaurantId}/menu`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMenuItems(res.data);

        const fonts = {};
        const colors = {};
        const fontColorMap = {};

        res.data.forEach((item) => {
          fonts[item._id] = item.font || "Arial";
          colors[item._id] = item.color || "#ffffff";
          fontColorMap[item._id] = item.fontColor || "#000000";
        });

        setCardFonts(fonts);
        setCardColors(colors);
        setFontColors(fontColorMap);
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

  const scrollLeftFn = () =>
    scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRightFn = () =>
    scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
  const convertImageToDataURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (e) => {
        console.error("❌ Failed to load image", url, e);
        reject(e);
      };
      img.src = url;
    });
  };
  const convertSVGToPNG = (svgElement) =>
    new Promise((resolve, reject) => {
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
  const fontMap = {
    Arial: "helvetica",
    Helvetica: "helvetica",
    "Times New Roman": "times",
    Georgia: "times",
    "Courier New": "courier",
    Verdana: "helvetica",
    Tahoma: "helvetica",
    "Trebuchet MS": "helvetica",
    "Lucida Console": "courier",
    "Segoe UI": "helvetica",
    "Comic Sans MS": "courier",
  };

  const handleDownloadPDF = async (item) => {
    const doc = new jsPDF("p", "pt", "a4");
    const pagePadding = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = pagePadding;

    const fontFamily = cardFonts[item._id] || "Arial";
    const jsPDFfont = fontMap[fontFamily] || "helvetica";
    const bgColor = cardColors[item._id] || "#ffffff";
    const fontColor = fontColors[item._id] || "#000000";
    const contentWidth = (pageWidth - 2 * pagePadding) * 0.5;

    const hexToRgb = (hex) => {
      const bigint = parseInt(hex.replace("#", ""), 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    };

    try {

      const [bgR, bgG, bgB] = hexToRgb(bgColor);
      doc.setFillColor(bgR, bgG, bgB);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      const logoUrl = restaurantLogoUrl;
      if (logoUrl) {
        const logoData = await convertImageToDataURL(logoUrl);
        const logoWidth = 100;
        const logoHeight = 100;
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(logoData, "PNG", logoX, y, logoWidth, logoHeight);
      }

      y += 120;

      const imageUrl = item.imageUrl.startsWith("http")
        ? item.imageUrl
        : `${import.meta.env.VITE_API_URL}${item.imageUrl}`;
      const itemImageData = await convertImageToDataURL(imageUrl);

      const img = new Image();
      img.src = itemImageData;
      await new Promise((resolve) => (img.onload = resolve));

      const targetWidth = pageWidth - 2 * pagePadding;
      const targetHeight = 250;

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      const imgRatio = img.width / img.height;
      const targetRatio = targetWidth / targetHeight;

      let srcX = 0,
        srcY = 0,
        srcW = img.width,
        srcH = img.height;
      if (imgRatio > targetRatio) {
        srcW = img.height * targetRatio;
        srcX = (img.width - srcW) / 2;
      } else {
        srcH = img.width / targetRatio;
        srcY = (img.height - srcH) / 2;
      }

      ctx.drawImage(
        img,
        srcX,
        srcY,
        srcW,
        srcH,
        0,
        0,
        targetWidth,
        targetHeight
      );
      const croppedImageData = canvas.toDataURL("image/jpeg");
      doc.addImage(
        croppedImageData,
        "JPEG",
        pagePadding,
        y,
        targetWidth,
        targetHeight
      );
      y += targetHeight + 80;

      const [r, g, b] = hexToRgb(fontColor);
      doc.setFont(jsPDFfont, "bold");
      doc.setFontSize(26);
      doc.setTextColor(r, g, b);

      const wrappedName = doc.splitTextToSize(item.name, contentWidth);
      const nameHeight = wrappedName.length * 24;

      y += 10;
      doc.text(wrappedName, pagePadding, y);

      y += nameHeight + -80;

      const qrSize = 80;
      const qrElement = document.getElementById(`qr-${item._id}`);
      if (qrElement) {
        const qrImg = await convertSVGToPNG(qrElement);
        doc.addImage(
          qrImg,
          "PNG",
          pageWidth - pagePadding - qrSize,
          y - 10,
          qrSize,
          qrSize
        );
      }

      y += Math.max(nameHeight, qrSize) + 30;

      // Divider
      doc.setDrawColor(100);
      doc.setLineWidth(1);
      doc.line(pagePadding, y, pageWidth - pagePadding, y);
      y += 20;

      doc.setFontSize(14);
      doc.setFont(jsPDFfont, "normal");
      doc.setTextColor(r, g, b);

      const categoryLines = doc.splitTextToSize(
        `Category: ${item.category}`,
        contentWidth
      );
      doc.text(categoryLines, pagePadding, y);
      const catHeight = categoryLines.length * 18;

      y += catHeight + 10;

      const priceText = `Price: $${item.price.toFixed(2)}`;
      doc.text(priceText, pagePadding, y);

      y += 30;

      // Divider
      doc.line(pagePadding, y, pageWidth - pagePadding, y);
      y += 20;

      doc.setFontSize(12);
      const descLines = doc.splitTextToSize(
        `Description: ${item.description || "-"}`,
        contentWidth
      );

      descLines.forEach((line, index) => {
        const lineWidth = doc.getTextWidth(line);
        const x = (pageWidth - lineWidth) / 2;
        doc.text(line, x, y + index * 18);
      });

      y += descLines.length * 18 + 20;

      doc.save(`${item.name}_menu_card.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCardExpand = (itemId) => {
    setExpandedCard(expandedCard === itemId ? null : itemId);
  };
  const dynamicStyles = getStyles(dark);
  const handleFontChange = async (itemId, selectedFont) => {
    try {
      console.log("Updating font for item ID:", itemId); // :wood: debug
      setCardFonts((prev) => ({ ...prev, [itemId]: selectedFont }));
      await api.put(`/restaurants/menu/${itemId}`, { font: selectedFont }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Font updated!");
    } catch (err) {
      console.error("Failed to update font:", err);
    }
  };
  const handleColorChange = async (itemId, selectedColor) => {
    try {
      console.log("Updating color for item ID:", itemId);
      setCardColors((prev) => ({ ...prev, [itemId]: selectedColor }));
      await api.put(`/restaurants/menu/${itemId}`, { color: selectedColor }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Color updated!");
    } catch (err) {
      console.error("Failed to update color:", err);
      toast.error("Color update failed!");
    }
  };
  const handleFontColorChange = async (itemId, selectedColor) => {
    try {
      setFontColors((prev) => ({ ...prev, [itemId]: selectedColor }));
      await api.put(`/restaurants/menu/${itemId}`, { fontColor: selectedColor }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Font color updated!");
    } catch (err) {
      console.error("Failed to update font color:", err);
      toast.error("Font color update failed!");
    }
  };

  return (
    <div
      style={{
        background: dark ? "#1E2A38" : "#f8f9fa",
        minHeight: "100vh",
        fontFamily: "Montserrat",
      }}
    >
      <Navbar />
      <main style={{ padding: "40px 20px" }}>
        <MenuQRCode restaurantId={restaurantId} template="template1" />

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
                    padding: "16px",
                    marginBottom: "20px",
                    backgroundColor: cardColors[item._id] || "#fff",
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
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "bold" }}>
                      Font:
                    </label>
                    <select
                      value={cardFonts[item._id] || "Arial"}
                      onChange={(e) =>
                        handleFontChange(item._id, e.target.value)
                      }
                      style={{
                        marginLeft: "10px",
                        padding: "4px",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    >
                      {fontOptions.map((font) => (
                        <option
                          key={font}
                          value={font}
                          style={{ fontFamily: font }}
                        >
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "18px",
                    }}
                  >
                    <div>
                      <div style={{ marginTop: "10px" }}>
                        <label style={{ fontSize: "12px", fontWeight: "bold" }}>
                          Card Color:
                        </label>
                        <select
                          value={cardColors[item._id] || "#ffffff"}
                          onChange={(e) =>
                            handleColorChange(item._id, e.target.value)
                          }
                          style={{
                            marginLeft: "10px",
                            padding: "4px",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                        >
                          {colorOptions.map((color) => (
                            <option
                              key={color}
                              value={color}
                              style={{ backgroundColor: color }}
                            >
                              {color}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: "10px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "bold" }}>
                        Font Color:
                      </label>
                      <select
                        value={fontColors[item._id] || "#000000"}
                        onChange={(e) =>
                          handleFontColorChange(item._id, e.target.value)
                        }
                        style={{
                          marginLeft: "10px",
                          padding: "4px",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      >
                        {[
                          "#000000",
                          "#ffffff",
                        ].map((color) => (
                          <option
                            key={color}
                            value={color}
                            style={{ backgroundColor: color }}
                          >
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* <UploadLogo restaurantId={restaurantId} setLogoInParent={setRestaurantLogoUrl}  /> */}
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
                      paddingTop: "20px",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      marginBottom: "0px",
                      marginTop: "20px",
                    }}
                  >
                    {/* <div style={{ fontFamily: cardFonts[item._id] || "Arial" }}> */}
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "25px",
                        textAlign: "left",
                        alignSelf: "flex-end",
                        wordWrap: "break-word",
                        width: "50%",
                        color: fontColors[item._id] || "#000000",
                      }}
                    >
                      {item.name}
                    </h4>

                    <QRCode
                      id={`qr-${item._id}`}
                      size={80}
                      bgColor="white"
                      fgColor="black"
                      value={`${window.location.origin}/view/${restaurantId}/template10`}
                      style={{ width: "50%" }}
                    />
                  </div>
                  {/* Divider */}
                  <div
                    style={{
                      width: "100%",
                      height: "2px",
                      backgroundColor: "#999",
                      margin: "10px ",
                      borderRadius: "2px",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                      marginTop: "0px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: cardFonts[item._id] || "Arial",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <p
                        style={{
                          marginBottom: "10px",
                          fontWeight: "bold",
                          width: "50%",

                          textAlign: "left",
                          wordWrap: "break-word",
                          color: fontColors[item._id] || "#555",
                        }}
                      >
                        Category: {item.category}
                      </p>

                      <strong
                        style={{
                          color: fontColors[item._id] || "#28A745",
                          textAlign: "left",
                          alignItems: "left",
                          width: "100%",
                          wordWrap: "break-word",
                        }}
                      >
                        ${item.price.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                  {/* Divider */}
                  <div
                    style={{
                      width: "100%",
                      height: "2px",
                      backgroundColor: "#999",
                      marginBottom: "20px",
                      borderRadius: "2px",
                    }}
                  />
                  {/* <div style={{ fontFamily: cardFonts[item._id] || "Arial" }}> */}

                  <p
                    style={{
                      marginTop: "10pxx",
                      marginBottom: "0px",
                      color: fontColors[item._id] || "#444",
                      width: "100%",
                      wordWrap: "break-word",
                      textAlign: "center",
                    }}
                  >
                    {item.description}
                  </p>

                  {/* </div> */}
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
