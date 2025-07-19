import React, { useEffect, useState } from "react";
import { api } from "../api";
import "./Template1.css";
import { printMenu } from "../utils/printMenu";
import { fetchMenuData } from "../utils/fetchMenuItems";

const Template1 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const restaurantId = localStorage.getItem("restaurantId");

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
            <button onClick={() => printMenu(".menuWrapper")}>
              Print Menu
            </button>
          </div>
          <div className="menuWrapper">
            <h1 className="menuTitle">MAIN’S</h1>
            <div className="menuColumns">
              {Object.keys(grouped).map((category) => (
                <div className="menuSection" key={category}>
                  <h2 className="menuCategory">{category.toUpperCase()}</h2>
                  <div className="menuList">
                    {grouped[category].map((item) => (
                      <div className="menuLineItem" key={item._id}>
                        <img
                          src={`${import.meta.env.VITE_API_URL}${
                            item.imageUrl
                          }`}
                          alt={item.name}
                          className="menuLineImg"
                        />
                        <div className="menuLineText">
                          <div className="menuLineHeader">
                            <span className="itemName">{item.name}</span>
                            <span className="itemPrice">Rs. {item.price}</span>
                          </div>
                          <div className="itemDescription">
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

export default Template1;
