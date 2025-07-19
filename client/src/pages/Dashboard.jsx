import { useEffect, useState, useRef } from "react";
import { api } from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import QRCode from "react-qr-code";
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
import { printMenu } from "../utils/printMenu";
import { fetchMenuData } from "../utils/fetchMenuItems";
import { menuTemplates } from "../constants/menuTemplate";
import Template1 from "./Template1";
import Template2 from "./Template2";
import Template3 from "./Template3";
import Template4 from "./Template4";
import Template5 from "./Template5";
import Template6 from "./Template6";
import Template7 from "./Template7";
import Template8 from "./Template8";
import Template9 from "./Template9";
import Template10 from "./Template10";

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
  const [showPrintTemplateModal, setShowPrintTemplateModal] = useState(false);
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

  const [fbPageId, setFbPageId] = useState("");
  const [fbPageToken, setFbPageToken] = useState("");
  const [igBusinessId, setIgBusinessId] = useState("");
  const [igAccessToken, setIgAccessToken] = useState("");
  const qrRef = useRef(null);
  const templateGridRef = useRef(null);
  const [isDraggingTemplate, setIsDraggingTemplate] = useState(false);
  const [startXTemplate, setStartXTemplate] = useState(0);
  const [scrollLeftTemplate, setScrollLeftTemplate] = useState(0);

  const handleTemplateMouseDown = (e) => {
    if (!templateGridRef.current) return;
    setIsDraggingTemplate(true);
    setStartXTemplate(e.pageX - templateGridRef.current.offsetLeft);
    setScrollLeftTemplate(templateGridRef.current.scrollLeft);
  };

  const handleTemplateMouseLeave = () => setIsDraggingTemplate(false);
  const handleTemplateMouseUp = () => setIsDraggingTemplate(false);

  const handleTemplateMouseMove = (e) => {
    if (!isDraggingTemplate || !templateGridRef.current) return;
    e.preventDefault();
    const x = e.pageX - templateGridRef.current.offsetLeft;
    const walk = (x - startXTemplate) * 1.5; // same multiplier as before
    templateGridRef.current.scrollLeft = scrollLeftTemplate - walk;
  };
  const [touchStartXTemplate, setTouchStartXTemplate] = useState(0);
  const [touchScrollLeftTemplate, setTouchScrollLeftTemplate] = useState(0);

  const handleTemplateTouchStart = (e) => {
    if (!templateGridRef.current) return;
    setTouchStartXTemplate(
      e.touches[0].pageX - templateGridRef.current.offsetLeft
    );
    setTouchScrollLeftTemplate(templateGridRef.current.scrollLeft);
  };
  const handleTemplateTouchMove = (e) => {
    if (!templateGridRef.current) return;
    const x = e.touches[0].pageX - templateGridRef.current.offsetLeft;
    const walk = (x - touchStartXTemplate) * 1.5;
    templateGridRef.current.scrollLeft = touchScrollLeftTemplate - walk;
  };

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
    if (params.get("payment") === "success") {
      async function refetchAll() {
        try {
          const [me, rests] = await Promise.all([
            api.get("/auth/me"),
            api.get("/restaurants"),
          ]);
          setUser(me.data);
          setRestaurants(rests.data);
        } catch (err) {
          console.error("Refetch after payment failed:", err);
        }
      }
      refetchAll();
      setShowAddModal(true);
      toast.success("Payment successful! You can now add your restaurant.");
      navigate(window.location.pathname, { replace: true });
    }
  }, [location.search, navigate]);

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
    e.preventDefault(); // 1x only

    const token = localStorage.getItem("token");
    if (!newRestaurant.trim()) {
      return toast.error("Enter a restaurant name");
    }

    // quota check (unchanged)
    const allowed = user?.allowedRestaurants ?? 0;
    const used = restaurants.length;
    if (allowed - used <= 0) {
      toast.error(
        "You’ve reached your restaurant limit. Please upgrade your plan."
      );
      setShowAddModal(false);
      setShowPlans(true);
      return;
    }

    // 2) debug log
    console.log({
      fbPageId,
      fbPageToken,
      igBusinessId,
      igAccessToken,
      socialLinks,
      newRestaurant,
    });

    // 3) build payload
    const payload = {
      name: newRestaurant,
      socialLinks,
      // only include if non-empty:
      ...(fbPageId && { facebookPageId: fbPageId }),
      ...(fbPageToken && { facebookPageToken: fbPageToken }),
      ...(igBusinessId && { instagramBusinessId: igBusinessId }),
      ...(igAccessToken && { instagramAccessToken: igAccessToken }),
    };

    try {
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

  const [data, setData] = useState([]);
  const template1Ref = useRef(null);
  const template2Ref = useRef(null);
  const template3Ref = useRef(null);
  const template4Ref = useRef(null);
  const template5Ref = useRef(null);
  const template6Ref = useRef(null);
  const template7Ref = useRef(null);
  const template8Ref = useRef(null);
  const template9Ref = useRef(null);
  const template10Ref = useRef(null);

  useEffect(() => {
    if (selectedRestaurantForTemplate) {
      fetchMenuData({
        restaurantId: selectedRestaurantForTemplate,
        onSuccess: setData,
      });
    }
  }, [selectedRestaurantForTemplate]);
  const grouped = data?.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    acc[category] = [...(acc[category] || []), item];
    return acc;
  }, {});

  //   const handleAddRestaurant = async (e) => {
  //     e.preventDefault();
  //     const token = localStorage.getItem("token");

  //     if (!newRestaurant.trim()) {
  //       return toast.error("Enter a restaurant name");
  //     }

  //     // Check quota
  //     const allowed = user?.allowedRestaurants ?? 0;
  //     const used = restaurants.length;
  //     const remaining = allowed - used;

  //     if (remaining <= 0) {
  //       toast.error(
  //         "You’ve reached your restaurant limit. Please upgrade your plan."
  //       );
  //       setShowAddModal(false);
  //       setShowPlans(true);
  //       return;
  //     }

  //     try {

  //       const payload = {
  //         name: newRestaurant,
  //         socialLinks,
  //           facebookPageId:      fbPageId     || undefined,
  //   facebookPageToken:   fbPageToken  || undefined,
  //  instagramBusinessId: igBusinessId || undefined,
  //  instagramAccessToken: igAccessToken|| undefined,

  //       };

  //       const res = await api.post("/restaurants", payload, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       // Update restaurants
  //       setRestaurants((prev) => [...prev, res.data]);

  //       // Reset form state
  //       setNewRestaurant("");
  //       setSocialLinks({ facebook: "", instagram: "", twitter: "", website: "" });

  //       // Show success and close modal
  //       toast.success("Restaurant added successfully!");
  //       setShowAddModal(false);
  //     } catch (err) {
  //       console.error("Failed to add restaurant", err);
  //       toast.error(err?.response?.data?.msg || "Add failed");
  //     }
  //   };

  const handleSwitchRestaurant = (id) => {
    setSelectedRestaurantForTemplate(id);
    setShowTemplateModal(true);
  };
  const [showInput, setShowInput] = useState(false);
  const handleTemplateChoice = (num) => {
    localStorage.setItem("menuTemplate", String(num));
    localStorage.setItem("restaurantId", selectedRestaurantForTemplate);
    setShowTemplateModal(false);
    setNavigating(true);
    setTimeout(() => {
      navigate(`/template${num}`);
    }, 500);
  };
  const templateRefs = {
    template1: template1Ref,
    template2: template2Ref,
    template3: template3Ref,
    template4: template4Ref,
    template5: template5Ref,
    template6: template6Ref,
    template7: template7Ref,
    template8: template8Ref,
    template9: template9Ref,
    template10: template10Ref,
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

  const handlePrintQR = () => {
    const svg = qrRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "qr-code.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = url;
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
      <main style={dynamicStyles.main}>
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
                  <h4 style={{ color: "#000000" }}>{r.name}</h4>
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
          <div className="modal-overlay" style={{ fontFamily: "Montserrat" }}>
            <div className="modal-box">
              <h3 style={{ marginBottom: "14px", fontSize: "26px" }}>
                Choose a Subscription
              </h3>
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
                    <button
                      style={{ backgroundColor: "#FFC107", color: "white" }}
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
          <div className="modal-overlay-add-restuarant">
            <form
              className="modal-box-add-restuarant"
              onSubmit={handleAddRestaurant}
              style={dynamicStyles.form}
            >
              <h4
                className="formfield1-restuarant"
                style={{ justifyContent: "left" }}
              >
                Name <span style={{ color: "red" }}> * </span>
              </h4>
              <input
                type="text"
                value={newRestaurant}
                onChange={(e) => setNewRestaurant(e.target.value)}
                required
                style={dynamicStyles.input}
              />
              <h4 className="formfield-restuarant">Facebook</h4>
              <input
                type="url"
                value={socialLinks.facebook}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, facebook: e.target.value })
                }
                style={dynamicStyles.input}
              />
              <h4 className="formfield-restuarant">Instagram</h4>
              <input
                type="url"
                value={socialLinks.instagram}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, instagram: e.target.value })
                }
                style={dynamicStyles.input}
              />
              <h4 className="formfield1-restuarant">Twitter</h4>
              <input
                type="url"
                value={socialLinks.twitter}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, twitter: e.target.value })
                }
                style={dynamicStyles.input}
              />
              <h4 className="formfield-restuarant">Website</h4>
              <input
                type="url"
                value={socialLinks.website}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, website: e.target.value })
                }
                style={dynamicStyles.input}
              />

              {/* <button
                type="button"
                style={{
                  ...dynamicStyles.button,
                  backgroundColor: "#FFC107",
                }}
                onClick={() => setShowInput(!showInput)}
              >
                {" "}
                Show more Inputs
              </button>
              {showInput && (
                <>
                  <h4 style={{ textAlign: "center", marginTop: "10px" }}>
                    If you want to add reviews on the Menu page, please add the
                    following information:
                  </h4>
                  <h4 className="formfield-restuarant">Facebook Page ID</h4>
                  <input
                    type="text"
                    value={fbPageId}
                    onChange={(e) => setFbPageId(e.target.value)}
                    placeholder=" e.g. 5481640000000000"
                    style={dynamicStyles.input}
                  />
                  <h4 className="formfield-restuarant">Facebook Page Token</h4>
                  <input
                    type="text"
                    value={fbPageToken}
                    onChange={(e) => setFbPageToken(e.target.value)}
                    placeholder="long-lived page token"
                    style={dynamicStyles.input}
                  />
                  <h4 className="formfield-restuarant">
                    Instagram Business ID
                  </h4>
                  <input
                    type="text"
                    value={igBusinessId}
                    onChange={(e) => setIgBusinessId(e.target.value)}
                    placeholder="e.g. 17841400000000000"
                    style={dynamicStyles.input}
                  />
                  <h4 className="formfield-restuarant">
                    Instagram Access Token
                  </h4>
                  <input
                    type="text"
                    value={igAccessToken}
                    onChange={(e) => setIgAccessToken(e.target.value)}
                    placeholder="long-lived IG token"
                    style={dynamicStyles.input}
                  />
                </>
              )} */}
              <div className="button-row-restuarant">
                <button
                  type="submit"
                  style={{
                    ...dynamicStyles.button,
                    backgroundColor: "#FFC107",
                    marginRight: "10px",
                  }}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    ...dynamicStyles.button,
                    backgroundColor: "#6c757d",
                    color: "#fff",
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
        <div className="modal-overlay-choose">
          <div>
            <div className="model1">
              <h2>Choose an Option</h2>

              <div className="modal-buttons">
                <button
                  className="modal-button"
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
                  className="modal-button"
                  onClick={() => {
                    setShowManageOptions(false);
                    setShowTemplateModal(true);
                  }}
                >
                  Customize
                </button>
              </div>
              <div className="modal-buttons">
                {!!data.length && (
                  <button
                    className="modal-button"
                    onClick={() => {
                      setShowPrintTemplateModal(true);
                      setShowManageOptions(false);
                    }}
                  >
                    Print Menu
                  </button>
                )}
                <button
                  className="modal-button"
                  onClick={() => {
                    handlePrintQR(`/view/${selectedId}/template1`);
                  }}
                >
                  Print QR
                </button>
              </div>

              <div>
                <button
                  className="modal-cancel"
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
        <div className="modal-overlay-layout">
          <div className="modal-box-layout">
            <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
              Choose a Menu Layout
            </h3>
            <div
              className="template-grid"
              ref={templateGridRef}
              style={{
                cursor: isDraggingTemplate ? "grabbing" : "grab",
                overflowX: "auto",
                display: "flex",
                gap: "20px", // (optional, just for visual spacing)
                padding: "8px 0",
              }}
              onMouseDown={handleTemplateMouseDown}
              onMouseLeave={handleTemplateMouseLeave}
              onMouseUp={handleTemplateMouseUp}
              onMouseMove={handleTemplateMouseMove}
              onTouchStart={handleTemplateTouchStart}
              onTouchMove={handleTemplateTouchMove}
            >
              {menuTemplates.map((tpl) => (
                <div
                  key={tpl.key}
                  style={{ cursor: "pointer", textAlign: "center" }}
                  onClick={() => {
                    localStorage.setItem("menuTemplate", tpl.templateNum);
                    localStorage.setItem(
                      "restaurantId",
                      selectedRestaurantForTemplate
                    );
                    setShowTemplateModal(false);
                    navigate(tpl.route);
                  }}
                >
                  <div
                    className="template-box"
                    style={{
                      backgroundImage: `url(${tpl.img})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "12px",
                      height: 120,
                      width: 180,
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    <p
                      style={{
                        background: "rgba(0,0,0,0.55)",
                        color: "#fff",
                        borderRadius: "0 0 12px 12px",
                        margin: 0,
                        width: "100%",
                        padding: "10px 0",
                        fontWeight: "bold",
                        fontSize: 18,
                        letterSpacing: 1,
                      }}
                    >
                      {tpl.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                style={{
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "20px",
                }}
                onClick={() => setShowTemplateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showPrintTemplateModal && (
        <div className="modal-overlay-layout">
          <div className="modal-box-layout">
            <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
              Choose a Menu Template To Print
            </h3>
            <div
              className="template-grid"
              ref={templateGridRef}
              style={{
                cursor: isDraggingTemplate ? "grabbing" : "grab",
                overflowX: "auto",
                display: "flex",
                gap: "20px", // (optional, just for visual spacing)
                padding: "8px 0",
              }}
              onMouseDown={handleTemplateMouseDown}
              onMouseLeave={handleTemplateMouseLeave}
              onMouseUp={handleTemplateMouseUp}
              onMouseMove={handleTemplateMouseMove}
              onTouchStart={handleTemplateTouchStart}
              onTouchMove={handleTemplateTouchMove}
            >
              {menuTemplates.map((tpl) => (
                <div
                  key={tpl.key}
                  style={{ cursor: "pointer", textAlign: "center" }}
                  onClick={() => {
                    setShowPrintTemplateModal(false);
                    printMenu(templateRefs[tpl.key].current);
                  }}
                >
                  <div
                    className="template-box"
                    style={{
                      backgroundImage: `url(${tpl.img})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "12px",
                      height: 120,
                      width: 180,
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    }}
                  >
                    <p
                      style={{
                        background: "rgba(0,0,0,0.55)",
                        color: "#fff",
                        borderRadius: "0 0 12px 12px",
                        margin: 0,
                        width: "100%",
                        padding: "10px 0",
                        fontWeight: "bold",
                        fontSize: 18,
                        letterSpacing: 1,
                      }}
                    >
                      {tpl.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                style={{
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  marginTop: "20px",
                  cursor: "pointer",
                }}
                onClick={() => setShowPrintTemplateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Hidden QRCODE */}
      <div
        style={{
          background: "white",
          padding: "16px",
          display: "none",
        }}
      >
        <QRCode
          size={200}
          value={`${window.location.host}/view/${selectedRestaurantForTemplate}/template1`}
          ref={qrRef}
        />
      </div>
      {/* Hidden Template 1 */}
      {!!data.length && (
        <div ref={template1Ref} style={{ display: "none" }}>
          <Template1 printData={data} />
        </div>
      )}
      {/* Hidden Template 2 */}
      {!!data.length && (
        <div ref={template2Ref} style={{ display: "none" }}>
          <Template2 printData={data} />
        </div>
      )}
      {/* Hidden Template 3 */}
      {!!data.length && (
        <div ref={template3Ref} style={{ display: "none" }}>
          <Template3 printData={data} />
        </div>
      )}
      {/* Hidden Template 4 */}
      {!!data.length && (
        <div ref={template4Ref} style={{ display: "none" }}>
          <Template4 printData={data} />
        </div>
      )}
      {/* Hidden Template 5 */}
      {!!data.length && (
        <div ref={template5Ref} style={{ display: "none" }}>
          <Template5 printData={data} />
        </div>
      )}
      {/* Hidden Template 6 */}
      {!!data.length && (
        <div ref={template6Ref} style={{ display: "none" }}>
          <Template6 printData={data} />
        </div>
      )}
      {/* Hidden Template 7 */}
      {!!data.length && (
        <div ref={template7Ref} style={{ display: "none" }}>
          <Template7 printData={data} />
        </div>
      )}
      {/* Hidden Template 8 */}
      {!!data.length && (
        <div ref={template8Ref} style={{ display: "none" }}>
          <Template8 printData={data} />
        </div>
      )}
      {/* Hidden Template 9 */}
      {!!data.length && (
        <div ref={template9Ref} style={{ display: "none" }}>
          <Template9 printData={data} />
        </div>
      )}
      {/* Hidden Template 10 */}
      {!!data.length && (
        <div ref={template10Ref} style={{ display: "none" }}>
          <Template10 printData={data} />
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
      overflowX: "hidden",
    },
    main: {
      margin: "245px auto",
      padding: "43px 20px 70px",
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
      backgroundColor: "#FFC107",
      color: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    },
  };
}
