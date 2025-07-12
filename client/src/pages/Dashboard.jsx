import { useEffect, useState, useRef } from "react";
import { api } from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  FaFacebookF,
  FaTwitter,
  FaWhatsapp,
  FaInstagram,
  FaLinkedinIn,
  FaLink,
} from "react-icons/fa";
import logo from "../assets/cmmDark.png";
import "./Dashboard.css";
import { useTheme } from "./ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [restaurants, setRestaurants] = useState([]);
  const [newRestaurant, setNewRestaurant] = useState("");
  const [selectedId, setSelectedId] = useState(
    localStorage.getItem("restaurantId") || null
  );
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    website: "",
  });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedRestaurantForTemplate, setSelectedRestaurantForTemplate] =
    useState(null);
  const [chosenTemplate, setChosenTemplate] = useState(1);
  const [showManageOptions, setShowManageOptions] = useState(false);
  const { dark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPlans, setShowPlans] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
        setNavigating(true);
        setTimeout(() => {
          navigate("/");
        }, 500);
      }

      try {
        const res = await api.get("/restaurants", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurants(res.data);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get("/subscribe/prices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("🎟️ fetched plans:", data);
        setAvailablePlans(data);
      } catch (err) {
        console.error("Failed to load plans:", err);
      }
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentSuccess = params.get("payment");

    if (paymentSuccess === "success") {
      const fetchUpdatedUser = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        } catch (err) {
          console.error("Failed to refresh user after payment", err);
        }
      };

      fetchUpdatedUser();
      setShowAddModal(true);
      toast.success("Payment successful! You can now add your restaurant.");

      const cleanUrl = window.location.pathname;
      navigate(cleanUrl, { replace: true });
    }
  }, [location.search]);

  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!newRestaurant.trim()) {
      return toast.error("Enter a restaurant name");
    }

    // Check quota
    const allowed = user?.allowedRestaurants ?? 0;
    const used = restaurants.length;
    const remaining = allowed - used;

    if (remaining <= 0) {
      toast.error(
        "You’ve reached your restaurant limit. Please upgrade your plan."
      );
      setShowAddModal(false);
      setShowPlans(true);
      return;
    }

    try {
      const payload = {
        name: newRestaurant,
        socialLinks,
      };

      const res = await api.post("/restaurants", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update restaurants
      setRestaurants((prev) => [...prev, res.data]);

      // Reset form state
      setNewRestaurant("");
      setSocialLinks({ facebook: "", instagram: "", twitter: "", website: "" });

      // Show success and close modal
      toast.success("Restaurant added successfully!");
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add restaurant", err);
      toast.error(err?.response?.data?.msg || "Add failed");
    }
  };

  const handleSwitchRestaurant = (id) => {
    setSelectedRestaurantForTemplate(id);
    setShowTemplateModal(true);
  };

  const handleTemplateChoice = (num) => {
    localStorage.setItem("menuTemplate", String(num));
    localStorage.setItem("restaurantId", selectedRestaurantForTemplate);
    setShowTemplateModal(false);
    setNavigating(true);
    setTimeout(() => {
      navigate(`/template${num}`);
    }, 500);
  };

  const handleDeleteRestaurant = (id) => {
    const toastId = toast(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to delete this restaurant?</p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "10px",
            }}
          >
            <button
              onClick={async () => {
                const token = localStorage.getItem("token");
                try {
                  await api.delete(`/restaurants/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setRestaurants((prev) => prev.filter((r) => r._id !== id));
                  if (localStorage.getItem("restaurantId") === id) {
                    localStorage.removeItem("restaurantId");
                  }
                  toast.success("Restaurant deleted successfully!");
                } catch (err) {
                  console.error("Failed to delete restaurant", err);
                  toast.error(err.response?.data?.msg || "Delete failed");
                } finally {
                  toast.dismiss(toastId);
                }
              }}
              style={{
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                padding: "2px 20px",
                borderRadius: "5px",
                marginRight: "8px",
                cursor: "pointer",
              }}
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(toastId)}
              style={{
                backgroundColor: "#6c757d",
                color: "#fff",
                border: "none",
                padding: "2px 6px",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "25%",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const handlePayment = async (priceId, count) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.post(
        "/subscribe",
        { priceId, count },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error(err);
      toast.error("Payment failed. Try again.");
    }
  };

  const dynamicStyles = getStyles(dark);

  {
    loading && (
      <div className="loader-overlay" style={{ display: "none" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={dynamicStyles.container}>
      <Navbar />

      <main style={dynamicStyles.main} >
        <h2 style={dynamicStyles.welcome}>
          Welcome, <span style={dynamicStyles.email}>{user.email}</span>
        </h2>
        <p>Status: {user.subscriptionStatus}</p>
        {/* <p>Expires: {new Date(user.currentPeriodEnd).toLocaleString()}</p> */}
        {user && (
          <p style={{ textAlign: "center", color: dark ? "#ccc" : "#333" }}>
            Restaurants added: <strong>{restaurants.length}</strong> /{" "}
            <strong>{user.allowedRestaurants}</strong>
          </p>
        )}
        <button
          onClick={() => {
            const allowed = user?.allowedRestaurants ?? 0;
            const used = restaurants.length;
            const remaining = allowed - used;

            if (remaining > 0) {
              toast.info(
                `You can add ${remaining} more restaurant${
                  remaining > 1 ? "s" : ""
                }.`
              );
              setShowAddModal(true);
            } else {
              toast.warning(
                "You’ve reached your restaurant limit. Please upgrade your plan."
              );
              setShowPlans(true);
            }
          }}
          style={{
            padding: "10px 20px",
            margin: "20px auto",
            display: "block",
            backgroundColor: "#28A745 ",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Add Restaurant
        </button>
        <h3 style={dynamicStyles.heading}>Your Restaurants</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          {restaurants.length >= 3 && (
            <button
              className="btn2"
              onClick={() =>
                scrollContainerRef.current.scrollBy({
                  left: -300,
                  behavior: "smooth",
                })
              }
              style={dynamicStyles.scrollButton}
            >
              ←
            </button>
          )}

          <div
            className="restaurant-list"
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              overflowX: "auto",
              display: "flex",
              scrollBehavior: "smooth",
            }}
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {restaurants.length > 0 ? (
              restaurants.map((r) => (
                <div key={r._id} className="bcd">
                  <h4>{r.name}</h4>
                  <p style={dynamicStyles.cardId}>ID: {r._id}</p>
                  {r.socialLinks && (
                    <div style={{ marginTop: "8px" }}>
                      {r.socialLinks.facebook && (
                        <a
                          href={r.socialLinks.facebook}
                          target="_blank"
                          rel="noreferrer"
                          style={dynamicStyles.link}
                        >
                          <FaFacebookF />
                        </a>
                      )}
                      {r.socialLinks.instagram && (
                        <a
                          href={r.socialLinks.instagram}
                          target="_blank"
                          rel="noreferrer"
                          style={dynamicStyles.link}
                        >
                          <FaInstagram />
                        </a>
                      )}
                      {r.socialLinks.twitter && (
                        <a
                          href={r.socialLinks.twitter}
                          target="_blank"
                          rel="noreferrer"
                          style={dynamicStyles.link}
                        >
                          <FaTwitter />
                        </a>
                      )}
                      {r.socialLinks.website && (
                        <a
                          href={r.socialLinks.website}
                          target="_blank"
                          rel="noreferrer"
                          style={dynamicStyles.link}
                        >
                          <FaLink />
                        </a>
                      )}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      className="but"
                      style={dynamicStyles.boxbut}
                      onClick={() => {
                        setSelectedRestaurantForTemplate(r._id);
                        setShowManageOptions(true);
                      }}
                    >
                      Manage
                    </button>
                    <button
                      className="but"
                      style={{
                        ...dynamicStyles.boxbut,
                        backgroundColor: "#dc3545",
                        color: "#fff",
                      }}
                      onClick={() => handleDeleteRestaurant(r._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: dark ? "#C0C0C0" : "#555",
                }}
              >
                No restaurants found. Add one to get started.
              </p>
            )}
          </div>

          {restaurants.length >= 3 && (
            <button
              className="btn2"
              onClick={() =>
                scrollContainerRef.current.scrollBy({
                  left: 300,
                  behavior: "smooth",
                })
              }
              style={dynamicStyles.scrollButton}
            >
              →
            </button>
          )}
        </div>

        {showPlans && (
          <div className="modal-overlay" style={{fontFamily: "Montserrat"}}>
            <div className="modal-box">
              <h3 style={{ marginBottom: "14px" , fontSize: "26px"  }}>Choose a Subscription</h3>
              <div
                style={{
                  // display: "list-item",
                  // flexDirection: "column",
                  gap: "10px",
                }}
              >
                {availablePlans.map((plan) => {
                  // How many restaurants this plan grants:
                  const count = parseInt(
                    plan.metadata.restaurantCount ||
                      plan.recurring.interval_count ||
                      "1",
                    10
                  );
                  // Convert cents to dollars
                  const amount = (plan.unit_amount / 100).toFixed(2);
                  const currency = plan.currency.toUpperCase();
                  // monthly/annual/etc.
                  const interval = plan.recurring.interval;
                  return (
                    <button style={{backgroundColor: "#FFC107" , color: "white"}}
                      key={plan.id}
                      onClick={() => handlePayment(plan.id, count)}
                    >
                      {count} Restaurant{count > 1 ? "s" : ""} – ${amount}{" "}
                      {currency} per {interval}
                    </button>
                  );
                })}
              </div>
              <button
                style={{
                  ...dynamicStyles.button,
                  backgroundColor: "#6c757d",
                  color: "#fff",
                }}
                onClick={() => setShowPlans(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="modal-overlay-add">
            <form
              className="modal-box-add"
              onSubmit={handleAddRestaurant}
              style={dynamicStyles.form}
            >
              <h4 className="formfield1" style={{ justifyContent: "left" }}>
                Name <span style={{color: "red"}}> * </span>
              </h4>
              <input
                type="text"
                value={newRestaurant}
                onChange={(e) => setNewRestaurant(e.target.value)}
                required
                style={dynamicStyles.input}
              />
              <h4 className="formfield">Facebook</h4>
              <input
                type="url"
                value={socialLinks.facebook}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, facebook: e.target.value })
                }
                style={dynamicStyles.input}
              />
              <h4 className="formfield">Instagram</h4>
              <input
                type="url"
                value={socialLinks.instagram}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, instagram: e.target.value })
                }
                style={dynamicStyles.input}
              />
              <h4 className="formfield1">Twitter</h4>
              <input
                type="url"
                value={socialLinks.twitter}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, twitter: e.target.value })
                }
                style={dynamicStyles.input}
              />
              <h4 className="formfield">Website</h4>
              <input
                type="url"
                value={socialLinks.website}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, website: e.target.value })
                }
                style={dynamicStyles.input}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "10px",
                }}
              >
                <button type="submit" style={{...dynamicStyles.button, backgroundColor: "#FFC107"}}>
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    ...dynamicStyles.button,
                    backgroundColor: "#6c757d",
                    color: "#fff",
                    marginLeft: "10px",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {showManageOptions && (
        <div className="modal-overlay">
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div
              className="model1"
              style={{
                backgroundColor: "#fff",
                padding: "30px 40px",
                borderRadius: "12px",
                boxShadow: "0 0 15px rgba(0,0,0,0.2)",
                width: "fit-content",
                minWidth: "300px",
                textAlign: "center",
              }}
            >
              {/* Heading */}
              <h2
                style={{
                  marginBottom: "25px",
                  fontSize: "24px",
                  color: "#333",
                }}
              >
                Choose an Option
              </h2>

              {/* First row: Go to Menu + Customize */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#FFC107",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    localStorage.setItem(
                      "restaurantId",
                      selectedRestaurantForTemplate
                    );
                    setNavigating(true);
                    setTimeout(() => {
                      navigate("/menu");
                    }, 500);
                  }}
                >
                  Go to Menu
                </button>

                <button
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#FFC107",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setShowManageOptions(false);
                    setShowTemplateModal(true);
                  }}
                >
                  Customize
                </button>
              </div>

              <div>
                <button
                  style={{
                    padding: "8px 24px",
                    backgroundColor: "#6c757d",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowManageOptions(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Choose a Menu Layout</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "20px",
                padding: "20px",
                justifyItems: "center",
              }}
            >
              <div
                style={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => {
                  localStorage.setItem("menuTemplate", "1");
                  localStorage.setItem(
                    "restaurantId",
                    selectedRestaurantForTemplate
                  );
                  setShowTemplateModal(false);
                  navigate("/template1");
                }}
              >
                <div className="template-box">
                  <p>Template 1</p>
                </div>
              </div>

              <div
                style={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => {
                  localStorage.setItem("menuTemplate", "2");
                  localStorage.setItem(
                    "restaurantId",
                    selectedRestaurantForTemplate
                  );
                  setShowTemplateModal(false);
                  navigate("/template2");
                }}
              >
                <div className="template-box">
                  <p>Template 2</p>
                </div>
              </div>

              <div
                style={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => {
                  localStorage.setItem("menuTemplate", "2");
                  localStorage.setItem(
                    "restaurantId",
                    selectedRestaurantForTemplate
                  );
                  setShowTemplateModal(false);
                  navigate("/template3");
                }}
              >
                <div className="template-box">
                  <p>Template 3</p>
                </div>
              </div>

              <div
                style={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => {
                  localStorage.setItem("menuTemplate", "2");
                  localStorage.setItem(
                    "restaurantId",
                    selectedRestaurantForTemplate
                  );
                  setShowTemplateModal(false);
                  navigate("/template4");
                }}
              >
                <div className="template-box">
                  <p>Template 4</p>
                </div>
              </div>
              <div
                style={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => {
                  localStorage.setItem("menuTemplate", "2");
                  localStorage.setItem(
                    "restaurantId",
                    selectedRestaurantForTemplate
                  );
                  setShowTemplateModal(false);
                  navigate("/template5");
                }}
              >
                <div className="template-box">
                  <p>Template 5</p>
                </div>
              </div>

              <div
                style={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => {
                  localStorage.setItem("menuTemplate", "1");
                  localStorage.setItem(
                    "restaurantId",
                    selectedRestaurantForTemplate
                  );
                  setShowTemplateModal(false);
                  navigate("/template6");
                }}
              >
                <div className="template-box">
                  <p>Template 6</p>
                </div>
              </div>

              <div
                style={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => {
                  localStorage.setItem("menuTemplate", "1");
                  localStorage.setItem(
                    "restaurantId",
                    selectedRestaurantForTemplate
                  );
                  setShowTemplateModal(false);
                  navigate("/template7");
                }}
              >
                <div className="template-box">
                  <p>Template 7</p>
                </div>
              </div>

              <div
                style={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => {
                  localStorage.setItem("menuTemplate", "1");
                  localStorage.setItem(
                    "restaurantId",
                    selectedRestaurantForTemplate
                  );
                  setShowTemplateModal(false);
                  navigate("/template8");
                }}
              >
                <div className="template-box">
                  <p>Template 8</p>
                </div>
              </div>

              <div
                style={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => {
                  localStorage.setItem("menuTemplate", "1");
                  localStorage.setItem(
                    "restaurantId",
                    selectedRestaurantForTemplate
                  );
                  setShowTemplateModal(false);
                  navigate("/template9");
                }}
              >
                <div className="template-box">
                  <p>Template 9</p>
                </div>
              </div>

              <div
                style={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => {
                  localStorage.setItem("menuTemplate", "1");
                  localStorage.setItem(
                    "restaurantId",
                    selectedRestaurantForTemplate
                  );
                  setShowTemplateModal(false);
                  navigate("/template10");
                }}
              >
                <div className="template-box">
                  <p>Template 10</p>
                </div>
              </div>
            </div>
            <button
              style={{
                backgroundColor: "#6c757d",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => setShowTemplateModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      {navigating && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255,255,255,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

function getStyles(dark) {
  const colors = {
    navy: "#1E2A38",
    green: "#28A745",
    yellow: "#FFC107",
    white: "#F8F9FA",
    // charcoal: "#343A40",
  };

  return {
    container: {
      fontFamily: "Montserrat",
      background: "#F8F9FA",
      minHeight: "100vh",
      color: dark ? colors.white : colors.charcoal,
    },
    main: {
      margin: "180px auto",
      padding: "40px 20px 50px",
      background: dark ? "#263544" : "#ffff",
      borderRadius: "16px",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
      maxWidth: "90%",
     
    },
    welcome: {
      fontSize: "28px",
      textAlign: "center",
      marginBottom: "20px",
    },
    email: {
      fontWeight: "normal",
      color: dark ? "#C0C0C0" : "#666",
      fontStyle: "italic",
    },
    heading: {
      fontSize: "22px",
      margin: "30px 0 15px",
      borderBottom: `2px solid ${colors.navy}`,
      paddingBottom: "20px",
      textAlign: "center",
    },
    cardId: {
      fontSize: "12px",
      color: dark ? "#bbb" : "#777",
      marginTop: "6px",
    },
    link: {
      color: dark ? "#FFC107" : "#007BFF",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "bold",
      marginRight: "5px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0px",
      marginTop: "40px",
    },
    input: {
      padding: "10px",
      borderRadius: "8px",
      border: `1px solid ${dark ? "#3a3a3a" : "#ccc"}`,
      width: "80%",
      maxWidth: "400px",
      outline: "none",
      fontSize: "16px",
      backgroundColor: dark ? "#1E2A38" : colors.white,
      color: dark ? "#fff" : "#000",
    },
    button: {
      padding: "10px 20px",
      borderRadius: "8px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "20px",
      color: "#ffff",
    },
    boxbut: {
      padding: "1px 10px",
      color: "white",
    },

    scrollButton: {
      fontSize: "16px",
      padding: "8px 16px",
      cursor: "pointer",
      border: "8px",
      backgroundColor: "#F5C56A",
      color: dark ? "#FFFFFF" : "#000000",
      borderRadius: "8px",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    },
  };
}
