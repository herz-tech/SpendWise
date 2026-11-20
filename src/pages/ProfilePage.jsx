
import { useState } from "react";
import "./ProfilePage.css";

function ProfilePage() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [name, setName] = useState(storedUser.name || "");
  const [email, setEmail] = useState(storedUser.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
const [popup, setPopup] = useState({
  show: false,
  title: "",
  text: "",
  type: "success",
});
  const token = localStorage.getItem("token");

  const showMessage = (text, error = false) => {
    setMessage(text);
    setIsError(error);
  };
const showPopup = (title, text, type = "success") => {
  setPopup({
    show: true,
    title,
    text,
    type,
  });
};
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    showMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed");
      }

      const updatedUser = data.user || {
        ...storedUser,
        name,
        email,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setName(updatedUser.name);
      setEmail(updatedUser.email);
      setEditing(false);
      showPopup(
  "Profile Updated!",
  "Your personal information has been updated successfully."
);
    } catch (error) {
      showPopup("Update Failed", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      return showMessage(
        "New password must contain at least 6 characters.",
        true
      );
    }

    if (newPassword !== confirmPassword) {
      return showMessage("New passwords do not match.", true);
    }

    setLoading(true);
    showMessage("");

    try {
      const response = await fetch(
       `${API_BASE_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password change failed");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showPopup(
  "Password Changed!",
  "Your account password has been updated successfully."
);
    } catch (error) {
      showPopup("Update Failed", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">

      <header className="profile-header">
        <div>
          <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
          <h1>My Profile</h1>
          <p>Manage your personal information and account security.</p>
        </div>
        <div className="profile-header-icon">👤</div>
      </header>

      {/* Personal information */}

      <section className="profile-card">

        <div className="profile-card-header">
          <div>
            <span className="profile-section-label">YOUR ACCOUNT</span>
            <h2>Personal Information</h2>
            <p>Keep your account details up to date.</p>
          </div>

          {!editing && (
            <button
              className="profile-edit-btn"
              onClick={() => {
                setEditing(true);
                showMessage("");
              }}
            >
              ✎ Edit Profile
            </button>
          )}
        </div>

        <div className="profile-user-banner">
          <div className="profile-avatar">
            {(name || "U").charAt(0).toUpperCase()}
          </div>

          <div className="profile-user-info">
            <h3>{name || "User"}</h3>
            <p>{email || "No email available"}</p>
            <span className="profile-member-tag">
              <span></span> SpendWise Member
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate}>
          <div className="profile-form-grid">

            <div className="profile-field">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="profile-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!editing}
                required
                placeholder="Enter your email"
              />
            </div>

          </div>

          {editing && (
            <div className="profile-actions">
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={() => {
                  setName(storedUser.name || "");
                  setEmail(storedUser.email || "");
                  setEditing(false);
                  showMessage("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile-save-btn"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes →"}
              </button>
            </div>
          )}
        </form>

      </section>

      {/* Password section */}

      <section className="profile-card password-card">

        <div className="profile-card-header">
          <div>
            <span className="profile-section-label">ACCOUNT PROTECTION</span>
            <h2>Change Password</h2>
            <p>Keep your SpendWise account secure.</p>
          </div>

          <div className="profile-security-icon">🔑</div>
        {message && (
  <div className={`profile-message ${isError ? "error" : "success"}`}>
    <span>{isError ? "!" : "✓"}</span>
    {message}
  </div>
)}
        </div>

        <form onSubmit={handlePasswordChange}>

          <div className="profile-field">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="profile-form-grid">

            <div className="profile-field">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                minLength={6}
                required
              />
            </div>

            <div className="profile-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

          </div>

          <div className="profile-password-hint">
            <span>✦</span>
            Your new password must contain at least 6 characters.
          </div>

          <div className="profile-actions">
            <button
              type="submit"
              className="profile-save-btn"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password →"}
            </button>
            
          </div>

        </form>
      </section>

      <div className="profile-footer">
        <span>✦</span> Your finances deserve a secure home.
      </div>
{popup.show && (
  <div className="profile-popup-overlay">
    <div className="profile-popup">
      <div
        className={`profile-popup-icon ${
          popup.type === "error" ? "popup-error" : ""
        }`}
      >
        {popup.type === "error" ? "!" : "✓"}
      </div>

      <h2>{popup.title}</h2>
      <p>{popup.text}</p>

      <button
        className="profile-popup-btn"
        onClick={() =>
          setPopup({ show: false, title: "", text: "", type: "success" })
        }
      >
        Done
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default ProfilePage;
