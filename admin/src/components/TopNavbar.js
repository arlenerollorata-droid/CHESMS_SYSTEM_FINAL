import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBell, 
  faChevronDown,
  faCircleExclamation,
  faCalendarAlt,
  faTimes,
  faSignOutAlt,
  faUser, 
  faBars,
  faUserPlus,
  faClipboardCheck,
  faClock,
  faMapMarkerAlt,
  faHeartPulse
  } from "@fortawesome/free-solid-svg-icons";

function TopNavbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const adminId = localStorage.getItem("adminId") || "BHW-SYSTEM-SA";
  const adminName = localStorage.getItem("adminName") || "Super Administrator";

  useEffect(() => {
    const savedReadIds = JSON.parse(localStorage.getItem("readNotificationIds") || "[]");
    setReadIds(savedReadIds);

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const apiBase = "http://localhost:5000/api";
      const [annRes, evtRes, resRes, recRes] = await Promise.all([
        axios.get(`${apiBase}/announcements`),
        axios.get(`${apiBase}/events`),
        axios.get(`${apiBase}/residents`),
        axios.get(`${apiBase}/records`)
      ]);

      const now = new Date();
      const todayStr = now.toDateString();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const alerts = annRes.data.filter(a => a.priority === 'High').map(a => ({
          id: `ann-${a._id}`,
          title: "System Alert",
          message: a.title,
          description: a.content,
          time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fullDate: new Date(a.createdAt).toLocaleString(),
          type: 'alert',
          ts: new Date(a.createdAt),
          author: a.author
      }));

      const events = evtRes.data.filter(e => new Date(e.date).toDateString() === todayStr).map(e => ({
          id: `evt-${e._id}`,
          title: "Scheduled Today",
          message: e.title,
          description: e.description || "No description provided.",
          time: e.startTime || "All Day",
          fullDate: new Date(e.date).toLocaleDateString(),
          type: 'event',
          ts: new Date(e.date),
          location: e.location
      }));

      const newResidents = resRes.data.filter(r => new Date(r.createdAt) > yesterday).map(r => ({
          id: `res-${r._id}`,
          title: "New Resident",
          message: `${[r.firstName, r.middleName, r.lastName].filter(Boolean).join(' ')} joined`,
          description: `A new resident from Purok ${r.purok || 'N/A'} has registered an account. Household ID: ${r.householdId || 'N/A'}`,
          time: "Recent",
          fullDate: new Date(r.createdAt).toLocaleString(),
          type: 'resident',
          ts: new Date(r.createdAt),
          purok: r.purok
      }));

      const newRecords = recRes.data.slice(0, 5).map(r => ({
          id: `rec-${r._id}`,
          title: "Checkup Logged",
          message: `For ${r.patientName || r.patientId || 'Patient'}`,
          description: `Latest note: ${r.consultations?.[0]?.diagnosis || r.consultations?.[0]?.chiefComplaint || r.knownConditions || 'Record updated.'}`,
          time: "Recently",
          fullDate: new Date(r.createdAt || r.date).toLocaleString(),
          type: 'record',
          ts: new Date(r.createdAt || r.date)
      }));

      const allNotifs = [...alerts, ...events, ...newResidents, ...newRecords]
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 15);

      setNotifications(allNotifs);
    } catch (err) { 
      console.error("Notification Error:", err); 
    }
  };

  const handleLogout = () => {
      if (window.confirm("Are you sure you want to logout?")) {
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("adminId");
          localStorage.removeItem("adminName");
          localStorage.removeItem("adminEmail");
          localStorage.removeItem("adminPosition");
          window.location.href = "/login";
      }
  };

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id];
      setReadIds(newReadIds);
      localStorage.setItem("readNotificationIds", JSON.stringify(newReadIds));
    }
  };

  const clearNotifications = () => {
      const allIds = notifications.map(n => n.id);
      const newReadIds = Array.from(new Set([...readIds, ...allIds]));
      setReadIds(newReadIds);
      localStorage.setItem("readNotificationIds", JSON.stringify(newReadIds));
  };

  const handleNotifClick = (notif) => {
    markAsRead(notif.id);
    setSelectedNotif(notif);
    setIsModalOpen(true);
    setShowNotifications(false);
  };

  const getNotifIcon = (type) => {
    switch(type) {
      case 'alert': return faCircleExclamation;
      case 'event': return faCalendarAlt;
      case 'resident': return faUserPlus;
      case 'record': return faClipboardCheck;
      default: return faBell;
    }
  };

  const getNotifColors = (type) => {
    switch(type) {
      case 'alert': return { bg: '#FEF2F2', text: '#EF4444' };
      case 'event': return { bg: '#F5F3FF', text: '#8B5CF6' };
      case 'resident': return { bg: '#ECFDF5', text: '#10B981' };
      case 'record': return { bg: '#EFF6FF', text: '#3B82F6' };
      default: return { bg: '#F8FAFC', text: '#64748B' };
    }
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const NotificationModal = () => {
    if (!isModalOpen || !selectedNotif) return null;

    const modalContent = (
      <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
        <div className="report-card animate-scale-in" style={{ width: '100%', maxWidth: '400px', padding: '0', borderRadius: '20px', overflow: 'hidden', background: 'white' }}>
          <div style={{ 
            background: getNotifColors(selectedNotif.type).bg, 
            padding: '1.5rem 1.25rem', 
            color: getNotifColors(selectedNotif.type).text,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'white', border: 'none', color: '#64748B', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faTimes} style={{ fontSize: '0.75rem' }} />
            </button>
            
            <div style={{ 
              width: '52px', height: '52px', borderRadius: '14px', background: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
              marginBottom: '0.625rem', boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
            }}>
              <FontAwesomeIcon icon={getNotifIcon(selectedNotif.type)} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{selectedNotif.title}</h2>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '3px', opacity: 0.8 }}>{selectedNotif.fullDate}</span>
          </div>
          
          <div style={{ padding: '1.25rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '5px', letterSpacing: '0.05em' }}>DETAILS</label>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#1E293B', fontWeight: 500, lineHeight: 1.5 }}>{selectedNotif.description || selectedNotif.message}</p>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faClock} style={{ color: '#CBD5E1', width: '14px' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{selectedNotif.time}</span>
              </div>

              {selectedNotif.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#CBD5E1', width: '14px' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{selectedNotif.location}</span>
                </div>
              )}

              {selectedNotif.author && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FontAwesomeIcon icon={faUser} style={{ color: '#CBD5E1', width: '14px' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{selectedNotif.author}</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ 
                width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none',
                background: '#1E293B', color: 'white', fontWeight: 700, cursor: 'pointer',
                marginTop: '1rem', transition: 'all 0.2s',
                fontSize: '0.8rem'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
  };

  return (
    <nav className="top-nav">
      <div className="top-nav__left">
        <button className="icon-button mobile-only" onClick={onMenuClick}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      <div className="top-nav__actions">
        <div style={{ position: 'relative' }}>
            <button 
                className="icon-button" 
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                style={{ 
                    width: '40px', height: '40px', borderRadius: '12px', 
                    background: showNotifications ? '#4169E1' : '#F8FAFC', 
                    color: showNotifications ? 'white' : '#64748B',
                    fontSize: '1.1rem', border: '1px solid #E2E8F0'
                }}
            >
              <FontAwesomeIcon icon={faBell} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: '#EF4444', color: 'white', fontSize: '0.6rem', fontWeight: 900, borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
                <div className="notification-dropdown animate-fade-in" style={{ 
                  position: 'absolute', top: '120%', right: '0',
                  width: '360px', borderRadius: '16px', padding: '0', overflow: 'hidden', border: 'none', 
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                  zIndex: 1001, background: 'white'
                }}>
                    <div className="dropdown-header" style={{ padding: '0.875rem 1rem', background: '#FFFFFF', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>Notifications</span>
                          {unreadCount > 0 && <span style={{ background: '#4169E1', color: 'white', fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '999px' }}>{unreadCount}</span>}
                        </div>
                        <button onClick={clearNotifications} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4169E1', background: 'none', border: 'none', cursor: 'pointer' }}>
                            Mark all read
                        </button>
                    </div>
                    <div className="notification-list" style={{ maxHeight: '350px', overflowY: 'auto', padding: '0.375rem' }}>
                        {notifications.length > 0 ? notifications.map(n => {
                            const colors = getNotifColors(n.type);
                            const isRead = readIds.includes(n.id);
                            return (
                              <div 
                                key={n.id} 
                                className="notification-item" 
                                onClick={() => handleNotifClick(n)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = isRead ? '#F8FAFC' : 'rgba(65, 105, 225, 0.1)';
                                  e.currentTarget.style.transform = 'translateX(2px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = isRead ? 'transparent' : 'rgba(65, 105, 225, 0.05)';
                                  e.currentTarget.style.transform = 'translateX(0)';
                                }}
                                style={{ 
                                  padding: '0.625rem 0.75rem', borderRadius: '10px', margin: '2px', display: 'flex', gap: '10px', transition: 'all 0.2s ease', cursor: 'pointer',
                                  background: isRead ? 'transparent' : 'rgba(65, 105, 225, 0.05)',
                                  border: isRead ? 'none' : '1px solid rgba(65, 105, 225, 0.1)'
                                }}
                              >
                                  <div style={{ 
                                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                                    background: colors.bg, color: colors.text,
                                    position: 'relative'
                                  }}>
                                      <FontAwesomeIcon icon={getNotifIcon(n.type)} />
                                      {!isRead && (
                                        <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '7px', height: '7px', background: '#4169E1', borderRadius: '50%', border: '1.5px solid white' }}></span>
                                      )}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1px' }}>
                                          <span style={{ fontSize: '0.75rem', fontWeight: isRead ? 600 : 800, color: isRead ? '#64748B' : '#0F172A' }}>{n.title}</span>
                                          <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#94A3B8', flexShrink: 0 }}>{n.time}</span>
                                      </div>
                                      <p style={{ margin: 0, fontSize: '0.7rem', color: isRead ? '#94A3B8' : '#64748B', lineHeight: 1.3, fontWeight: isRead ? 400 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</p>
                                  </div>
                              </div>
                            );
                        }) : (
                          <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8' }}>No recent activity</p>
                          </div>
                        )}
                    </div>
                    <div style={{ padding: '0.75rem', textAlign: 'center', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation();
                          setShowNotifications(false);
                          navigate('/notifications'); 
                        }}
                        style={{ background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 700, color: '#4169E1', cursor: 'pointer' }}
                      >
                        View all
                      </button>
                    </div>
                </div>
            )}
        </div>
        
        <div style={{ position: 'relative' }}>
            <div className="user-profile" onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}>
                <div className="user-profile__avatar" style={{ background: 'linear-gradient(135deg, #4169E1, #6366F1)' }}>
                  <FontAwesomeIcon icon={faHeartPulse} style={{ fontSize: '0.875rem' }} />
                </div>
                <div className="user-profile__info hide-on-mobile">
                    <p className="admin-name">{adminName}</p>
                    <p className="admin-id">{adminId}</p>
                </div>
                <FontAwesomeIcon icon={faChevronDown} className={`chevron ${showProfileMenu ? 'open' : ''}`} />
            </div>

            {showProfileMenu && (
                <div className="profile-dropdown animate-fade-in" style={{ zIndex: 1001 }}>
                    <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="dropdown-link">
                        <FontAwesomeIcon icon={faUser} />
                        <span>My Profile</span>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-link logout">
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
      </div>

      <NotificationModal />
    </nav>
  );
}

export default TopNavbar;
