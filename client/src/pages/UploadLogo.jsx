

import { useEffect, useState } from "react";
import { api } from "../api";
import "./UploadLogo.css";

export default function UploadLogo({ restaurantId, setLogoInParent }) {
  const [logoUrl, setLogoUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch existing logo
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await api.get(`/logo/${restaurantId}`);
        if (res.data.logo) {
          const fullUrl = `${import.meta.env.VITE_API_URL}${res.data.logo}`;
          setLogoUrl(fullUrl);
          setLogoInParent?.(fullUrl); // LIFT TO PARENT
        }
      } catch (err) {
        console.error("Failed to fetch logo", err);
      }
    };
    if (restaurantId) fetchLogo();
  }, [restaurantId, setLogoInParent]);

  // Upload logo
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !restaurantId) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      setUploading(true);
      const res = await api.put(`/logo/${restaurantId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const fullUrl = `${import.meta.env.VITE_API_URL}${res.data.logo}`;
      setLogoUrl(fullUrl);
      setLogoInParent?.(fullUrl); // UPDATE PARENT
      setShowModal(false);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  // Delete logo
  const handleDelete = async () => {
    try {
      await api.delete(`/logo/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setLogoUrl(null);
      setLogoInParent?.(null); // CLEAR PARENT
    } catch (err) {
      console.error("Failed to delete logo", err);
      alert("Error deleting logo");
    }
  };

  return (
    <div className="upload-logo-wrapper">
      <div className="logo-circle" style={{ position: "relative" }} onClick={() => !logoUrl && setShowModal(true)}>
        {logoUrl ? (
          <>
            <img
              src={logoUrl}
              alt="Restaurant Logo"
              className="logo-image"
              style={{ width: "100%" }}
            />
            <button
              onClick={handleDelete}
              className="delete-logo-btn"
              title="Remove Logo"
            >
              ×
            </button>
          </>
        ) : (
          <span
            className="logo-placeholder"
            style={{ background: "#fff", borderRadius: "20px" }}
          >
            +
          </span>
        )}
      </div>

      {showModal && (
        <div className="modal-overla111">
          <div className="modal-boax">
            <h3>Upload Logo</h3>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={() => setShowModal(false)} disabled={uploading}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
