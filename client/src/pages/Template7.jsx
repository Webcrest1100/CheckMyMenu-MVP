import React, { useEffect, useState } from "react";
import "./Template7.css";
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

const Template7 = ({ printData = [] }) => {
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

  return (
    <div className="zigzag-menu-bg">
      <div className="zigzag-container">
        <h1 className="zigzag-header">Our Menu</h1>
        <div className="zigzag-list">
          {Object.entries(grouped).map(([category, items], idx) => {
            const isEven = idx % 2 === 0;
            const imageUrl = items[0]?.imageUrl
              ? `${import.meta.env.VITE_API_URL}${items[0].imageUrl}`
              : "";
            return (
              <section
                className={`zigzag-section ${
                  isEven ? "zigzag-row" : "zigzag-row-reverse"
                }`}
                key={category}
              >
                <div className="zigzag-image-wrap">
                  {imageUrl && (
                    <img src={imageUrl} alt={category} className="zigzag-img" />
                  )}
                  <div className="zigzag-img-overlay" />
                </div>
                <div className="zigzag-content">
                  <h2 className="zigzag-category">{category}</h2>
                  <ul className="zigzag-items">
                    {items.map((item) => (
                      <li className="zigzag-item" key={item._id}>
                        <div className="zigzag-item-row">
                          <span className="zigzag-name">{item.name}</span>
                          <span className="zigzag-price">
                            {typeof item.price === "number"
                              ? `£${item.price.toFixed(2)}`
                              : item.price}
                          </span>
                        </div>
                        {item.description && (
                          <div className="zigzag-desc">{item.description}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Template7;
