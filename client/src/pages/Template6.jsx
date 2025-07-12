"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "../api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useTheme } from "./ThemeContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";
import { FaDownload } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Template6.css";
export default function Template6() {
  const { dark } = useTheme();
  const [menuItems, setMenuItems] = useState([]);
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");
  const cardRefs = useRef({});
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
  const handleDownloadPDF = async (item) => {
    const element = cardRefs.current[item._id];
    if (!element) return toast.error("Card not found for PDF");
    const button = element.querySelector(".btn-download");
    if (button) button.style.display = "none"; // Hide button temporarily
    try {
      // :white_check_mark: Wait for image inside card to fully load
      const img = element.querySelector("img");
      if (img && !img.complete) {
        await new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }
      // :white_check_mark: Wait for layout + QR to finish rendering
      await new Promise((resolve) => setTimeout(resolve, 300));
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = 40;
      const y = 60;
      pdf.setFillColor(248, 249, 250);
      pdf.rect(0, 0, pageWidth, pdf.internal.pageSize.getHeight(), "F");
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`${item.name}_menu_card.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF");
    } finally {
      if (button) button.style.display = "flex"; // Restore button
    }
  };
  return (
    <div style={{ background: dark ? "#1E2A38" : "#F8F9FA", minHeight: "100vh", fontFamily: "Montserrat", overflowX:"hidden" }}>
      <Navbar />
      <main style={{ padding: "40px 20px" }}>
        <h2 style={{ textAlign: "center", color: dark ? "#fff" : "#343A40" }}>Menu Items</h2>
        <div style={{ textAlign: "center", marginBottom: "30px", display: "flex", justifyContent: "center", gap: "10px" }}>
          <h2 style={{ marginBottom: "10px" }}>Scan to View Menu</h2>
          <QRCode
            value={`${window.location.origin}/view/${restaurantId}/template6`}
            size={120}
            bgColor="white"
            fgColor="black"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "20px"}}>
          {menuItems.map((item) => (
            <div
              key={item._id}
              ref={(el) => (cardRefs.current[item._id] = el)}
              className="menu-card"
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
                maxWidth: "100%",
                gap: "20px",
                background: "#F8F9FA",
              }}
            >
              <div style={{ }}>
              
                <img
                  src={
                    item.imageUrl.startsWith("http")
                      ? item.imageUrl
                      : `http://localhost:5000${item.imageUrl}`
                  }
                  alt={item.name}
                  style={{
                    
                    // height: "300px" ,
                    // objectFit: "cover",
                    borderRadius: "8px",
                    width: "420px" 
                  }}
                />
              </div>
           
              
              <QRCode
                id={`qr-hidden-${item._id}`}
                value={`${window.location.origin}/view/${restaurantId}/template6`}
                size={120}
                bgColor="white"
                fgColor="black"
                style={{
                    width: "20%" 
                  }}
              />
              
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "end",
                  justifyContent: "center",
                  height: "100%",
                  gap: "20px",
                  width:"420px"
                }}
              ><p
      style={{
        margin: 0,
        fontWeight: "bold",
        color: "#555",
        textAlign: "right",
    width:"50%",
    wordWrap: "break-word"
      }}
    >
      Category: {item.category}
    </p>
               
                <div style={{ fontSize: "40px", fontWeight: "bold", textAlign: "right" , width:"100%" ,wordWrap: "break-word"}}>
                  {item.name}
                </div>
                <div style={{ fontSize: "38px", color: "#28A745", fontWeight: "bold", textAlign: "right", width:"100%",wordWrap: "break-word" }}>
                  ${item.price.toFixed(2)}
                </div>
                <button
                  onClick={() => handleDownloadPDF(item)}
                  className="btn-download"
                  title="Download as PDF"
                  style={{
                    backgroundColor: "#FFC107",
                    color: "#ffff",
                    padding: "5px 10px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "12px",
                    maxWidth: "250px",
                  }}
                >
                  <FaDownload /> Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
      <Footer />
    </div>
  );
}