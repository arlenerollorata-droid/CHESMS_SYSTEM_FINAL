import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faPlus, faUser,
  faQrcode, faTimes, faUserCheck, faIdCard,
  faHistory, faSync, faVideo,
  faCalendarCheck, faClock, faEdit, faTrash, faDownload, faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { Html5Qrcode } from "html5-qrcode";
import toast, { Toaster } from 'react-hot-toast';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [patients, setPatients] = useState([]);
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scannedPatient, setScannedPatient] = useState(null);
  const [scannerInstance, setScannerInstance] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  const [formData, setFormData] = useState({
    patient: "",
    event: "",
    remarks: "",
    status: "Present"
  });

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await axios.get("https://chesmssystemfinal-production.up.railway.app/api/attendance");
      const seen = new Set()
      const deduped = res.data.filter(a => {
        if (seen.has(a._id)) return false
        seen.add(a._id)
        return true
      })
      setAttendance(deduped);
    } catch (err) { console.error(err); }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const [pRes, eRes] = await Promise.all([
        axios.get("https://chesmssystemfinal-production.up.railway.app/api/patients"),
        axios.get("https://chesmssystemfinal-production.up.railway.app/api/events")
      ]);
      setPatients(pRes.data);
      setEvents(eRes.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchAttendance();
    fetchInitialData();
  }, [fetchAttendance, fetchInitialData]);

  const onScanSuccess = useCallback(async (decodedText) => {
    try {
      if (scannerInstance) scannerInstance.pause();
      
      const res = await axios.get(`https://chesmssystemfinal-production.up.railway.app/api/patients`);
      const patient = res.data.find(p => p._id === decodedText || p._id.slice(-6).toUpperCase() === decodedText.toUpperCase());
      
      if (patient) {
        setScannedPatient(patient);
        setFormData(prev => ({ ...prev, patient: patient._id }));
        toast.success("Patient found!");
      } else {
        toast.error("Not Found: Patient ID not recognized.");
        if (scannerInstance) scannerInstance.resume();
      }
    } catch (err) { 
        console.error(err); 
        toast.error("Error scanning code.");
        if (scannerInstance) scannerInstance.resume();
    }
  }, [scannerInstance]);

  useEffect(() => {
    if (isScannerOpen && !scannerInstance) {
      const html5QrCode = new Html5Qrcode("reader");
      setScannerInstance(html5QrCode);
      
      const qrConfig = { fps: 15, qrbox: { width: 220, height: 220 } };
      
      html5QrCode.start(
        { facingMode: "environment" }, 
        qrConfig,
        onScanSuccess
      ).catch(err => console.error("Scanner error:", err));
    }

    return () => {
      if (scannerInstance && !isScannerOpen) {
        scannerInstance.stop().then(() => {
            scannerInstance.clear();
            setScannerInstance(null);
        }).catch(err => console.log("Stop error", err));
      }
    };
  }, [isScannerOpen, scannerInstance, onScanSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://chesmssystemfinal-production.up.railway.app/api/attendance/mark", formData);
      toast.success("Attendance marked successfully!");
      fetchAttendance();
      setIsModalOpen(false);
      setIsScannerOpen(false);
      setScannedPatient(null);
      setFormData({ patient: "", event: "", remarks: "", status: "Present" });
    } catch (err) { 
      toast.error(err.response?.data?.message || "Failed to mark attendance.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://chesmssystemfinal-production.up.railway.app/api/attendance/${editingRecord._id}`, {
        status: formData.status,
        remarks: formData.remarks
      });
      toast.success("Attendance updated successfully!");
      fetchAttendance();
      setIsEditModalOpen(false);
      setEditingRecord(null);
      setFormData({ patient: "", event: "", remarks: "", status: "Present" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update attendance.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await axios.delete(`https://chesmssystemfinal-production.up.railway.app/api/attendance/${id}`);
        toast.success("Attendance record deleted.");
        fetchAttendance();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete attendance.");
      }
    }
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setFormData({
      patient: record.patient?._id || "",
      event: record.event?._id || "",
      remarks: record.remarks || "",
      status: record.status || "Present"
    });
    setIsEditModalOpen(true);
  };

  const filtered = useMemo(() =>
    attendance.filter(a => 
      a.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.event?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [attendance, searchTerm]
  );

  const stats = useMemo(() => [
    { label: "Scanned Today", value: attendance.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length, icon: faCalendarCheck, color: "#10B981" },
    { label: "Total Visits", value: attendance.length, icon: faHistory, color: "#4169E1" }
  ], [attendance]);

  const handleExport = async () => {
    if (filtered.length === 0) return
    setExporting(true)
    try {
      const rows = filtered.map(a => [
        a.patient?.name || '',
        a.event?.title || '',
        new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        a.status || '',
        new Date(a.date).toLocaleDateString()
      ])
      const headers = ['Resident Name', 'Health Event', 'Check-In Time', 'Status', 'Date Created']
      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\r\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const today = new Date().toISOString().split('T')[0]
      link.download = `attendance-report-${today}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success(`Exported ${filtered.length} records`)
    } catch {
      toast.error('Error exporting attendance')
    } finally {
      setExporting(false)
    }
  }

  const headerActions = (
    <div className="responsive-actions">
        <button className="button button--secondary" onClick={() => setIsScannerOpen(true)} style={{ background: '#0F172A', color: 'white', border: 'none' }}>
            <FontAwesomeIcon icon={faQrcode} /> Scanner
        </button>
        <button className="button button--primary" onClick={() => { setScannedPatient(null); setIsModalOpen(true); }}>
            <FontAwesomeIcon icon={faPlus} /> Type Name
        </button>
        <button
          className="button button--secondary"
          onClick={handleExport}
          disabled={exporting || filtered.length === 0}
          style={{
            background: filtered.length === 0 ? '#E2E8F0' : '#059669',
            color: filtered.length === 0 ? '#94A3B8' : 'white',
            border: 'none',
            cursor: filtered.length === 0 || exporting ? 'not-allowed' : 'pointer',
            opacity: filtered.length === 0 ? 0.6 : 1
          }}
        >
          <FontAwesomeIcon icon={exporting ? faSpinner : faDownload} spin={exporting} /> {exporting ? 'Exporting...' : 'Export'}
        </button>
    </div>
  );

  return (
    <Layout 
      title="Attendance" 
      subtitle="Check who is present for health events using QR codes"
      actions={headerActions}
    >
      <Toaster position="top-right" />
      <style>{`
        .responsive-actions { display: flex; gap: 0.75rem; }
        .attendance-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .scanner-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 2.5rem; }
        @media (min-width: 992px) { .scanner-layout { grid-template-columns: 380px 1fr; } }

        .scanner-box { background: #0F172A; border-radius: 28px; padding: 1.5rem; position: relative; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); overflow: hidden; }
        .scanner-viewport { position: relative; width: 100%; height: 280px; border-radius: 20px; overflow: hidden; border: 2px solid #334155; }
        .scanner-laser { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: #4169E1; box-shadow: 0 0 15px #4169E1; z-index: 10; animation: scan-move 2s infinite ease-in-out; }
        .corner { position: absolute; width: 24px; height: 24px; border: 3px solid #4169E1; z-index: 11; }
        .corner-tl { top: 20px; left: 20px; border-right: 0; border-bottom: 0; }
        .corner-tr { top: 20px; right: 20px; border-left: 0; border-bottom: 0; }
        .corner-bl { bottom: 20px; left: 20px; border-right: 0; border-top: 0; }
        .corner-br { bottom: 20px; right: 20px; border-left: 0; border-top: 0; }

        .log-section { background: white; border-radius: 20px; border: 1px solid #E2E8F0; overflow: hidden; }
        .scrollable-table { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }

        @keyframes scan-move {
            0% { top: 10%; }
            50% { top: 90%; }
            100% { top: 10%; }
        }
      `}</style>

      {/* Summary Stats */}
      <div className="attendance-stats animate-fade-in">
        {stats.map((stat, i) => (
          <div key={i} className="report-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.25rem' }}>
              <FontAwesomeIcon icon={stat.icon} style={{ margin: 'auto' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{stat.value}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
      
      {isScannerOpen && (
          <div className="scanner-layout animate-fade-in">
              {/* Professional Scanner Frame */}
              <div className="scanner-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', color: 'white' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#4169E1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FontAwesomeIcon icon={faVideo} className="status-pulse" /> SCANNER ACTIVE
                      </span>
                      <button onClick={() => { setIsScannerOpen(false); setScannedPatient(null); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%' }}><FontAwesomeIcon icon={faTimes} size="sm" /></button>
                  </div>

                  <div className="scanner-viewport">
                      <div id="reader" style={{ width: '100%', height: '100%' }}></div>
                      {!scannedPatient && <div className="scanner-laser"></div>}
                      <div className="corner corner-tl"></div>
                      <div className="corner corner-tr"></div>
                      <div className="corner corner-bl"></div>
                      <div className="corner corner-br"></div>
                  </div>

                  <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#64748B' }}>
                      <p style={{ fontSize: '0.65rem', fontWeight: 800, margin: 0 }}>POINT CAMERA AT QR CODE</p>
                  </div>
              </div>

              {/* Verified Information Panel */}
              <div style={{ flex: 1 }}>
                  {scannedPatient ? (
                      <div className="report-card animate-fade-in" style={{ height: '100%', border: '2px solid #10B981', padding: '2rem', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '28px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                  <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)' }}>
                                      <FontAwesomeIcon icon={faUserCheck} />
                                  </div>
                                  <div>
                                      <h4 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900 }}>{scannedPatient.name}</h4>
                                      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#10B981' }}>IDENTITY VERIFIED</span>
                                  </div>
                              </div>
                              <button className="icon-button" style={{ background: '#F1F5F9' }} onClick={() => { setScannedPatient(null); if(scannerInstance) scannerInstance.resume(); }}><FontAwesomeIcon icon={faSync} /></button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 800, display: 'block', marginBottom: '4px' }}>AGE & GENDER</span>
                                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>{scannedPatient.age}y • {scannedPatient.gender}</span>
                              </div>
                              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 800, display: 'block', marginBottom: '4px' }}>CONTACT</span>
                                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>{scannedPatient.contact}</span>
                              </div>
                          </div>

                          <form onSubmit={handleSubmit} style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div>
                                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>SELECT HEALTH EVENT</label>
                                  <select required style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '2px solid #BAE6FD', outline: 'none', background: '#F0F9FF', fontWeight: 800 }} onChange={e => setFormData({...formData, event: e.target.value})}>
                                      <option value="">Choose the event...</option>
                                      {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                                  </select>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                  <div style={{ flex: 1, minWidth: '120px' }}>
                                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>STATUS</label>
                                      <select style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: 800 }} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                          <option value="Present">Present</option>
                                          <option value="Absent">Absent</option>
                                      </select>
                                  </div>
                                  <button type="submit" className="button button--primary" style={{ height: '54px', padding: '0 2.5rem', fontSize: '1rem', alignSelf: 'flex-end', flex: 2 }}>CONFIRM PRESENCE</button>
                              </div>
                          </form>
                      </div>
                  ) : (
                      <div style={{ height: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #CBD5E1', borderRadius: '28px', background: '#F8FAFC', padding: '2rem' }}>
                          <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                              <FontAwesomeIcon icon={faIdCard} size="4x" style={{ marginBottom: '1.5rem', opacity: 0.15 }} />
                              <p style={{ fontWeight: 900, fontSize: '1rem', color: '#64748B' }}>AWAITING QR SCAN...</p>
                              <p style={{ fontSize: '0.8125rem', maxWidth: '240px' }}>Hold the resident's ID code in front of the camera to verify.</p>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Logs Table */}
      <section className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900 }}>
                <FontAwesomeIcon icon={faHistory} style={{ color: '#4169E1', marginRight: '10px' }} /> 
                Recent Attendance
            </h3>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
                <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.875rem' }} placeholder="Search name or event..." onChange={e => setSearchTerm(e.target.value)} />
            </div>
        </div>
        
        <div className="log-section scrollable-table">
            <table className="data-table">
            <thead>
                <tr>
                <th style={{ padding: '1rem 1.5rem' }}>Resident Name</th>
                <th>Health Event</th>
                <th>Check-in Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {filtered.length > 0 ? filtered.map(a => (
                <tr key={a._id}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4169E1' }}>
                                <FontAwesomeIcon icon={faUser} size="sm" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, color: '#1E293B' }}>{a.patient?.name}</div>
                                <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 700 }}>VERIFIED</div>
                            </div>
                        </div>
                    </td>
                    <td><div style={{ fontWeight: 700, color: '#4169E1' }}>{a.event?.title}</div></td>
                    <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#475569' }}>
                            <FontAwesomeIcon icon={faClock} style={{ color: '#94A3B8', fontSize: '0.75rem' }} />
                            {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{new Date(a.date).toLocaleDateString()}</div>
                    </td>
                    <td>
                      {a.status === 'Absent' ? (
                        <span className="tag" style={{ background: '#FEE2E2', color: '#EF4444', border: '1px solid #EF4444', fontWeight: 900, padding: '4px 12px' }}>ABSENT</span>
                      ) : (
                        <span className="tag" style={{ background: '#DCFCE7', color: '#10B981', border: '1px solid #10B981', fontWeight: 900, padding: '4px 12px' }}>PRESENT</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="icon-button" onClick={() => openEditModal(a)} style={{ background: '#F1F5F9', color: '#4169E1', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }} title="Edit Record">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="icon-button" onClick={() => handleDelete(a._id)} style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }} title="Delete Record">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                </tr>
                )) : (
                    <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '4rem' }}>No attendance records found.</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </section>

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="report-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', borderRadius: '28px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: '#F1F5F9', color: '#64748B', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Manual Entry</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '2rem' }}>Record attendance without scanning a QR code.</p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>SEARCH PERSON</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 800, outline: 'none' }}
                  onChange={e => setFormData({...formData, patient: e.target.value})}
                >
                  <option value="">Select from list...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>SELECT EVENT</label>
                <select 
                  required 
                  style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 800, outline: 'none' }}
                  onChange={e => setFormData({...formData, event: e.target.value})}
                >
                  <option value="">Choose an event...</option>
                  {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>STATUS</label>
                <select 
                  style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 800, outline: 'none' }}
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>REMARKS (OPTIONAL)</label>
                <textarea placeholder="Add any notes here..." style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', minHeight: '100px', outline: 'none', fontFamily: 'inherit' }} onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </div>
              <button type="submit" className="button button--primary" style={{ height: '54px', fontSize: '1rem', boxShadow: '0 10px 15px -3px rgba(65, 105, 225, 0.3)' }}>
                  SAVE ATTENDANCE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="report-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', borderRadius: '28px', position: 'relative' }}>
            <button onClick={() => { setIsEditModalOpen(false); setEditingRecord(null); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: '#F1F5F9', color: '#64748B', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Edit Attendance</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '2rem' }}>Update status and remarks for {editingRecord?.patient?.name}</p>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>STATUS</label>
                <select 
                  style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 800, outline: 'none' }}
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>REMARKS</label>
                <textarea value={formData.remarks} placeholder="Add any notes here..." style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', minHeight: '100px', outline: 'none', fontFamily: 'inherit' }} onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </div>
              <button type="submit" className="button button--primary" style={{ height: '54px', fontSize: '1rem', boxShadow: '0 10px 15px -3px rgba(65, 105, 225, 0.3)' }}>
                  UPDATE RECORD
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
