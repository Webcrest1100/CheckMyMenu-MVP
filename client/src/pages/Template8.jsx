import React, { useEffect, useState } from "react";
import "./Template8.css";
import { fetchMenuData } from "../utils/fetchMenuItems";
import { useParams } from "react-router-dom";

const Template8 = ({ printData = [] }) => {
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

  return (
    <div className="m8-bg">
      <div className="m8-container">
        <h1 className="m8-title">Our Menu</h1>
        <div className="m8-grid">
          {items.map((item) => (
            <div className="m8-card" key={item._id}>
              <div className="m8-card-img-wrap">
                {item.imageUrl && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`}
                    alt={item.name}
                    className="m8-card-img"
                  />
                )}
                <span className="m8-category-badge">{item.category}</span>
              </div>
              <div className="m8-card-content">
                <div className="m8-card-row">
                  <span className="m8-item-name">{item.name}</span>
                  <span className="m8-item-price">
                    {typeof item.price === "number"
                      ? `£${item.price.toFixed(2)}`
                      : item.price}
                  </span>
                </div>
                {item.description && (
                  <div className="m8-item-desc">{item.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Template8;
