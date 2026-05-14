import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTrash, 
  faSearch, faTimes, faMapMarkerAlt, faClock, 
  faThumbtack, faUsers, faBaby, faPersonPregnant, faUserShield,
  faEdit, faBroadcastTower, faSync, faCheckCircle,
  faHourglassHalf, faBolt, faSatelliteDish
} from "@fortawesome/free-solid-svg-icons";

const ANN_API = "http://localhost:5000/api/announcements";
const EVT_API = "http://localhost:5000/api/events";

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [postType, setPostType] = useState("announcement");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState("All"); 
  
  const [formData, setFormData] = useState({
    title: "", content: "", note: "", category: "General", priority: "Medium",
    date: "", startTime: "", endTime: "", location: "", target: "All Residents", 
    isPinned: false, capacityTotal: 0, capacityTaken: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [annRes, evtRes] = await Promise.all([
        axios.get(ANN_API),
        axios.get(EVT_API)
      ]);
      const announcements = annRes.data.map(a => ({ ...a, type: 'announcement' }));
      const events = evtRes.data.map(e => ({ ...e, type: 'event' }));
      const merged = [...announcements, ...events].sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setItems(merged);
    } catch (err) { 
        console.error("Error fetching hub data:", err); 
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = (item) => {
      setPostType(item.type);
      setCurrentId(item._id);
      setIsEditing(true);
      setFormData({
          title: item.title,
          content: item.content || item.description,
          note: item.note || "",
          category: item.category || "General",
          priority: item.priority || "Medium",
          date: item.date || "",
          startTime: item.startTime || "",
          endTime: item.endTime || "",
          location: item.location || "",
          target: item.target || "All Residents",
          isPinned: item.isPinned || false,
          capacityTotal: item.capacityTotal || 0,
          capacityTaken: item.capacityTaken || 0
      });
      setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = postType === "announcement" ? {
          title: formData.title,
          content: formData.content,
          note: formData.note,
          category: formData.target, // Map target to category for mobile app compatibility
          target: formData.target,
          priority: formData.priority,
          isPinned: formData.isPinned,
          author: formData.author || "Admin"
      } : {
          title: formData.title,
          description: formData.content,
          note: formData.note,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime || undefined,
          location: formData.location,
          category: formData.target === "Event" ? "Event" : formData.target,
          target: formData.target,
          priority: formData.priority,
          isPinned: formData.isPinned,
          capacityTotal: formData.capacityTotal || 0,
          capacityTaken: formData.capacityTaken || 0,
          status: formData.status || "Upcoming",
          author: formData.author || "Admin"
      };

      const api = postType === "announcement" ? ANN_API : EVT_API;
      if (isEditing) {
          if (postType === "announcement") {
              await axios.delete(`${api}/${currentId}`);
              await axios.post(`${api}/add`, payload);
          } else {
              await axios.put(`${api}/${currentId}`, payload);
          }
      } else {
          await axios.post(`${api}/add`, payload);
      }
      
      fetchData();
      setIsModalOpen(false);
      resetForm();
      alert("Published successfully!");
    } catch (err) { 
        console.error("Error saving post:", err);
        alert("Failed to publish: " + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ title: "", content: "", note: "", category: "General", priority: "Medium", date: "", startTime: "", endTime: "", location: "", capacityTotal: "", capacityTaken: "", status: "Upcoming", target: "All Residents", isPinned: false });
  };

  const handleDelete = async (id, type) => {
    if (window.confirm(`Permanently remove this ${type}?`)) {
        try {
            const api = type === 'announcement' ? ANN_API : EVT_API;
            await axios.delete(`${api}/${id}`);
            fetchData();
        } catch (err) { console.error("Error deleting item:", err); }
    }
  };

  const getEventStatus = (dateStr) => {
      if (!dateStr) return null;
      const eventDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const diffTime = eventDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (eventDate.getTime() === today.getTime()) return { label: "ACTIVE TODAY", color: "#10B981", sub: "Happening now" };
      if (eventDate < today) return { label: "PAST EVENT", color: "#64748B", sub: "Ended" };
      return { label: "UPCOMING", color: "#4169E1", sub: `In ${diffDays} days` };
  };

  const getTargetIcon = (target) => {
      if (target?.includes("Infants")) return faBaby;
      if (target?.includes("Pregnant")) return faPersonPregnant;
      if (target?.includes("Seniors")) return faUserShield;
      if (target?.includes("Alert")) return faBolt;
      if (target?.includes("News")) return faBroadcastTower;
      return faUsers;
  };

  const isNewPost = (createdAt) => {
      const created = new Date(createdAt);
      const today = new Date();
      return (today - created) < (24 * 60 * 60 * 1000);
  };

  const filtered = items.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (item.content || item.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      if (filterTab === "Alerts") return matchesSearch && item.type === 'announcement' && item.priority === 'High';
      if (filterTab === "Events") return matchesSearch && item.type === 'event';
      return matchesSearch;
  });

  return (
    <Layout title="Strategic Hub" subtitle="Official Health Coordination & Intelligence Feed"
      actions={
        <div style={{ display: 'flex', gap: '10px' }}>
            <button className="icon-button" onClick={fetchData} title="Sync Feed" style={{ background: 'white', border: '1px solid #E2E8F0' }}>
                <FontAwesomeIcon icon={faSync} spin={loading} />
            </button>
            <button className="button button--primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                <FontAwesomeIcon icon={faBroadcastTower} /> 
                New Announcement
            </button>
        </div>
      }
    >
      
      {/* REFINED STATS BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="report-card" style={{ padding: '0.75rem 1rem', background: '#0F172A', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faSatelliteDish} style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Active Feed</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 900 }}>{items.length} Posts</div>
              </div>
          </div>
          <div className="report-card" style={{ padding: '0.75rem 1rem', borderLeft: '4px solid #EF4444', background: 'white' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Emergency Alerts</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#EF4444' }}>{items.filter(i=>i.priority==='High').length} Required</div>
          </div>
          <div className="report-card" style={{ padding: '0.75rem 1rem', borderLeft: '4px solid #10B981', background: 'white' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Active Events</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#10B981' }}>{items.filter(i=>i.type==='event').length} Scheduled</div>
          </div>
          <div className="report-card" style={{ padding: '0.75rem 1rem', borderLeft: '4px solid #4169E1', background: 'white' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Pinned Priority</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#4169E1' }}>{items.filter(i=>i.isPinned).length} Important</div>
          </div>
      </div>

      {/* ACTION BAR */}
      <section style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'white', padding: '6px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px', gap: '2px' }}>
                {['All', 'Alerts', 'Events'].map(tab => (
                    <button key={tab} onClick={() => setFilterTab(tab)} style={{ padding: '0.4rem 1.25rem', borderRadius: '8px', border: 'none', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', background: filterTab === tab ? 'white' : 'transparent', color: filterTab === tab ? '#4169E1' : '#64748B', transition: 'all 0.2s' }}>{tab.toUpperCase()}</button>
                ))}
            </div>
            <div style={{ position: 'relative', flex: 1 }}>
                <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input 
                    style={{ width: '100%', padding: '0.5rem 2.5rem 0.5rem 2.5rem', borderRadius: '10px', border: 'none', background: '#F8FAFC', outline: 'none', fontSize: '0.8125rem', fontWeight: 600 }} 
                    placeholder={`Search through hub Intelligence...`} 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm("")} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                        <FontAwesomeIcon icon={faTimes} size="sm" />
                    </button>
                )}
            </div>
        </div>
      </section>

      {/* DYNAMIC FEED */}
      {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
              <FontAwesomeIcon icon={faSync} spin size="3x" style={{ color: '#E2E8F0' }} />
              <p style={{ marginTop: '1rem', color: '#94A3B8', fontWeight: 700 }}>Synchronizing Intel...</p>
          </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }} className="animate-fade-in">
            {filtered.map((item) => {
            const status = item.type === 'event' ? getEventStatus(item.date) : null;
            const cardColor = item.type === 'event' ? '#8B5CF6' : (item.priority === 'High' ? '#EF4444' : '#4169E1');
            const isNew = isNewPost(item.createdAt);
            
            return (
                <div key={item._id} className={`report-card ${item.priority === 'High' ? 'status-pulse' : ''}`} 
                onClick={() => {
                    if (item.type === 'event') {
                        setSelectedEvent(item);
                        setIsDetailModalOpen(true);
                    }
                }}
                style={{ 
                display: 'flex', padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white',
                boxShadow: item.isPinned ? '0 8px 20px -4px rgba(65, 105, 225, 0.15)' : 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
                cursor: item.type === 'event' ? 'pointer' : 'default'
                }}>
                <div style={{ width: '5px', background: `linear-gradient(to bottom, ${cardColor}, ${cardColor}88)` }}></div>

                <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                    {item.isPinned && <div className="pinned-badge" style={{ right: '1.25rem', top: '-1px', fontSize: '0.5rem', background: cardColor, padding: '3px 8px' }}><FontAwesomeIcon icon={faThumbtack} /> PINNED</div>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.55rem', fontWeight: 900, color: cardColor, textTransform: 'uppercase', letterSpacing: '0.05em', background: `${cardColor}10`, padding: '2px 6px', borderRadius: '4px' }}>
                                {item.type === 'event' ? 'Actionable Event' : 'Public Notice'}
                            </span>
                            {isNew && <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#10B981', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}><FontAwesomeIcon icon={faBolt} /> NEW</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="icon-button" title="Edit" style={{ width: '22px', height: '22px', color: '#4169E1' }}><FontAwesomeIcon icon={faEdit} style={{ fontSize: '0.65rem' }} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item._id, item.type); }} className="icon-button" title="Delete" style={{ width: '22px', height: '22px', color: '#FCA5A5' }}><FontAwesomeIcon icon={faTrash} style={{ fontSize: '0.65rem' }} /></button>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0', lineHeight: 1.25 }}>{item.title}</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                            <div className="target-tag" style={{ fontSize: '0.55rem', padding: '2px 6px', fontWeight: 700 }}>
                                <FontAwesomeIcon icon={getTargetIcon(item.target)} style={{ fontSize: '0.55rem' }} /> {item.target?.toUpperCase() || 'GENERAL'}
                            </div>
                            {status && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6rem', fontWeight: 900, color: status.color, background: `${status.color}10`, padding: '2px 6px', borderRadius: '4px' }}>
                                    <FontAwesomeIcon icon={faHourglassHalf} style={{ fontSize: '0.55rem' }} /> {status.label} • {status.sub}
                                </div>
                            )}
                        </div>
                    </div>

                    {item.type === 'event' && (
                        <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}><FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '6px', color: '#8B5CF6', width: '12px' }} /> {item.location}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}><FontAwesomeIcon icon={faClock} style={{ marginRight: '6px', color: '#8B5CF6', width: '12px' }} /> {item.date} {item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : item.startTime ? item.startTime : 'Time TBA'}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FontAwesomeIcon icon={faUsers} style={{ color: '#8B5CF6', width: '12px' }} />
                                <span style={{ color: '#8B5CF6' }}>{item.capacityTaken || 0} / {item.capacityTotal || 0}</span>
                                <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>Participants Registered</span>
                            </div>
                        </div>
                    )}

                    <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, margin: 0, minHeight: '30px' }}>{item.content || item.description}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', marginTop: 'auto' }}>
                        <span style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>VERIFIED BROADCAST • {new Date(item.createdAt).toLocaleDateString()}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                            <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '0.75rem' }} />
                        </div>
                    </div>
                </div>
                </div>
            );
            })}
        </div>
      )}

      {/* EVENT DETAIL MODAL */}
      {isDetailModalOpen && selectedEvent && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div className="report-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem', borderRadius: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{selectedEvent.title}</h2>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B5CF6', background: '#F5F3FF', padding: '4px 10px', borderRadius: '6px' }}>EVENT INTEL</span>
                </div>
                <button onClick={() => { setIsDetailModalOpen(false); setSelectedEvent(null); }} className="icon-button"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Logistics & Schedule</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}><FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '8px', color: '#8B5CF6' }} /> {selectedEvent.location}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}><FontAwesomeIcon icon={faClock} style={{ marginRight: '8px', color: '#8B5CF6' }} /> {selectedEvent.date}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginLeft: '22px' }}>{selectedEvent.startTime} - {selectedEvent.endTime || 'TBA'}</div>
                    </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Registration Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%', paddingBottom: '10px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A' }}>{selectedEvent.capacityTaken || 0}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#94A3B8' }}>/ {selectedEvent.capacityTotal || 0}</div>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', marginTop: '4px' }}>
                        <div style={{ 
                            width: `${Math.min(100, ((selectedEvent.capacityTaken || 0) / (selectedEvent.capacityTotal || 1)) * 100)}%`, 
                            height: '100%', 
                            background: '#8B5CF6', 
                            borderRadius: '3px' 
                        }}></div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Intel Description</div>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6 }}>{selectedEvent.description || selectedEvent.content}</p>
                {selectedEvent.note && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '10px', fontSize: '0.85rem', color: '#92400E' }}>
                        <strong>Note:</strong> {selectedEvent.note}
                    </div>
                )}
            </div>

            <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Registered Residents</span>
                    <span>{selectedEvent.registrations?.length || 0} Records</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedEvent.registrations && selectedEvent.registrations.length > 0 ? (
                        selectedEvent.registrations.map((reg, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>{reg.fullName}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{reg.mobileNumber} • {reg.age} yrs old</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8' }}>{new Date(reg.registeredAt).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981' }}>VERIFIED</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: '16px', border: '2px dashed #E2E8F0' }}>
                            <FontAwesomeIcon icon={faUsers} style={{ fontSize: '1.5rem', color: '#CBD5E1', marginBottom: '0.5rem' }} />
                            <p style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>No residents registered yet.</p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '12px' }}>
                <button className="button" style={{ flex: 1, background: '#F1F5F9', color: '#64748B' }} onClick={() => setIsDetailModalOpen(false)}>CLOSE INTEL</button>
                <button className="button button--primary" style={{ flex: 1, background: '#8B5CF6' }} onClick={() => { setIsDetailModalOpen(false); handleEdit(selectedEvent); }}>MODIFY EVENT</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div className="report-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{isEditing ? 'Modify Intel' : 'Launch New Broadcast'}</h2>
                <button onClick={() => { resetForm(); setIsModalOpen(false); }} className="icon-button"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', padding: '4px', background: '#F1F5F9', borderRadius: '12px' }}>
                <button onClick={() => setPostType('announcement')} disabled={isEditing} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.7rem', cursor: isEditing ? 'not-allowed' : 'pointer', background: postType === 'announcement' ? 'white' : 'transparent', color: postType === 'announcement' ? '#4169E1' : '#64748B' }}>ANNOUNCEMENT</button>
                <button onClick={() => setPostType('event')} disabled={isEditing} style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.75rem', cursor: isEditing ? 'not-allowed' : 'pointer', background: postType === 'event' ? 'white' : 'transparent', color: postType === 'event' ? '#8B5CF6' : '#64748B' }}>ACTION EVENT</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <input placeholder="Headline" value={formData.title} required style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: 600 }} onChange={e => setFormData({...formData, title: e.target.value})} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <select value={formData.target} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: 700, color: '#475569', fontSize: '0.75rem' }} onChange={e => setFormData({...formData, target: e.target.value})}>
                      <option value="All Residents">General Residents</option>
                      <option value="Infants & Children">Children / Pediatric</option>
                      <option value="Pregnant Women">Pregnant Patients</option>
                      <option value="Senior Citizens">Senior Citizens</option>
                      <option value="Health Alert">Health Alert</option>
                      <option value="News / Public Notice">News / Public Notice</option>
                      <option value="Event">Event</option>
                  </select>
                  <select value={formData.priority} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: 700, color: '#475569', fontSize: '0.75rem' }} onChange={e => setFormData({...formData, priority: e.target.value})}>
                      <option value="Low">Standard Info</option>
                      <option value="Medium">Important Update</option>
                      <option value="High">Urgent / Emergency</option>
                  </select>
              </div>
              {postType === 'event' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input type="date" value={formData.date} required style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }} onChange={e => setFormData({...formData, date: e.target.value})} />
                      <input type="time" value={formData.startTime} placeholder="Start Time" style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                      <input type="time" value={formData.endTime} placeholder="End Time" style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                      <input placeholder="Logistics Venue" value={formData.location} required style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }} onChange={e => setFormData({...formData, location: e.target.value})} />
                      <input type="number" placeholder="Total Capacity" value={formData.capacityTotal} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }} onChange={e => setFormData({...formData, capacityTotal: parseInt(e.target.value) || 0})} />
                      <input type="number" placeholder="Taken" value={formData.capacityTaken} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }} onChange={e => setFormData({...formData, capacityTaken: parseInt(e.target.value) || 0})} />
                  </div>
              )}
              <textarea placeholder="Instruction details..." value={formData.content} required style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', minHeight: '120px', outline: 'none', fontSize: '0.875rem', lineHeight: 1.6 }} onChange={e => setFormData({...formData, content: e.target.value})} />
              <textarea placeholder="Optional Note..." value={formData.note || ''} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', minHeight: '60px', outline: 'none', fontSize: '0.875rem', lineHeight: 1.6 }} onChange={e => setFormData({...formData, note: e.target.value})} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" id="pinPost" checked={formData.isPinned} onChange={e => setFormData({...formData, isPinned: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  <label htmlFor="pinPost" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Pin this intel to the top of the feed</label>
              </div>
              <button type="submit" className="button button--primary" style={{ width: '100%' }}>
                {isEditing ? 'COMMIT UPDATES' : 'PUBLISH INTEL'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
