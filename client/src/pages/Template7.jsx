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
import "./Template7.css";
import MenuQRCode from './MenuHeadingQRCode';

export default function Template7() {
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
    const imageUrl = item.imageUrl?.startsWith("http")
      ? item.imageUrl
      : `http://localhost:5000${item.imageUrl}`;
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

  const convertImageToDataURL = (src) =>
    new Promise((resolve, reject) => {
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
      img.src =
        src + (src.includes("?") ? "&" : "?") + "cacheBust=" + Date.now();
    });

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

  const handleDownloadPDF = async (item) => {
    const doc = new jsPDF("p", "pt", "a4");

    const padding = 25;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const cardWidth = pageWidth - padding * 1;
    const cardX = padding;
    const cardY = 100;
    const imageHeight = 160;
    const contentX = cardX + 20;
    let contentY = cardY + imageHeight + 90;
    const textWidth = cardWidth * 4;
    const priceBoxWidth = cardWidth * 0.3;

    try {
      // 🖼️ Image conversion
      const imageUrl = item.imageUrl.startsWith("http")
        ? item.imageUrl
        : `http://localhost:5000${item.imageUrl}`;
      const imgData = await convertImageToDataURL(imageUrl);

      // 🔳 QR code conversion
      const qrElement = document.getElementById(`qr-hidden-${item._id}`);
      if (!qrElement) return toast.error("QR code not found");
      const qrImg = await convertSVGToPNG(qrElement);

      // 📐 Start layout calculations
      doc.setFont("times", "bold");
      doc.setFontSize(26);
      const wrappedName = doc.splitTextToSize(item.name, textWidth);
      const nameHeight = wrappedName.length * 22;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      const wrappedCat = doc.splitTextToSize(
        `Category: ${item.category}`,
        textWidth
      );
      const catHeight = wrappedCat.length * 18;
      const priceHeight = 18;

      const dividerHeight = 25;

      doc.setFontSize(12);
      const desc = item.description || "No description provided.";
      const wrappedDesc = doc.splitTextToSize(desc, cardWidth - 40);
      const descHeight = wrappedDesc.length * 14;

      const additionalSpacing =
        30 + // top spacing after image
        nameHeight +
        (wrappedName.length > 1 ? 20 : 10) +
        Math.max(catHeight, priceHeight) +
        (Math.max(catHeight, priceHeight) > 18 ? 20 : 10) +
        dividerHeight +
        descHeight +
        30; // bottom margin after description

      const cardHeight = imageHeight + additionalSpacing + 100;

      // 🎨 Page background
      doc.setFillColor(34, 34, 34);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // 🟦 Card shape (zigzag, now dynamic height)
      drawZigzagCard(doc, cardX, cardY, cardWidth, cardHeight, 12);

      // 🔳 Left and Right border color (#343434)
      doc.setFillColor(52, 52, 52); // #343434

      // Left border strip
      doc.rect(cardX, cardY + 12, 10, cardHeight - 24, "F");

      // Right border strip
      doc.rect(cardX + cardWidth - 10, cardY + 12, 10, cardHeight - 24, "F");

      doc.addImage(
        imgData,
        "JPEG",
        cardX + 10,
        cardY + 10,
        cardWidth - 20,
        imageHeight
      );

      // 🔳 QR
      doc.addImage(
        qrImg,
        "PNG",
        cardX + cardWidth - 90,
        cardY + imageHeight + 20,
        70,
        70
      );

      // 📝 Name
      doc.setFont("times", "bold");
      doc.setFontSize(26);
      doc.setTextColor(35, 35, 85);
      doc.text(wrappedName, contentX, contentY);
      contentY += nameHeight + (wrappedName.length > 1 ? 20 : 10);

      doc.setDrawColor(180);
      doc.setLineWidth(1);
      doc.line(contentX, contentY, cardX + cardWidth - 20, contentY);
      contentY += 25;

      // 🏷️ Category + Price
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.setTextColor(85, 85, 85);
      doc.text(wrappedCat, contentX, contentY);

      doc.setTextColor(40, 167, 69);
      const priceText = `$${item.price.toFixed(2)}`;
      doc.text(priceText, cardX + cardWidth - 20, contentY, { align: "right" });

      contentY +=
        Math.max(catHeight, priceHeight) +
        (Math.max(catHeight, priceHeight) > 18 ? 20 : 10);

      // Divider
      doc.setDrawColor(180);
      doc.setLineWidth(1);
      doc.line(contentX, contentY, cardX + cardWidth - 20, contentY);
      contentY += 25;

      // 🧾 Description
      doc.setFontSize(12);
      doc.setTextColor(68, 68, 68);
      doc.text(wrappedDesc, pageWidth / 2, contentY, { align: "center" });

      // 💾 Save
      doc.save(`${item.name}_zigzag_card.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF");
    }
  };

  // 🔷 Zigzag Card Drawer
  const drawZigzagCard = (doc, x, y, width, height, zigzagHeight = 10) => {
    const spikes = Math.floor(width / (zigzagHeight * 2));
    const zigzagWidth = width / spikes;

    // Build top zigzag
    const topPath = [];
    let isPeak = true;
    for (let i = 0; i <= spikes; i++) {
      const xPos = x + i * zigzagWidth;
      const yPos = isPeak ? y : y + zigzagHeight;
      topPath.push([zigzagWidth, isPeak ? -zigzagHeight : zigzagHeight]);
      isPeak = !isPeak;
    }

    // Bottom zigzag
    const bottomPath = [];
    isPeak = true;
    for (let i = 0; i <= spikes; i++) {
      const xPos = x + i * zigzagWidth;
      const yPos = isPeak ? y + height : y + height - zigzagHeight;
      bottomPath.push([zigzagWidth, isPeak ? zigzagHeight : -zigzagHeight]);
      isPeak = !isPeak;
    }

    // Draw top
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y + zigzagHeight, width, height - 2 * zigzagHeight, "F"); // Center body
    doc.lines(topPath, x, y + zigzagHeight, [1, 1], "F"); // Top zigzag
    doc.lines(bottomPath, x, y + height - zigzagHeight, [1, 1], "F"); // Bottom zigzag
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCardExpand = (itemId) => {
    setExpandedCard(expandedCard === itemId ? null : itemId);
  };

  const dynamicStyles = getStyles(dark);

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
             <MenuQRCode restaurantId={restaurantId} template="template7" />

        {filteredItems.length > 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              userSelect: "none",
              background: "#343434",
              paddingBottom: "80px",
            
            }}
          >
            {filteredItems.length >= 3 && (
              <button className="scroll-button" style={{color:"white", backgroundColor:"#FFC107"}} onClick={scrollLeftFn}>
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
                marginTop:"65px"
              }}
            >
              {filteredItems.map((item) => (
                <>
                  <div />
                  <div
                    className="menu-card menu-zigzag"
                    key={item._id}
                    onClick={() => toggleCardExpand(item._id)}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "10px",
                      padding: "16px",
                      paddingBottom: "30px",
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      maxWidth: "400px",
                      width: "100%",
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
                        // justifyContent: "space-between",
                        // alignItems: "left",
                        width: "100%",
                        marginBottom: "0px",
                        marginTop: "20px",
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "25px",
                          textAlign: "left",
                          alignSelf: "flex-end", // ensures heading sticks to top
                          width: "60%",
                          wordWrap: "break-word",
                        }}
                      >
                        {item.name}
                      </h4>
                      <QRCode
                        id={`qr-hidden-${item._id}`}
                        size={100}
                        bgColor="white"
                        fgColor="black"
                        style={{ width: "40%" }}
                        value={`${window.location.origin}/view/${restaurantId}/template7`}
                      />
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
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                        marginTop: "0px",
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
                          wordWrap: "break-word",
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
                          wordWrap: "break-word",
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
                      }}
                    >
                      {item.description}
                    </p>

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

                    {/* PDF Download */}

                    {/* Edit / Delete Buttons */}
                  </div>
                </>
              ))}
            </div>
            {filteredItems.length >= 3 && (
              <button className="scroll-button" style={{color:"white", backgroundColor:"#FFC107"}} onClick={scrollRightFn}>
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
