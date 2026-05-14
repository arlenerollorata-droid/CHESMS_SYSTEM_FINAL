import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch,
  faMobileAlt,
  faRefresh, faUser, faBirthdayCake, 
  faVenusMars, faIdCard, faMapMarkerAlt,
  faEnvelope, faPhone,
  faTimes, faUsers, faCalendarAlt,
  faThLarge, faList
} from "@fortawesome/free-solid-svg-icons";

const API_URL = "https://chesmssystemfinal-production.up.railway.app/api/residents";

const getGenderColor = (gender, type = 'primary') => {
  const colors = {
    primary: {
      Male: '#3B82F6',
      Female: '#EC4899',
      Other: '#6B7280'
    },
    secondary: {
      Male: '#EFF6FF',
      Female: '#FDF2F8',
      Other: '#F3F4F6'
    },
    dark: {
      Male: '#1E40AF',
      Female: '#BE185D',
      Other: '#374151'
    },
    gradient: {
      Male: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
      Female: 'linear-gradient(135deg, #EC4899, #BE185D)',
      Other: 'linear-gradient(135deg, #6B7280, #374151)'
    },
    gradientLight: {
      Male: 'linear-gradient(to right, #EFF6FF, white)',
      Female: 'linear-gradient(to right, #FDF2F8, white)',
      Other: 'linear-gradient(to right, #F9FAFB, white)'
    },
    hoverBorder: {
      Male: '#BFDBFE',
      Female: '#FBCFE8',
      Other: '#D1D5DB'
    },
    hoverShadow: {
      Male: 'rgba(59, 130, 246, 0.15)',
      Female: 'rgba(236, 72, 153, 0.15)',
      Other: 'rgba(0,0,0,0.1)'
    },
    avatarShadow: {
      Male: 'rgba(59, 130, 246, 0.3)',
      Female: 'rgba(236, 72, 153, 0.3)',
      Other: 'rgba(0,0,0,0.2)'
    }
  };
  return colors[type][gender] || colors[type].Other;
};

export default function Residents() {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [filterPurok, setFilterPurok] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setResidents(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const stats = useMemo(() => {
    const total = residents.length;
    const male = residents.filter(r => r.gender === "Male").length;
    const female = residents.filter(r => r.gender === "Female").length;
    
    return { total, male, female };
  }, [residents]);

  const filteredAndSorted = residents
    .filter(r => {
      const fullName = `${r.firstName || ''} ${r.lastName || ''}`.trim();
      const searchStr = (fullName + (r.username || "") + (r.residentId || "")).toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesPurok = filterPurok === "all" || r.purok === filterPurok;
      return matchesSearch && matchesPurok;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "az") return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
      if (sortBy === "za") return (b.firstName + b.lastName).localeCompare(a.firstName + a.lastName);
      return 0;
    });

  const puroks = ["all", ...new Set(residents.map(r => r.purok).filter(Boolean))].sort();

  const StatCard = ({ icon, label, value, color }) => (
    <div style={{ 
      background: 'white', 
      padding: '1.25rem', 
      borderRadius: '16px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flex: 1,
      minWidth: '220px',
      border: '1px solid #F3F4F6'
    }}>
      <div style={{ 
        width: '44px', height: '44px', borderRadius: '12px', 
        background: `${color}10`, color: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'
      }}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>{value}</div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>{label}</div>
      </div>
    </div>
  );

  return (
    <Layout 
      title="App Registrations" 
      subtitle="Account lifecycle and demographic overview"
    >
      {/* Quick Stats Dashboard */}
      <section style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem', 
        flexWrap: 'wrap' 
      }} className="animate-fade-in">
        <StatCard icon={faUsers} label="Total Users" value={stats.total} color="#3B82F6" />
        <StatCard icon={faVenusMars} label="Male Users" value={stats.male} color="#3B82F6" />
        <StatCard icon={faVenusMars} label="Female Users" value={stats.female} color="#EC4899" />
      </section>

      {/* Search & Filter Bar */}
      <section style={{ marginBottom: '1.5rem' }} className="animate-fade-in">
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          border: '1px solid #F3F4F6'
        }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 2, minWidth: '280px' }}>
              <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                style={{ 
                  width: '100%', 
                  padding: '0.875rem 1.25rem 0.875rem 3.25rem', 
                  borderRadius: '12px', 
                  border: '1.5px solid #E5E7EB', 
                  outline: 'none', 
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s',
                  background: '#F9FAFB'
                }}
                placeholder="Search by name, username, or resident ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.background = '#F9FAFB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1.5, minWidth: '400px' }}>
              <select 
                value={filterPurok}
                onChange={(e) => setFilterPurok(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #E5E7EB',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  background: '#F9FAFB'
                }}
              >
                <option value="all">All Puroks</option>
                {puroks.filter(p => p !== 'all').map(p => (
                  <option key={p} value={p}>Purok {p}</option>
                ))}
              </select>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #E5E7EB',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  background: '#F9FAFB'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>

              {/* View Toggle */}
              <div style={{ display: 'flex', background: '#F3F4F6', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                <button 
                  onClick={() => setViewMode('grid')}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: 'none',
                    background: viewMode === 'grid' ? 'white' : 'transparent',
                    color: viewMode === 'grid' ? '#3B82F6' : '#64748B',
                    boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Grid View"
                >
                  <FontAwesomeIcon icon={faThLarge} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: 'none',
                    background: viewMode === 'list' ? 'white' : 'transparent',
                    color: viewMode === 'list' ? '#3B82F6' : '#64748B',
                    boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="List View"
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#6B7280', fontWeight: 500 }}>
            Showing <span style={{ color: '#3B82F6', fontWeight: 600 }}>{filteredAndSorted.length}</span> user accounts
          </div>
        </div>
      </section>

      {/* Content Rendering */}
      {filteredAndSorted.length > 0 ? (
        viewMode === 'grid' ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
            gap: '1.5rem',
            paddingBottom: '2rem'
          }} className="animate-fade-in">
            {filteredAndSorted.map((r) => (
              <div 
                key={r._id} 
                style={{ 
                  background: 'white',
                  borderRadius: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  border: '1px solid #F3F4F6',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = getGenderColor(r.gender, 'hoverBorder');
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 20px -8px ${getGenderColor(r.gender, 'hoverShadow')}`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#F3F4F6';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                }}
                onClick={() => setSelectedResident(r)}
              >
                {/* Card Header */}
                <div style={{ 
                  padding: '1.25rem',
                  borderBottom: '1px solid #F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: getGenderColor(r.gender, 'gradientLight')
                }}>
                  <div style={{ 
                    width: '52px', 
                    height: '52px', 
                    borderRadius: '14px', 
                    background: getGenderColor(r.gender, 'gradient'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 4px 10px ${getGenderColor(r.gender, 'avatarShadow')}`
                  }}>
                    {r.profileImage ? (
                      <img src={r.profileImage} alt={r.firstName} style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                        {(r.firstName || '?').charAt(0)}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>
                      {`${r.firstName || ''} ${r.lastName || ''}`.trim()}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.8125rem', color: getGenderColor(r.gender, 'primary'), fontWeight: 600 }}>
                        {r.username || r.residentId}
                      </span>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#D1D5DB' }}></span>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Number</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>{r.residentId || '---'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Purok</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{r.purok ? `Purok ${r.purok}` : '---'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{r.gender || '---'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{r.age ? `${r.age} yrs` : '---'}</div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    marginTop: '1.25rem', 
                    paddingTop: '1rem', 
                    borderTop: '1px solid #F3F4F6',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                  }}>
                    <button 
                      style={{
                        background: 'transparent',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#4B5563',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #F3F4F6', overflow: 'hidden' }} className="animate-fade-in">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>User Account</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Resident ID</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Purok</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Gender/Age</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Reg. Date</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSorted.map((r) => (
                    <tr 
                      key={r._id} 
                      onClick={() => setSelectedResident(r)}
                      style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '40px', height: '40px', borderRadius: '10px', 
                            background: getGenderColor(r.gender, 'gradient'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '1rem',
                            boxShadow: `0 2px 4px ${getGenderColor(r.gender, 'avatarShadow')}`
                          }}>
                            {(r.firstName || '?').charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>{`${r.firstName} ${r.lastName}`}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{r.username || 'No username'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#475569', fontWeight: 600, fontFamily: 'monospace' }}>{r.residentId}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#475569' }}>Purok {r.purok}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>{r.gender}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{r.age} years old</div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#475569' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button style={{ background: '#F1F5F9', border: 'none', color: '#64748B', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }}>
                          <FontAwesomeIcon icon={faUser} fontSize="0.75rem" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ 
            background: 'white',
            borderRadius: '20px',
            padding: '4rem 3rem',
            display: 'inline-block',
            border: '1px dashed #D1D5DB',
            maxWidth: '400px'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: '#F3F4F6', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#9CA3AF'
            }}>
              <FontAwesomeIcon icon={faMobileAlt} size="2x" />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#374151', margin: '0 0 8px 0' }}>
              {searchTerm || filterPurok !== 'all' ? 'No matches found' : 'No Registrations Yet'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
              {searchTerm || filterPurok !== 'all'
                ? 'Try adjusting your search terms or filters to find what you are looking for.' 
                : 'New user accounts registered through the mobile app will automatically appear here.'}
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedResident && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedResident(null)}
        >
          <div 
            style={{ 
              background: 'white',
              borderRadius: '20px',
              width: '100%', 
              maxWidth: '480px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '1.5rem',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: getGenderColor(selectedResident.gender, 'gradientLight')
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FontAwesomeIcon icon={faUser} style={{ color: getGenderColor(selectedResident.gender, 'primary') }} />
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>User Profile Details</h2>
              </div>
              <button 
                onClick={() => setSelectedResident(null)}
                style={{
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  color: '#6B7280',
                  transition: 'all 0.2s'
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              {/* Profile Card */}
              <div style={{ 
                background: getGenderColor(selectedResident.gender, 'secondary'),
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
                border: `1px solid ${getGenderColor(selectedResident.gender, 'hoverBorder')}`
              }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '20px', 
                  margin: '0 auto 1rem',
                  background: getGenderColor(selectedResident.gender, 'gradient'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: `0 8px 16px ${getGenderColor(selectedResident.gender, 'avatarShadow')}`,
                  border: '3px solid white'
                }}>
                  {selectedResident.profileImage ? (
                    <img src={selectedResident.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>
                      {(selectedResident.firstName || '?').charAt(0)}
                    </span>
                  )}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                  {`${selectedResident.firstName} ${selectedResident.lastName}`}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: getGenderColor(selectedResident.gender, 'primary'), fontWeight: 600 }}>
                  {selectedResident.username || selectedResident.residentId}
                </p>
              </div>

              {/* Data Sections */}
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Personal Information */}
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faIdCard} /> Identity Information
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { label: 'Resident ID', value: selectedResident.residentId },
                      { label: 'Middle Name', value: selectedResident.middleName },
                      { label: 'Gender', value: selectedResident.gender },
                      { label: 'Civil Status', value: selectedResident.civilStatus },
                      { label: 'Birthdate', value: selectedResident.birthdate ? new Date(selectedResident.birthdate).toLocaleDateString() : '' },
                      { label: 'Age', value: selectedResident.age ? `${selectedResident.age} years old` : '' },
                    ].map((item, idx) => (
                      <div key={idx} style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '0.625rem', color: '#94A3B8', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase' }}>{item.label}</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>{item.value || '---'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faPhone} /> Contact Information
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', border: '1px solid #E2E8F0' }}>
                        <FontAwesomeIcon icon={faEnvelope} fontSize="0.75rem" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.625rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Email</div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedResident.email || 'None'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', border: '1px solid #E2E8F0' }}>
                        <FontAwesomeIcon icon={faPhone} fontSize="0.75rem" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.625rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Phone</div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>{selectedResident.contactNumber || 'None'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> Location Information
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { label: 'Region', value: selectedResident.region },
                      { label: 'Province', value: selectedResident.province },
                      { label: 'Municipality', value: selectedResident.municipality },
                      { label: 'Barangay', value: selectedResident.barangay },
                      { label: 'Purok / Sitio', value: selectedResident.purok },
                      { label: 'Postal Code', value: selectedResident.postalCode },
                    ].map((item, idx) => (
                      <div key={idx} style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '0.625rem', color: '#94A3B8', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase' }}>{item.label}</div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>{item.value || '---'}</div>
                      </div>
                    ))}
                    <div style={{ gridColumn: 'span 2', background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '0.625rem', color: '#94A3B8', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase' }}>Street Address / House No.</div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>{selectedResident.streetAddress || '---'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
