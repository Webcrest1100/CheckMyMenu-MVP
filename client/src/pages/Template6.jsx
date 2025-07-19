import React, { useEffect, useState } from "react";
import "./Template6.css";
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

const Template6 = () => {
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
    <div className="template6">
      <div className="m6-wrapper">
        <h1 className="m6-header">Our Menu</h1>
        <div className="m6-grid">
          {Object.entries(grouped).map(([category, items]) => (
            <section className="m6-section" key={category}>
              <div className="m6-bgwrap">
                <img
                  src={`${import.meta.env.VITE_API_URL}${items[0].imageUrl}`}
                  alt={category}
                  className="m6-bgimg"
                />
                <div className="m6-overlay" />
              </div>
              <div className="m6-content">
                <h2 className="m6-category">{category}</h2>
                <ul className="m6-items">
                  {items.map((item) => (
                    <li className="m6-item" key={item._id}>
                      <div className="m6-itemrow">
                        <span className="m6-name">{item.name}</span>
                        <span className="m6-price">
                          {typeof item.price === "number"
                            ? `£${item.price.toFixed(2)}`
                            : item.price}
                        </span>
                      </div>
                      {item.description && (
                        <div className="m6-desc">{item.description}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Template6;
