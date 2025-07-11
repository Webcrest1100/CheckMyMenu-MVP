import { useEffect, useState } from "react";
import { api } from "../api";

export default function RestaurantSelector({ onSelect }) {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/restaurant/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurants(res.data);
        if (res.data.length > 0) {
          setSelectedId(res.data[0]._id);
          onSelect(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to load restaurants", err);
      }
    };
    fetchRestaurants();
  }, []);

  const handleChange = (e) => {
    const selected = restaurants.find((r) => r._id === e.target.value);
    setSelectedId(e.target.value);
    onSelect(selected);
  };

  return (
    <div style={{ margin: "20px 0" }}>
      <label style={{ fontWeight: "bold" }}>Choose Restaurant/Branch: </label>
      <select value={selectedId} onChange={handleChange}>
        {restaurants.map((r) => (
          <option key={r._id} value={r._id}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
