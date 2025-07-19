import React, { useEffect, useState } from "react";
import "./Template9.css";
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

const Template9 = ({ printData = [] }) => {
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
    <div className="mt9-bg">
      <div className="mt9-container" id="print-section">
        <h1 className="mt9-title">Our Menu</h1>
        <div className="mt9-main">
          {categories.map((cat) => (
            <section className="mt9-category-section" key={cat}>
              <h2 className="mt9-category-heading">{cat}</h2>
              {grouped[cat].map((item) => (
                <div className="mt9-menuitem" key={item._id}>
                  {item.imageUrl && (
                    <div className="mt9-menuitem-imgwrap">
                      <img
                        className="mt9-menuitem-img"
                        src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`}
                        alt={item.name}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="mt9-menuitem-details">
                    <div className="mt9-menuitem-row">
                      <span className="mt9-menuitem-name">{item.name}</span>
                      <span className="mt9-menuitem-price">
                        {typeof item.price === "number"
                          ? `£${item.price.toFixed(2)}`
                          : item.price}
                      </span>
                    </div>
                    {item.description && (
                      <div className="mt9-menuitem-desc">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Template9;
