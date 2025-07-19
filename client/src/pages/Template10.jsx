import React, { useEffect, useState } from "react";
import "./Template10.css";
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

const Template10 = ({ printData = [] }) => {
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

  const grouped = groupByCategory(items);
  const categories = Object.keys(grouped);

  return (
    <div className="mt10-bg">
      <div className="mt10-container">
        <h1 className="mt10-title">Our Menu</h1>
        <div className="mt10-category-list">
          {categories.map((cat) => (
            <section className="mt10-category-section" key={cat}>
              <h2 className="mt10-category-heading">{cat}</h2>
              <div className="mt10-items">
                {grouped[cat].map((item) => (
                  <div className="mt10-item-card" key={item._id}>
                    {item.imageUrl && (
                      <div className="mt10-item-imgwrap">
                        <img
                          className="mt10-item-img"
                          src={`${import.meta.env.VITE_API_URL}${
                            item.imageUrl
                          }`}
                          alt={item.name}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="mt10-item-details">
                      <div className="mt10-item-row">
                        <span className="mt10-item-name">{item.name}</span>
                        <span className="mt10-item-price">
                          {typeof item.price === "number"
                            ? `£${item.price.toFixed(2)}`
                            : item.price}
                        </span>
                      </div>
                      {item.description && (
                        <div className="mt10-item-desc">{item.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Template10;
