// // import QRCode from "react-qr-code";

// // export default function QRCodeGenerator({ restaurantId }) {
// //   if (!restaurantId) return <p className="text-center text-red-500">No restaurant selected</p>;

// //   const menuURL = `${window.location.origin}/view/${restaurantId}`;

// //   return (
// //     <div className="qr-container">
// //       <h3 className="qr-title">Scan to View Menu</h3>
// //       <div style={{ background: "white", padding: "16px", display: "inline-block" }}>
// //         <QRCode value={menuURL} size={180} />
// //       </div>
// //       <p className="qr-url">{menuURL}</p>
// //     </div>
// //   );
// // }



// // import React from "react";

// // export default function QRCodeGenerator({ restaurantId }) {
// //   if (!restaurantId) return <p>No restaurant selected</p>;

// //   const menuURL = `${window.location.origin}/view/${restaurantId}`;
// //   const qrURL = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(menuURL)}`;

// //   return (
// //     <div style={{ textAlign: "center", margin: "2rem" }}>
// //       {/* <h3>Scan to View Menu</h3> */}
// //       <img src={qrURL} alt="QR Code" />
// //       {/* <p style={{ marginTop: "1rem", wordBreak: "break-word" }}>{menuURL}</p> */}
// //     </div>
// //   );
// // }









// import React from "react";

// export default function QRCodeGenerator({ restaurantId }) {
//   if (!restaurantId) {
//     console.log("❌ No restaurant ID provided.");
//     return <p>No restaurant selected</p>;
//   }

//   const menuURL = `${window.location.origin}/view/${restaurantId}`;

//   // Log the values for debugging
//   console.log("✅ Restaurant ID:", restaurantId);
//   console.log("🔗 Menu URL:", menuURL);

//   const encodedURL = encodeURIComponent(menuURL);
//   const qrURL = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodedURL}`;

//   // Also log the final QR URL
//   console.log("🧾 QR Code URL:", qrURL);

//   return (
//     <div style={{ textAlign: "center", margin: "2rem" }}>
//       <h3>Scan to View Menu</h3>
//       <img src={qrURL} alt="QR Code" width="200" height="200" />
//       <p style={{ marginTop: "1rem", wordBreak: "break-word" }}>{menuURL}</p>
//     </div>
//   );
// }







import React from "react";
import QRCode from "react-qr-code";

export default function QRCodeGenerator({ restaurantId }) {
  if (!restaurantId) return <p>No restaurant selected</p>;

  const menuURL = `${window.location.origin}/view/${restaurantId}`;

  return (
    <div style={{ 
      textAlign: "center", 
      margin: "2rem",
      padding: "1rem",
      backgroundColor: "white",
      display: "inline-block"
    }}>
      <QRCode 
        value={menuURL}
        size={200}
        level="H" // Error correction level
      />
    </div>
  );
}