import React, { useEffect, useState } from "react";
import "./Template5.css";
import { fetchMenuData } from "../utils/fetchMenuItems";
import { useParams } from "react-router-dom";

function groupByCategory(items) {
  const map = {};
  items.forEach((item) => {
    if (!map[item.category]) map[item.category] = [];
    map[item.category].push(item);
  });
  return map;
}

const Template5 = () => {
  const [data, setData] = useState([]);
  const { restaurantId } = useParams();
  const LSRestaurantId = localStorage.getItem("restaurantId");

  useEffect(() => {
    fetchMenuData({
      restaurantId: restaurantId ? restaurantId : LSRestaurantId,
      onSuccess: setData,
      onError: (err) => console.log(err),
    });
  }, []);

  const grouped = groupByCategory(data);

  return (
    <div className="modern-menu5-wrapper">
      <div className="modern-menu5-grid">
        {Object.entries(grouped).map(([category, items]) => (
          <div className="modern-menu5-card" key={category}>
            <div className="modern-menu5-bgwrap">
              <img
                src={`${import.meta.env.VITE_API_URL}${items[0].imageUrl}`}
                alt={category}
                className="modern-menu5-bgimg"
              />
              <div className="modern-menu5-overlay" />
            </div>
            <div className="modern-menu5-content">
              <h2 className="modern-menu5-title">{category}</h2>
              <div className="modern-menu5-options">
                {items.map((item) => (
                  <div className="modern-menu5-option" key={item._id}>
                    <span className="modern-menu5-label">{item.name}</span>
                    {item.description && (
                      <span className="modern-menu5-desc">
                        {item.description}
                      </span>
                    )}
                    <span className="modern-menu5-price">
                      {typeof item.price === "number"
                        ? `£${item.price.toFixed(2)}`
                        : item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Template5;
