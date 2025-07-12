// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { api } from "../api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { toast } from "react-toastify";
import "./AdminDashboard.css"; // our CSS below

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api
      .get("/admin/users")
      .then(({ data }) => setUsers(data))
      .catch(() => toast.error("Could not load users"));
  }, []);

  const handleSubscriptionAction = async (userId, action) => {
    try {
      const { data } = await api.post(
        `/admin/users/${userId}/subscription/${action}`
      );
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? {
                ...u,
                subscriptionStatus: data.status,
                currentPeriodEnd: data.current_period_end
                  ? new Date(data.current_period_end * 1000)
                  : u.currentPeriodEnd,
                stripeSubscriptionId:
                  action === "cancel" && data.status === "canceled"
                    ? null
                    : u.stripeSubscriptionId,
              }
            : u
        )
      );
      toast.success(`Subscription ${action}d → ${data.status}`);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
    }
  };

  // const handleDeleteUser = async (userId) => {
  //   if (!window.confirm("Really delete this user and all their data?")) return;
  //   try {
  //     await api.delete(`/admin/users/${userId}`);
  //     setUsers(u => u.filter(x => x._id !== userId));
  //     toast.success("User deleted");
  //   } catch (err) {
  //     toast.error("Delete failed");
  //   }
  // };

  const handleDeleteUser = (userId) => {
  const toastId = toast(({ closeToast }) => (
    <div>
      <p style={{marginLeft: "0px"}}>Are you Sure? Want to delete this user?</p>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button
          onClick={async () => {
            try {
              await api.delete(`/admin/users/${userId}`);
              setUsers(prev => prev.filter(u => u._id !== userId));
              toast.success("User deleted");
            } catch (err) {
              toast.error("Delete failed");
            } finally {
              toast.dismiss(toastId);
            }
          }}
          style={{
            backgroundColor: "#e53e3e",
            color: "#fff",
            border: "none",
            padding: "4px 12px",
            borderRadius: 4,
            marginRight: 8,
            cursor: "pointer",
          }}
        >
          Yes
        </button>
        <button
          onClick={() => toast.dismiss(toastId)}
          style={{
            backgroundColor: "#a0aec0",
            color: "#fff",
            border: "none",
            padding: "4px 12px",
            borderRadius: 4,
            marginRight: 65,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  ), {
    autoClose: false,
    closeOnClick: false,
    draggable: false,
    closeButton: false,
  });
};

  return (
    <div className="admin-dashboard" style={{fontFamily: "Montserrat", userSelect:"none"}}>
      <Navbar />

      <main className="dashboard-content">
        <h1 style={{fontSize:"40px"}}>Admin Dashboard</h1>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                {/* <th>Expires</th> */}
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, i) => (
                <tr key={user._id} className={i % 2 === 0 ? "even" : "odd"}>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Role">{user.role}</td>
                  <td data-label="Status">{user.subscriptionStatus || "—"}</td>
                  {/* <td data-label="Expires">
                    {user.currentPeriodEnd
                      ? new Date(user.currentPeriodEnd).toLocaleString()
                      : "—"}
                  </td> */}
                  <td data-label="Actions">
                    {user.subscriptionStatus === "active" && (
                      <>
                        <button
                          onClick={() =>
                            handleSubscriptionAction(user._id, "pause")
                          }
                          className="pause-btn"
                        >
                          Pause
                        </button>
                        <button
                          onClick={() =>
                            handleSubscriptionAction(user._id, "cancel")
                          }
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {user.subscriptionStatus === "paused" && (
                      <button
                        onClick={() =>
                          handleSubscriptionAction(user._id, "resume")
                        }
                        className="resume-btn"
                      >
                        Resume
                      </button>
                    )}
                    {!user.stripeSubscriptionId && <span>—</span>}

                     <button
                onClick={() => handleDeleteUser(user._id)}
                className="delete-btn"
              >
                Delete
              </button>

                  </td>
                </tr>
              ))}
            </tbody>

            
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
}
