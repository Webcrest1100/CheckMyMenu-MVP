import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./newTemplate1.css";
import { printMenu } from "../utils/printMenu";
import { fetchMenuData } from "../utils/fetchMenuItems";

const NewTemplate1 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { restaurantId } = useParams();

  const grouped = data?.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    acc[category] = [...(acc[category] || []), item];
    return acc;
  }, {});

  useEffect(() => {
    fetchMenuData({
      restaurantId,
      page: 1,
      limit: 100,
      onSuccess: setData,
      onError: (err) => console.error("Error fetching menu:", err),
    });
  }, []);

  return (
    <>
      {!!data.length && (
        <>
          <div style={{ textAlign: "right", paddingTop: 10, paddingRight: 10 }}>
            <button onClick={() => printMenu(".menu-wrapper")}>
              Print Menu
            </button>
          </div>
          <div className="menu-wrapper">
            <h1 className="menu-title">MAIN’S</h1>
            <div className="menu-columns">
              {Object.keys(grouped).map((category) => (
                <div className="menu-section" key={category}>
                  <h2 className="menu-category">{category.toUpperCase()}</h2>
                  <div className="menu-list">
                    {grouped[category].map((item) => (
                      <div className="menu-line-item" key={item._id}>
                        <img
                          src={`${import.meta.env.VITE_API_URL}${
                            item.imageUrl
                          }`}
                          alt={item.name}
                          className="menu-line-img"
                        />
                        <div className="menu-line-text">
                          <div className="menu-line-header">
                            <span className="item-name">{item.name}</span>
                            <span className="item-price">Rs. {item.price}</span>
                          </div>
                          <div className="item-description">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NewTemplate1;
