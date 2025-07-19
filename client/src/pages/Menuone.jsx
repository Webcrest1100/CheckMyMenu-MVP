import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./MenuOne.css"; // We'll write this next

export default function MenuOne() {
  const { restaurantId, itemId } = useParams();
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [reviews, setReviews] = useState([]);
  // const [social, setSocial] = useState({
  //   google: [],
  //   facebook: [],
  //   instagram: [],
  // });

  // useEffect(() => {
  //   api
  //     .get(`/restaurants/${restaurantId}/social-reviews`)
  //     .then((r) => setSocial(r.data))
  //     .catch(console.error);
  // }, [restaurantId]);

  useEffect(() => {
    if (restaurantId && itemId) {
      fetchSingleMenuItem();
    }
  }, [restaurantId, itemId]);

  const fetchSingleMenuItem = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/public/restaurants/${restaurantId}/menu/${itemId}`
      );
      setMenuItem(res.data || null);
    } catch (err) {
      console.error("Error fetching item:", err.response?.data || err.message);
      setMenuItem(null);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //     if (!restaurantId) return;
  //     (async () => {
  //       try {
  //         const { data } = await api.get(`/restaurants/${restaurantId}/reviews`);
  //         setReviews(data);
  //       } catch (err) {
  //         console.error("Could not load reviews:", err);
  //       } finally {
  //         setLoading(false);
  //       }
  //     })();
  //   }, [restaurantId]);

  return (
    <div className="menu-one-page">
      <div className="menu-one-container">
        {loading ? (
          <div className="menu-one-loading">Loading...</div>
        ) : !menuItem ? (
          <div className="menu-one-notfound">Menu item not found</div>
        ) : (
          <div className="menu-one-card">
            {menuItem.imageUrl ? (
              <img
                src={
                  menuItem.imageUrl.startsWith("http")
                    ? menuItem.imageUrl
                    : `${import.meta.env.VITE_API_URL}${menuItem.imageUrl}`
                }
                alt={menuItem.name}
                className="menu-one-image"
              />
            ) : (
              <div className="menu-one-image placeholder">No Image</div>
            )}
            <div className="menu-one-content">
              <h3>{menuItem.name}</h3>
              <p className="menu-one-description">{menuItem.description}</p>
              <p className="menu-one-price">
                <strong>Price:</strong> ${menuItem.price}
              </p>
              <p className="menu-one-category">
                <em>Category:</em> {menuItem.category}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* <section className="reviews">
        <h3>Customer Reviews</h3>
        {loading ? (
          <p>Loading reviews…</p>
        ) : reviews.length > 0 ? (
          reviews.map((r, i) => (
            <div key={i} className="review">
              <strong>{r.author}</strong>{" "}
              <em>({new Date(r.date).toLocaleDateString()})</em>
              <p>{r.text}</p>
              <span className="source">{r.source}</span>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </section> */}

      {/* <div>
      <h2>Customer Reviews</h2>

      <section>
        <h3>Google Reviews</h3>
        {social.google.length
          ? social.google.map(r => (
              <div key={r.time}>
                <strong>{r.author_name}</strong> — {r.rating}★<br/>
                {r.text}
              </div>
            ))
          : <p>No Google reviews yet.</p>
        }
      </section>

      <section>
        <h3>Facebook Reviews</h3>
        {social.facebook.length
          ? social.facebook.map(r => (
              <div key={r.id}>
                <img src={r.reviewer.picture?.data?.url} width={24} height={24} style={{borderRadius:"50%",marginRight:4}}/>
                <strong>{r.reviewer.name}</strong> — {r.rating}★<br/>
                {r.review_text}
              </div>
            ))
          : <p>No Facebook reviews yet.</p>
        }
      </section>

      <section>
        <h3>Instagram Comments</h3>
        {social.instagram.length
          ? social.instagram.map(c => (
              <div key={c.id}>
                <strong>@{c.username}</strong> on post “{c.caption?.slice(0,30)}…”<br/>
                {c.text}
              </div>
            ))
          : <p>No Instagram comments yet.</p>
        }
      </section>
    </div> */}
    </div>
  );
}
