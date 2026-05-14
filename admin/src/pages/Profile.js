import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { 
  faUser, 
  faEnvelope, 
  faIdBadge,
  faHeartPulse,
  faCheck,
  faBriefcase,
  faLock,
  faEdit,
  faEye,
  faEyeSlash,
  faShieldAlt,
  faKey,
  faTimes,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

function Profile() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    position: ""
  });
  const [adminId, setAdminId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const apiBase = "http://localhost:5000/api";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const adminIdFromStorage = localStorage.getItem("adminId");
      setAdminId(adminIdFromStorage);

      const response = await axios.get(`${apiBase}/auth/profile`, {
        headers: {
          'admin-id': adminIdFromStorage
        }
      });

      if (response.data.success && response.data.admin) {
        const admin = response.data.admin;
        setFormData({
          fullName: admin.fullName || "Super Administrator",
          email: admin.email || "admin@chesms.gov.ph",
          position: admin.position || "System Administrator"
        });
        localStorage.setItem("adminName", admin.fullName);
        localStorage.setItem("adminEmail", admin.email);
        localStorage.setItem("adminPosition", admin.position);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to localStorage
      const storedName = localStorage.getItem("adminName") || "Super Administrator";
      const storedEmail = localStorage.getItem("adminEmail") || "admin@chesms.gov.ph";
      const storedPosition = localStorage.getItem("adminPosition") || "System Administrator";

      setFormData({
        fullName: storedName,
        email: storedEmail,
        position: storedPosition
      });
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { regex: /.{8,}/, label: "At least 8 characters" },
    { regex: /[A-Z]/, label: "One uppercase letter" },
    { regex: /[a-z]/, label: "One lowercase letter" },
    { regex: /[0-9]/, label: "One number" },
    { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, label: "One special character" },
  ];

  const checkPasswordStrength = (password) => {
    return passwordRequirements.map(req => ({
      ...req,
      met: req.regex.test(password)
    }));
  };

  const passwordStrength = checkPasswordStrength(passwordData.newPassword);
  const strengthPercent = (passwordStrength.filter(r => r.met).length / passwordStrength.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercent <= 20) return "#EF4444";
    if (strengthPercent <= 40) return "#F59E0B";
    if (strengthPercent <= 60) return "#EAB308";
    if (strengthPercent <= 80) return "#22C55E";
    return "#10B981";
  };

  const getStrengthLabel = () => {
    if (strengthPercent <= 20) return "Very Weak";
    if (strengthPercent <= 40) return "Weak";
    if (strengthPercent <= 60) return "Fair";
    if (strengthPercent <= 80) return "Good";
    return "Strong";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const adminId = localStorage.getItem("adminId");
      
      const response = await axios.put(`${apiBase}/auth/profile`, {
        fullName: formData.fullName,
        email: formData.email,
        position: formData.position
      }, {
        headers: {
          'admin-id': adminId
        }
      });

      if (response.data.success) {
        localStorage.setItem("adminName", formData.fullName);
        localStorage.setItem("adminEmail", formData.email);
        localStorage.setItem("adminPosition", formData.position);
        
        setIsEditing(false);
        setShowSuccess(true);
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      // Still save to localStorage as fallback
      localStorage.setItem("adminName", formData.fullName);
      localStorage.setItem("adminEmail", formData.email);
      localStorage.setItem("adminPosition", formData.position);
      
      setIsEditing(false);
      setShowSuccess(true);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: localStorage.getItem("adminName") || "Super Administrator",
      email: localStorage.getItem("adminEmail") || "admin@chesms.gov.ph",
      position: localStorage.getItem("adminPosition") || "System Administrator"
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordRequirements.every(req => req.regex.test(passwordData.newPassword))) {
      setPasswordError("Password does not meet all requirements");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await axios.post(`${apiBase}/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'admin-id': localStorage.getItem("adminId")
        }
      });

      if (response.data.success) {
        setPasswordSuccess(true);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(false);
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setPasswordError(error.response.data.message || "Failed to change password");
      } else {
        setPasswordError("Connection error. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        .profile-wrapper {
          max-width: 500px;
          margin: 0 auto;
        }

        .profile-header {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .profile-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4169E1, #6366F1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .profile-avatar svg {
          font-size: 1.5rem;
          color: white;
        }

        .profile-info {
          flex: 1;
          min-width: 0;
        }

        .profile-name {
          font-size: 1.1rem;
          font-weight: 800;
          color: white;
          margin: 0 0 0.25rem 0;
        }

        .profile-badge {
          display: inline-block;
          background: rgba(65, 105, 225, 0.3);
          color: #93C5FD;
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 3px 8px;
          border-radius: 4px;
        }

        .profile-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .profile-card:last-child {
          margin-bottom: 0;
        }

        .profile-card-header {
          padding: 0.875rem 1rem;
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .profile-card-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .profile-card-title svg {
          color: #4169E1;
        }

        .profile-card-body {
          padding: 1rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .form-label {
          font-size: 0.6rem;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input-wrapper {
          position: relative;
        }

        .form-input-icon {
          position: absolute;
          left: 0.625rem;
          top: 50%;
          transform: translateY(-50%);
          color: #CBD5E1;
          font-size: 0.85rem;
          pointer-events: none;
        }

        .form-input {
          width: 100%;
          padding: 0.625rem 0.75rem 0.625rem 2.25rem;
          border-radius: 8px;
          border: 1.5px solid #E2E8F0;
          background: white;
          font-size: 0.8rem;
          font-weight: 600;
          color: #1E293B;
          transition: all 0.2s;
        }

        .form-input:focus {
          border-color: #4169E1;
          outline: none;
          box-shadow: 0 0 0 3px rgba(65, 105, 225, 0.1);
        }

        .form-input:disabled {
          background: #F8FAFC;
          color: #94A3B8;
          cursor: not-allowed;
        }

        .form-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #F1F5F9;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          border: none;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.7rem;
        }

        .btn-primary {
          background: #4169E1;
          color: white;
        }

        .btn-primary:hover {
          background: #3154B3;
        }

        .btn-secondary {
          background: white;
          color: #64748B;
          border: 1.5px solid #E2E8F0;
        }

        .btn-secondary:hover {
          background: #F8FAFC;
        }

        .action-btn {
          width: 100%;
          padding: 0.875rem 1rem;
          border-radius: 10px;
          background: white;
          border: 1.5px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          border-color: #4169E1;
          background: #F8FAFC;
        }

        .action-btn-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .action-btn-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4169E1;
        }

        .action-btn-text {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1E293B;
        }

        .action-btn-arrow {
          color: #CBD5E1;
          font-size: 0.75rem;
        }

        .toast {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: #10B981;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
          animation: slideUp 0.3s ease;
          z-index: 99999;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          overflow: hidden;
          animation: modalSlide 0.2s ease;
        }

        @keyframes modalSlide {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-header-title {
          color: white;
          font-size: 0.9rem;
          font-weight: 800;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-header-title svg {
          color: #4169E1;
        }

        .modal-close {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
          padding: 1.25rem;
        }

        .password-field {
          margin-bottom: 1rem;
        }

        .password-label {
          font-size: 0.6rem;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.375rem;
          display: block;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input {
          width: 100%;
          padding: 0.625rem 2.5rem 0.625rem 2.25rem;
          border-radius: 8px;
          border: 1.5px solid #E2E8F0;
          font-size: 0.8rem;
          font-weight: 600;
          color: #1E293B;
          transition: all 0.2s;
        }

        .password-input:focus {
          border-color: #4169E1;
          outline: none;
          box-shadow: 0 0 0 3px rgba(65, 105, 225, 0.1);
        }

        .password-toggle {
          position: absolute;
          right: 0.625rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle:hover {
          color: #4169E1;
        }

        .strength-section {
          margin: 1rem 0;
        }

        .strength-bar {
          height: 4px;
          background: #E2E8F0;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.375rem;
        }

        .strength-fill {
          height: 100%;
          border-radius: 2px;
          transition: all 0.3s;
        }

        .strength-text {
          font-size: 0.65rem;
          font-weight: 700;
          text-align: right;
        }

        .requirements-box {
          background: #F8FAFC;
          border-radius: 8px;
          padding: 0.75rem;
          margin-top: 0.75rem;
        }

        .requirements-title {
          font-size: 0.6rem;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .requirement {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: #CBD5E1;
          margin-bottom: 0.25rem;
          transition: all 0.2s;
        }

        .requirement:last-child {
          margin-bottom: 0;
        }

        .requirement.met {
          color: #10B981;
        }

        .requirement-icon {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.5rem;
          transition: all 0.2s;
        }

        .requirement.met .requirement-icon {
          background: #10B981;
          color: white;
        }

        .error-msg {
          color: #EF4444;
          font-size: 0.7rem;
          font-weight: 700;
          margin-top: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .success-msg {
          color: #10B981;
          font-size: 0.7rem;
          font-weight: 700;
          margin-top: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .modal-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .modal-actions .btn {
          flex: 1;
        }

        @media (max-width: 480px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>

      <div className="profile-wrapper">
        <div className="profile-header">
          <div className="profile-avatar">
            <FontAwesomeIcon icon={faHeartPulse} />
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{formData.fullName}</h1>
            <span className="profile-badge">Administrator</span>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h2 className="profile-card-title">
              <FontAwesomeIcon icon={faUser} /> Personal Information
            </h2>
            {!isEditing ? (
              <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
            ) : (
              <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Editing...</span>
            )}
          </div>

          <form className="profile-card-body" onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="form-input-wrapper">
                  <FontAwesomeIcon icon={faUser} className="form-input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Admin ID</label>
                <div className="form-input-wrapper">
                  <FontAwesomeIcon icon={faIdBadge} className="form-input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    value={adminId}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="form-input-wrapper">
                  <FontAwesomeIcon icon={faEnvelope} className="form-input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Position</label>
                <div className="form-input-wrapper">
                  <FontAwesomeIcon icon={faBriefcase} className="form-input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <FontAwesomeIcon icon={faCheck} /> Save
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h2 className="profile-card-title">
              <FontAwesomeIcon icon={faShieldAlt} /> Security
            </h2>
          </div>
          <div className="profile-card-body">
            <button className="action-btn" onClick={() => setShowPasswordModal(true)}>
              <div className="action-btn-left">
                <div className="action-btn-icon">
                  <FontAwesomeIcon icon={faKey} />
                </div>
                <span className="action-btn-text">Change Password</span>
              </div>
              <FontAwesomeIcon icon={faEdit} className="action-btn-arrow" />
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="toast">
            <FontAwesomeIcon icon={faCheck} />
            {successMessage}
          </div>
        )}
      </div>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-header-title">
                <FontAwesomeIcon icon={faLock} /> Change Password
              </h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form className="modal-body" onSubmit={handlePasswordChange}>
              <div className="password-field">
                <label className="password-label">Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    className="password-input"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}>
                    <FontAwesomeIcon icon={showPasswords.current ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="password-field">
                <label className="password-label">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    className="password-input"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}>
                    <FontAwesomeIcon icon={showPasswords.new ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {passwordData.newPassword && (
                <div className="strength-section">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{ 
                        width: `${strengthPercent}%`,
                        background: getStrengthColor()
                      }}
                    />
                  </div>
                  <div className="strength-text" style={{ color: getStrengthColor() }}>
                    {getStrengthLabel()}
                  </div>

                  <div className="requirements-box">
                    <div className="requirements-title">Password Requirements</div>
                    {passwordStrength.map((req, index) => (
                      <div key={index} className={`requirement ${req.met ? 'met' : ''}`}>
                        <div className="requirement-icon">
                          <FontAwesomeIcon icon={faCheck} />
                        </div>
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="password-field">
                <label className="password-label">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    className="password-input"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}>
                    <FontAwesomeIcon icon={showPasswords.confirm ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="error-msg">
                  <FontAwesomeIcon icon={faExclamationTriangle} style={{ fontSize: '0.65rem' }} />
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="success-msg">
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: '0.65rem' }} />
                  Password changed successfully!
                </div>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
                  {isChangingPassword ? "Updating..." : <><FontAwesomeIcon icon={faCheck} /> Update</>}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Profile;
