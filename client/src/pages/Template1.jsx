import React, { useEffect, useState } from "react";
import { api } from "../api";
import "./Template1.css";
import { printMenu } from "../utils/printMenu";
import { fetchMenuData } from "../utils/fetchMenuItems";
import { useParams } from "react-router-dom";

const Template1 = ({ printData = [] }) => {
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

  const grouped = items.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    acc[category] = [...(acc[category] || []), item];
    return acc;
  }, {});

  return (
    <>
      {!!data.length && (
        <>
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
