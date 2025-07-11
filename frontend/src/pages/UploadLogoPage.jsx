import React from 'react';
import UploadLogo from "./UploadLogo";
import { useNavigate } from "react-router-dom";

export default function UploadLogoPage() {
  const navigate = useNavigate();
  const restaurantId = localStorage.getItem("restaurantId");

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      
      <UploadLogo restaurantId={restaurantId} />
    </div>
  );
}
