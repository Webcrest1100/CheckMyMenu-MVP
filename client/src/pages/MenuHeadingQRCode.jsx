import React from 'react';
import QRCode from 'react-qr-code';

const MenuQRCode = ({ restaurantId, template = 'Template1', title = "Scan to View Menu" }) => {
  const url = `${window.location.origin}/view/${restaurantId}/${template}`;

  return (
    <>
      <h2 className="menu-heading">Menu Management</h2>
      <div
        style={{
          textAlign: "center",
          marginBottom: "35px",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <h3 style={{ marginTop: "25px", fontSize: "50px" }}>{title}</h3>
        <QRCode
          value={url}
          size={120}
          bgColor="white"
          fgColor="black"
        />
      </div>
    </>
  );
};

export default MenuQRCode;
