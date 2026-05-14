import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHome, 
  faCalendarAlt, 
  faClipboardCheck, 
  faBullhorn, 
  faChartBar, 
  faFileMedical,
  faHospitalUser,
  faMapMarkerAlt,
  faMobile,
  faHeartPulse
} from "@fortawesome/free-solid-svg-icons";

function Sidebar({ isOpen }) {
  const mainNavItems = [
    { path: "/", icon: faHome, label: "Dashboard" },
    { path: "/patients", icon: faHospitalUser, label: "Patients" },
    { path: "/appointments", icon: faCalendarAlt, label: "Schedule" },
    { path: "/medical-history", icon: faFileMedical, label: "Medical Records" },
  ];

  const communityNavItems = [
    { path: "/census", icon: faMapMarkerAlt, label: "Community Census" },
    { path: "/residents", icon: faMobile, label: "App Registrations" },
  ];

  const managementNavItems = [
    { path: "/announcements", icon: faBullhorn, label: "News & Alerts" },
    { path: "/attendance", icon: faClipboardCheck, label: "Attendance" },
    { path: "/reports", icon: faChartBar, label: "Clinic Reports" },
  ];

  const renderNavSection = (title, items) => (
    <div className="sidebar__section">
      <span className="sidebar__section-title">{title}</span>
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `sidebar__link ${isActive ? "active" : ""}`}
        >
          <FontAwesomeIcon icon={item.icon} className="sidebar__link-icon" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">
            <FontAwesomeIcon icon={faHeartPulse} />
          </div>
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">CHESMS</span>
            <span className="sidebar__brand-subtitle">Community Health</span>
          </div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {renderNavSection("Main", mainNavItems)}
        {renderNavSection("Community", communityNavItems)}
        {renderNavSection("Management", managementNavItems)}
      </nav>

    </aside>
  );
}

export default Sidebar;
