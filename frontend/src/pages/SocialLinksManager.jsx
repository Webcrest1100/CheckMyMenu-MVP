import { useEffect, useState } from "react";
import { api } from "../api";

export default function SocialLinksManager({ restaurant }) {
  const [links, setLinks] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
  });

  const fetchLinks = async () => {
    const token = localStorage.getItem("token");
    const res = await api.get(`/restaurant/${restaurant._id}/social-links`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLinks(res.data);
  };

  useEffect(() => {
    if (restaurant) fetchLinks();
  }, [restaurant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await api.post(`/restaurant/${restaurant._id}/social-links`, links, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Links updated!");
  };

  return (
    <div>
      <h2>Social Media Links</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Facebook URL"
          value={links.facebook}
          onChange={(e) => setLinks({ ...links, facebook: e.target.value })}
        />
        <input
          placeholder="Instagram URL"
          value={links.instagram}
          onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
        />
        <input
          placeholder="Twitter URL"
          value={links.twitter}
          onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
        />
        <button type="submit">Save Links</button>
      </form>
    </div>
  );
}
