import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { api } from "../api";
import { useParams } from "react-router-dom";
import "./newTemplate1.css";
import MenuCard from "../components/MenuCard";

const NewTemplate1 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { restaurantId } = useParams();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/restaurants/${restaurantId}/menu`, {
          params: { page: 1, limit: 100 },
        });
        console.log(res.data);
        setData(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Navbar />
      {loading && <p>Loading ...</p>}
      {!!data.length && <MenuCard items={data} />}
      <Footer />
    </>
  );
};

export default NewTemplate1;
