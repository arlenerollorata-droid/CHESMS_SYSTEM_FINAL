import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { 
  faUser,
  faLock,
  faExclamationCircle,
  faEye,
  faEyeSlash,
  faCapsules
} from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusField, setFocusField] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 1040 : false
  );
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 1040);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password
      });

      if (response.data.success) {
        const { admin } = response.data;
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("adminId", admin.id);
        localStorage.setItem("adminName", admin.fullName);
        localStorage.setItem("adminEmail", admin.email);
        localStorage.setItem("adminPosition", admin.position);
        navigate("/");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Login failed");
      } else {
        setError("Connection error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "63% 37%",
      background: "#f4f8ff",
      color: "#0f172a",
      fontFamily: "'Segoe UI', 'Tahoma', sans-serif"
    },
    leftPanel: {
      position: "relative",
      minHeight: isMobile ? "360px" : "100vh",
      overflow: "hidden",
      background: "#e9f3ff"
    },
    leftImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "center",
      filter: "saturate(0.96) contrast(1.02)"
    },
    leftOverlay: {
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(180deg, rgba(238, 246, 255, 0.35) 8%, rgba(71, 151, 205, 0.62) 100%)"
    },
    leftContent: {
      position: "absolute",
      left: isMobile ? "1.15rem" : "3.2rem",
      right: isMobile ? "1.15rem" : "3.2rem",
      bottom: isMobile ? "1.2rem" : "2.9rem",
      color: "#ffffff",
      zIndex: 2,
      maxWidth: "640px"
    },
    leftBrand: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "0.95rem",
      fontSize: isMobile ? "1.35rem" : "1.75rem",
      fontWeight: 800,
      letterSpacing: "0.04em"
    },
    leftBadge: {
      width: "38px",
      height: "38px",
      borderRadius: "11px",
      border: "2px solid rgba(255, 255, 255, 0.95)",
      background: "rgba(255, 255, 255, 0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.92rem"
    },
    leftKicker: {
      margin: 0,
      fontSize: isMobile ? "0.95rem" : "1.05rem",
      fontWeight: 600,
      color: "rgba(255, 255, 255, 0.95)"
    },
    leftTitle: {
      margin: "0.5rem 0 0",
      fontSize: isMobile ? "1.25rem" : "1.62rem",
      lineHeight: 1.3,
      color: "#102f68",
      fontWeight: 800,
      maxWidth: "580px",
      textShadow: "0 2px 7px rgba(255, 255, 255, 0.2)"
    },
    rightPanel: {
      minHeight: isMobile ? "auto" : "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "1.6rem 1rem 2rem" : "2.1rem",
      background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
      borderLeft: isMobile ? "none" : "1px solid #e9eef5",
      borderTop: isMobile ? "1px solid #e9eef5" : "none"
    },
    formShell: {
      width: "100%",
      maxWidth: "360px"
    },
    chip: {
      width: "52px",
      height: "33px",
      borderRadius: "11px",
      border: "1.8px solid #1f2937",
      color: "#2e84bf",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "1.05rem",
      fontSize: "0.95rem"
    },
    title: {
      margin: 0,
      fontSize: "2.35rem",
      color: "#1d3363",
      lineHeight: 1.05,
      fontWeight: 800
    },
    subtitle: {
      margin: "0.42rem 0 1.35rem",
      color: "#7b8594",
      fontSize: "0.97rem"
    },
    helper: {
      margin: "-0.2rem 0 1.02rem",
      color: "#5f6c80",
      background: "#f0f7ff",
      border: "1px dashed #c7def4",
      borderRadius: "8px",
      fontSize: "0.74rem",
      fontWeight: 600,
      padding: "0.48rem 0.58rem"
    },
    inputGroup: {
      marginBottom: "1rem"
    },
    label: {
      display: "block",
      color: "#334155",
      fontSize: "0.84rem",
      fontWeight: 700,
      marginBottom: "0.32rem"
    },
    inputWrap: {
      position: "relative"
    },
    icon: (active) => ({
      position: "absolute",
      left: "0.85rem",
      top: "50%",
      transform: "translateY(-50%)",
      color: active ? "#2284d6" : "#9aa3b0",
      fontSize: "0.82rem",
      pointerEvents: "none",
      transition: "color 0.2s ease"
    }),
    input: (active) => ({
      width: "100%",
      border: `1px solid ${active ? "#2284d6" : "#d9dee7"}`,
      background: "#ffffff",
      borderRadius: "10px",
      padding: "0.78rem 0.85rem 0.78rem 2.35rem",
      color: "#0f172a",
      fontSize: "0.88rem",
      outline: "none",
      boxShadow: active ? "0 0 0 3px rgba(34, 132, 214, 0.12)" : "none",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease"
    }),
    passToggle: {
      position: "absolute",
      right: "0.45rem",
      top: "50%",
      transform: "translateY(-50%)",
      border: "none",
      background: "transparent",
      color: "#a9b2bf",
      fontSize: "0.82rem",
      padding: "0.35rem",
      cursor: "pointer"
    },
    submit: {
      width: "100%",
      marginTop: "0.15rem",
      border: "none",
      borderRadius: "10px",
      background: "linear-gradient(135deg, #2d93e8 0%, #1f79c4 100%)",
      color: "#ffffff",
      padding: "0.8rem",
      fontSize: "0.88rem",
      fontWeight: 700,
      letterSpacing: "0.02em",
      cursor: "pointer",
      boxShadow: "0 10px 22px rgba(31, 121, 196, 0.26)"
    },
    securityNote: {
      marginTop: "0.7rem",
      textAlign: "center",
      color: "#7d8898",
      fontSize: "0.72rem",
      fontWeight: 600
    },
    error: {
      background: "#fff3f3",
      border: "1px solid #f5cccc",
      color: "#cb3f3f",
      padding: "0.66rem 0.78rem",
      borderRadius: "10px",
      fontSize: "0.8rem",
      fontWeight: 600,
      marginBottom: "0.95rem",
      display: "flex",
      alignItems: "center",
      gap: "7px"
    },
    footer: {
      marginTop: "1rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "0.72rem",
      color: "#9aa3b2",
      fontWeight: 600
    },
    footerLinks: {
      display: "none"
    }
  };

  return (
    <div style={styles.page}>
      <section style={styles.leftPanel}>
        <img
          src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=1600"
          alt="Healthcare"
          style={styles.leftImage}
        />
        <div style={styles.leftOverlay} />

        <div style={styles.leftContent}>
          <div style={styles.leftBrand}>
            <span style={styles.leftBadge}>
              <FontAwesomeIcon icon={faCapsules} />
            </span>
            <span>CHESMS</span>
          </div>
          <p style={styles.leftKicker}>Community Health Electronic Services Management System</p>
          <h2 style={styles.leftTitle}>Manage patient records, appointments, and barangay health services in one secure platform</h2>
        </div>
      </section>

      <section style={styles.rightPanel}>
        <div style={styles.formShell}>
          <div style={styles.chip} aria-hidden="true">
            <FontAwesomeIcon icon={faCapsules} />
          </div>

          <h1 style={styles.title}>Welcome</h1>
          <p style={styles.subtitle}>Sign in to access the CHESMS administrator portal.</p>
          <p style={styles.helper}>Authorized users only. Use your assigned CHESMS admin credentials.</p>

          {error && (
            <div style={styles.error}>
              <FontAwesomeIcon icon={faExclamationCircle} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrap}>
                <input 
                  style={styles.input(focusField === "username")}
                  type="text" 
                  placeholder="johndoe@work.com"
                  required
                  onFocus={() => setFocusField("username")}
                  onBlur={() => setFocusField(null)}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <FontAwesomeIcon icon={faUser} style={styles.icon(focusField === "username")} />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <input 
                  style={styles.input(focusField === "password")}
                  type={showPassword ? "text" : "password"} 
                  placeholder="************"
                  required
                  onFocus={() => setFocusField("password")}
                  onBlur={() => setFocusField(null)}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <FontAwesomeIcon icon={faLock} style={styles.icon(focusField === "password")} />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.passToggle}
                  aria-label="Toggle password visibility"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <button type="submit" style={styles.submit}>
              Login
            </button>

          </form>

          <div style={styles.footer}>
            <span>All rights reserved 2026</span>
          </div>
        </div>
      </section>
    </div>
  );
}
