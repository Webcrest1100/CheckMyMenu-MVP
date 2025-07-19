import React, { useEffect, useState } from "react";
import "./Template3.css";
import { fetchMenuData } from "../utils/fetchMenuItems";
import { useParams } from "react-router-dom";

const Template3 = ({ printData = [] }) => {
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
    <div className="modern-menu3-container">
      <h1 className="modern-menu3-heading">Our Menu</h1>
      <div className="modern-menu3-list">
        {items?.map((item) => (
          <div className="modern-menu3-item" key={item._id}>
            <div className="modern-menu3-imgbox">
              {item.imageUrl && (
                <img
                  src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`}
                  alt={item.name}
                  className="modern-menu3-img"
                />
              )}
            </div>
            <div className="modern-menu3-info">
              <div className="modern-menu3-row">
                <span className="modern-menu3-name">{item.name}</span>
                <span className="modern-menu3-price">${item.price}</span>
              </div>
              <span className="modern-menu3-desc">{item.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Template3;
