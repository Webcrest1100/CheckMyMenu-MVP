


'use client';
import { useEffect, useState, useRef } from "react";

import { api } from "../api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useTheme } from "./ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";


export default function Template3() {
  const { dark } = useTheme();
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");
  const pdfRef = useRef(null);


  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get(`/restaurants/${restaurantId}/menu`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Only keep relevant fields
        const trimmed = res.data.map(({ name, price, category }) => ({
          name,
          price,
          category,
        }));
        setMenuItems(trimmed);
      } catch (err) {
        console.error("Error fetching menu:", err);
        
      }
    };

    fetchMenu();
  }, []);

  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const { name, price, category } = newItem;

    if (!name || !price || !category) {
     
      return;
    }

    try {
      const res = await api.post(
        `/restaurants/${restaurantId}/menu`,
        { name, price, category },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMenuItems([...menuItems, res.data]);
      setNewItem({ name: "", price: "", category: "" });
      
      setShowAddForm(false);
    } catch (err) {
      
    }
  };

  // ✅ Group items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});



const handleDownloadPDF = async () => {
  const input = pdfRef.current;
  if (!input) {
   
    return;
  }

  try {
    // Optional: scroll to top if you have floating headers or fixed nav
    window.scrollTo(0, 0);

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // Keep transparent bg
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Adjust height if too long for one page
    if (pdfHeight > pdf.internal.pageSize.getHeight()) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    } else {
      const marginY = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;
      pdf.addImage(imgData, "PNG", 0, marginY, pdfWidth, pdfHeight);
    }

    pdf.save("restaurant_menu.pdf");
   
  } catch (err) {
    
    console.error("PDF Error:", err);
  }
};



  return (
      <div style={{overflowX:"hidden"}}>
        <Navbar  />
    <main style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto",fontFamily:"Montserrat", overflowX:"hidden" }}>
  
<button
  onClick={handleDownloadPDF}
  style={{
    margin: "20px auto",
    display: "block",
    padding: "10px 20px",
    backgroundColor: "#FFC107",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  }}
>
  Download Menu as PDF
</button>



  {/* 🟤 Dark brown card with heading inside */}
 <div ref={pdfRef} style={{ backgroundColor: "#4E342E", padding: "30px", borderRadius: "12px", marginTop: "40px" }}>

    <h2 style={{ textAlign: "center", color: "#FFC107", fontSize: "32px", marginBottom: "30px", width:"90%",
    wordWrap: "break-word" }}>
      My Restaurant
    </h2> 
    <QRCode
    value={`${window.location.origin}/view/${restaurantId}/template3`}
    size={80}
    bgColor="white"
    fgColor="black"
    
  />

    {Object.entries(groupedItems).map(([category, items]) => (
      <div key={category} style={{ width:"100%",marginBottom: "30px" }}>
        <h3
          style={{
            color: "#FFC107",
            borderBottom: "1px solid #FFC107",
            paddingBottom: "6px",
            fontSize: "20px",
            textAlign: "left",
    width:"100%",
    wordWrap: "break-word"
          }}
        >
          {category}
        </h3>
        {items.map((item, idx) => (
          <div
            key={`${item.name}-${idx}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #BCAAA4",
              width:"100%"
            }}
          >
            <span style={{ fontWeight: "500", color: "#FFFFFF",width:"50%",wordWrap: "break-word",textAlign:"left"
             }}>{item.name}</span>
            <span style={{ fontWeight: "bold", color: "#FFFFFF",width:"50%",wordWrap: "break-word",textAlign:"right" }}>
              ${parseFloat(item.price).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    ))}
  </div>
</main>
<Footer/>
</div>
  );
}

const labelStyle = {
  fontWeight: "bold",
  display: "block",
  marginBottom: "6px",
};

const inputStyle = (dark) => ({
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  width: "100%",
  backgroundColor: dark ? "#1E2A38" : "#fff",
  color: dark ? "#fff" : "#000",
});






