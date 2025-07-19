import React, { useEffect, useState } from "react";
import "./Template2.css";
import { fetchMenuData } from "../utils/fetchMenuItems";
import { useParams } from "react-router-dom";

const Template2 = () => {
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

  return (
    <div className="luxury-menu2-container">
      <h1 className="luxury-menu2-heading">Menu</h1>
      <div className="luxury-menu2-list">
        {data?.map((item) => (
          <div className="luxury-menu2-row" key={item._id}>
            {item.imageUrl && (
              <img
                src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`}
                alt={item.name}
                className="luxury-menu2-img"
              />
            )}
            <div className="luxury-menu2-info">
              <div className="luxury-menu2-main">
                <span
                  className="luxury-menu2-name"
                  style={{ color: "#FFD700" }}
                >
                  {item.name}
                </span>
                <span className="luxury-menu2-price">${item.price}</span>
              </div>
              <span className="luxury-menu2-desc">{item.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Template2;
