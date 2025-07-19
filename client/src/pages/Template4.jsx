import React, { useEffect, useState } from "react";
import "./template4.css";
import { fetchMenuData } from "../utils/fetchMenuItems";
import { useParams } from "react-router-dom";

// Utility: group items by category
function groupByCategory(items) {
  const groups = {};
  items.forEach((item) => {
    const cat = item.category || "Menu";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });
  return groups;
}

const Template4 = ({ printData = [] }) => {
  const [data, setData] = useState([]);
  const { restaurantId } = useParams();
  const LSRestaurantId = localStorage.getItem("restaurantId");

  useEffect(() => {
    if (LSRestaurantId || restaurantId) {
      fetchMenuData({
        restaurantId: restaurantId || LSRestaurantId,
        onSuccess: setData,
        onError: (err) => console.log(err),
      });
    }
  }, []);

  const items = printData && printData.length ? printData : data;

  // Group by category
  const grouped = groupByCategory(items);

  return (
    <div className="midnight-menu4-container">
      <h1 className="midnight-menu4-heading">Menu</h1>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <div className="midnight-menu4-category">{cat}</div>
          <div className="midnight-menu4-list">
            {items.map((item) => (
              <div className="midnight-menu4-card" key={item._id}>
                <div className="midnight-menu4-accent"></div>
                <img
                  src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`}
                  alt={item.name}
                  className="midnight-menu4-img"
                />
                <div className="midnight-menu4-info">
                  <div className="midnight-menu4-row">
                    <span className="midnight-menu4-name">{item.name}</span>
                    <span className="midnight-menu4-price">${item.price}</span>
                  </div>
                  <span className="midnight-menu4-desc">
                    {item.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Template4;
