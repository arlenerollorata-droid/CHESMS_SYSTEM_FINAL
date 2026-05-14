import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarCheck, faUser, faSyringe, 
  faStethoscope, faTimes, 
  faSearch, faUserCircle,
  faCalendarPlus, faCheckCircle, faBaby, faHandSparkles, 
  faExclamationTriangle, faMapMarkerAlt, faUserMd, faSync, 
  faCheckDouble, faIdCard, faClock, 
  faChevronRight, faEraser, faSms, faBiohazard, faAppleAlt, faInfoCircle, faCapsules, faHeartbeat
} from "@fortawesome/free-solid-svg-icons";

const API_URL = "http://localhost:5000/api/schedules";

// Master data for Programs and Services
const PROGRAM_CATALOG = {
  "Maternal & Child": {
    color: "#8B5CF6", bg: "#F5F3FF", icon: faStethoscope,
    cases: {
      "Prenatal": ["1st Trimester Check-up", "2nd Trimester Check-up", "3rd Trimester Check-up", "Final Term Monitoring"],
      "Post-Natal": ["1-Week Post-Delivery", "6-Week Post-Delivery", "Breastfeeding Consultation"],
      "Immunization": ["BCG & HepB (Birth)", "Penta 1 / OPV 1 / PCV 1", "Penta 2 / OPV 2 / PCV 2", "Penta 3 / OPV 3 / PCV 3", "Measles (MCV 1)", "MMR (MCV 2)"],
      "Nutrition": ["Baseline Weighing", "Weekly Growth Tracking", "Monthly Assessment"]
    }
  },
  "Chronic & Infectious": {
    color: "#EF4444", bg: "#FEF2F2", icon: faHeartbeat,
    cases: {
      "NCD (Hypertension/Diabetes)": ["Vitals Monitoring", "Maintenance Refill", "Quarterly Assessment"],
      "TB DOTS": ["Intensive Phase Follow-up", "Continuation Phase", "Sputum Collection"]
    }
  },
  "General Services": {
    color: "#64748B", bg: "#F1F5F9", icon: faCalendarCheck,
    cases: {
      "Routine": ["General Consultation", "Follow-up Visit", "Physical Exam"],
      "Dental": ["Tooth Extraction", "Check-up", "Cleaning"],
      "Medical Certificate": ["Work/School Clearance", "Health Declaration"]
    }
  }
};

const initialFormState = {
  patientId: "", 
  patientModel: "Patient",
  patientName: "",
  programCategory: "General Services",
  scheduleType: "Routine", 
  service: "General Consultation", 
  urgency: "Normal",
  location: "Health Center",
  assignedStaff: "",
  date: new Date().toISOString().split('T')[0], 
  timeSlot: "08:00 AM - 10:00 AM",
  notes: "",
  autoGenerateProtocol: false
};

export default function Appointments() {
  const [schedules, setSchedules] = useState([]);
  const [patients, setPatients] = useState([]); 
  const [residents, setResidents] = useState([]); 
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProtocolLoading, setIsProtocolLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [tempProfile, setTempProfile] = useState(null);
  const submittingRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const [schedRes, patRes, resRes] = await Promise.all([
        axios.get(API_URL),
        axios.get("http://localhost:5000/api/patients"),
        axios.get("http://localhost:5000/api/residents")
      ]);
      setSchedules(schedRes.data);
      setPatients(patRes.data);
      setResidents(resRes.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePersonClick = async (p) => {
    if (!p?._id) return;
    try {
      const res = await axios.get(`${API_URL}/patient/${p._id}`);
      setHistory(res.data);
      setSelectedPerson(p);
    } catch (err) { console.error(err); }
  };

  const getProtocolPlan = (type, startDate) => {
    if (type === 'Prenatal') {
        return [
            { service: "1st Trimester Check-up", days: 0 },
            { service: "2nd Trimester Check-up", days: 30 },
            { service: "3rd Trimester Check-up", days: 90 },
            { service: "Final Pre-delivery Scan", days: 150 },
            { service: "Estimated Delivery Date", days: 210 },
        ];
    } else if (type === 'Immunization') {
        return [
            { service: "BCG & HepB (Newborn)", days: 0 },
            { service: "Penta 1 / OPV 1 / PCV 1", days: 45 },
            { service: "Penta 2 / OPV 2 / PCV 2", days: 75 },
            { service: "Penta 3 / OPV 3 / PCV 3", days: 105 },
            { service: "Measles (MCV 1)", days: 270 },
        ];
    } else if (type === 'TB DOTS') {
        return [
            { service: "TB DOTS: Intensive Phase Week 1", days: 0 },
            { service: "TB DOTS: Progress Review", days: 30 },
            { service: "TB DOTS: Completion Phase", days: 60 },
        ];
    }
    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current || submitting) return;
    submittingRef.current = true;
    setSubmitting(true);
    if (!formData.patientId) { submittingRef.current = false; setSubmitting(false); return alert("Select a person first."); }
    
    try {
      const payloadBase = {
        patient: formData.patientId,
        patientModel: formData.patientModel || 'Patient',
        patientName: formData.patientName,
        category: formData.programCategory,
        scheduleType: formData.scheduleType,
        service: formData.service,
        date: formData.date,
        time: formData.timeSlot,
        urgency: formData.urgency,
        location: formData.location,
        notes: formData.notes
      };

      if (formData.autoGenerateProtocol) {
        setIsProtocolLoading(true);
        const plan = getProtocolPlan(formData.scheduleType, formData.date);
        for (let item of plan) {
            const d = new Date(formData.date); d.setDate(d.getDate() + item.days);
            await axios.post(API_URL, { ...payloadBase, service: item.service, focus: item.service, date: d.toISOString().split('T')[0] });
        }
        setIsProtocolLoading(false);
      } else {
        await axios.post(API_URL, payloadBase);
      }
      
      submittingRef.current = false;
      setSubmitting(false);
      fetchData();
      setIsAddModalOpen(false);
      setFormData(initialFormState);
      setSearchQuery("");
      setTempProfile(null);
    } catch (err) { submittingRef.current = false; setSubmitting(false); alert("Error saving appointment."); }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Confirmed' ? 'Pending' : 'Confirmed';
    try {
      await axios.patch(`${API_URL}/${id}/status`, { status: newStatus });
      fetchData();
      if (selectedPerson) handlePersonClick(selectedPerson);
    } catch (err) { fetchData(); console.error(err); }
  };

  const getTypeStyles = (type) => {
    for (let cat in PROGRAM_CATALOG) {
        if (PROGRAM_CATALOG[cat].cases[type]) return PROGRAM_CATALOG[cat];
    }
    return { color: '#64748B', bg: '#F1F5F9', icon: faCalendarCheck };
  };

  const directory = [
    ...patients.map(p => ({ _id: p._id, name: p.name, type: 'Patient', sub: p.patientId, age: p.age })),
    ...residents.map(r => ({ _id: r._id, name: `${r.firstName} ${r.lastName}`, type: 'Resident', sub: r.residentId, age: r.age }))
  ];

  const filteredDir = directory.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.sub?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Active Category Data with Safety Fallback
  const activeCat = PROGRAM_CATALOG[formData.programCategory] || PROGRAM_CATALOG["General Services"];

  return (
    <Layout title="Health Scheduler" subtitle="Smart Program Selection & Multi-Protocol Mapping">
      <style>{`
        .glass-sheet { background: white; border-radius: 24px; border: 1px solid #E2E8F0; box-shadow: var(--shadow-sm); overflow: hidden; }
        .input-box { display: flex; flex-direction: column; gap: 5px; }
        .input-box label { font-size: 0.65rem; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }
        .input-box input, .input-box select, .input-box textarea { padding: 0.9rem; border-radius: 12px; border: 1px solid #E2E8F0; background: #F8FAFC; font-size: 0.9rem; font-weight: 600; outline: none; transition: 0.2s; }
        .input-box input:focus { border-color: #4169E1; background: white; box-shadow: 0 0 0 4px rgba(65, 105, 225, 0.1); }

        .search-popover { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #E2E8F0; border-radius: 15px; z-index: 100; max-height: 200px; overflow-y: auto; box-shadow: var(--shadow-lg); }
        .search-row { padding: 10px 15px; cursor: pointer; display: flex; justify-content: space-between; border-bottom: 1px solid #F1F5F9; }
        .search-row:hover { background: #EEF2FF; }

        .program-info-strip { padding: 1.25rem; border-radius: 18px; display: flex; gap: 15px; align-items: center; margin-bottom: 1.5rem; transition: all 0.3s; }
        .preview-pane { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 15px; padding: 1.25rem; margin-top: 1rem; }
      `}</style>

      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-sheet" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FontAwesomeIcon icon={faSearch} color="#94A3B8" />
            <input style={{ flex: 1, border: 'none', outline: 'none', fontWeight: 600, fontSize: '1rem' }} placeholder="Quick Search Health Timelines..." onChange={e=>{
                const q = e.target.value.toLowerCase();
                if(q.length > 1){ const found = directory.find(d => d.name.toLowerCase().includes(q)); if(found) handlePersonClick(found); }
            }} />
          </div>
          <button className="button button--primary" onClick={()=>setIsAddModalOpen(true)} style={{ borderRadius: '16px', background: '#0F172A', padding: '0 2.5rem' }}>+ CREATE APPOINTMENT</button>
        </div>

        <div className="glass-sheet">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '2.5rem' }}>Resident Profile</th>
                <th>Program Category</th>
                <th>Case & Service</th>
                <th>Schedule</th>
                <th style={{ textAlign: 'right', paddingRight: '2.5rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
                        {schedules.sort((a,b)=>new Date(a.date)-new Date(b.date)).map((item) => {
                const styles = getTypeStyles(item.scheduleType);
                return (
                  <tr key={item._id} onClick={() => handlePersonClick(item.patient)} className="hover-reveal">
                    <td style={{ padding: '1rem 2.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: styles.bg, color: styles.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FontAwesomeIcon icon={styles.icon} /></div>
                        <div style={{ fontWeight: 900 }}>{item.patient?.name || item.patientName}</div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '0.7rem', fontWeight: 800, color: styles.color }}>{item.category || 'GENERAL'}</span></td>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{item.scheduleType || 'Scheduled Appointment'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>{item.service}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{new Date(item.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>{item.time || item.timeSlot}</div>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '2.5rem' }}><button className="icon-button"><FontAwesomeIcon icon={faChevronRight} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(10px)' }}>
          <div className="glass-sheet animate-fade-in" style={{ width: '95%', maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto' }}>
            
            <div style={{ background: '#0F172A', color: 'white', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h2 style={{ margin: 0, fontWeight: 950, fontSize: '1.75rem' }}>Advanced Appointment Desk</h2><p style={{ margin: 0, opacity: 0.6 }}>Logic-driven health program mapping.</p></div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} size="xl" /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '3rem' }}>
              
              {/* PERSON SELECTION */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#4169E1' }}><FontAwesomeIcon icon={faIdCard} /> 1. SEARCH RESIDENT</h4>
                <div style={{ position: 'relative' }}>
                    <div className="input-box">
                        <input style={{ width: '100%', height: '55px' }} placeholder="Type name or Resident ID..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }} onFocus={() => setShowResults(true)} />
                    </div>
                    {showResults && searchQuery.length > 0 && (
                        <div className="search-popover">
                            {filteredDir.map(d => (
                                <div key={d._id} className="search-row" onClick={() => {
                                  setFormData({...formData, patientId: d._id, patientModel: d.type, patientName: d.name});
                                    setSearchQuery(d.name);
                                    setTempProfile(d);
                                    setShowResults(false);
                                }}>
                                    <div><span style={{ fontWeight: 900 }}>{d.name}</span> <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>• {d.sub}</span></div>
                                    <FontAwesomeIcon icon={faChevronRight} color="#E2E8F0" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </div>

              {/* PROGRAM ENHANCEMENT PART */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#4169E1' }}><FontAwesomeIcon icon={faInfoCircle} /> 2. PROGRAM & CASE SELECTION</h4>
                
                <div className="program-info-strip" style={{ background: activeCat.bg, border: `1.5px solid ${activeCat.color}` }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeCat.color, fontSize: '1.5rem' }}><FontAwesomeIcon icon={activeCat.icon} /></div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: activeCat.color }}>CURRENT CATEGORY</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#0F172A' }}>{formData.programCategory}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                    <div className="input-box"><label>1. Select Category</label><select value={formData.programCategory} onChange={e => {
                        const newCat = e.target.value;
                        const firstCase = Object.keys(PROGRAM_CATALOG[newCat].cases)[0];
                        const firstService = PROGRAM_CATALOG[newCat].cases[firstCase][0];
                        setFormData({...formData, programCategory: newCat, scheduleType: firstCase, service: firstService});
                    }}>{Object.keys(PROGRAM_CATALOG).map(c=><option key={c}>{c}</option>)}</select></div>
                    
                    <div className="input-box"><label>2. Select Specific Case</label><select value={formData.scheduleType} onChange={e => {
                        const newCase = e.target.value;
                        const firstService = PROGRAM_CATALOG[formData.programCategory].cases[newCase][0];
                        setFormData({...formData, scheduleType: newCase, service: firstService});
                    }}>{Object.keys(activeCat.cases).map(c=><option key={c}>{c}</option>)}</select></div>

                    <div className="input-box"><label>3. Targeted Service</label><select value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})}>{activeCat.cases[formData.scheduleType].map(s=><option key={s}>{s}</option>)}</select></div>
                </div>
              </div>

              {/* DATE & LOGISTICS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <div className="input-box"><label>Appointment Date</label><input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                <div className="input-box"><label>Time Slot</label><select value={formData.timeSlot} onChange={e => setFormData({...formData, timeSlot: e.target.value})}><option>08:00 AM - 10:00 AM</option><option>10:00 AM - 12:00 PM</option><option>01:00 PM - 03:00 PM</option></select></div>
                <div className="input-box"><label>Location</label><select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}><option>Health Center</option><option>Home Visit</option></select></div>
              </div>

              {/* AUTOMATIC PROTOCOL */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: formData.autoGenerateProtocol ? '#EEF2FF' : 'white', padding: '1.5rem', borderRadius: '20px', border: `2px solid ${formData.autoGenerateProtocol ? '#4169E1' : '#E2E8F0'}`, cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.autoGenerateProtocol} onChange={e => setFormData({...formData, autoGenerateProtocol: e.target.checked})} style={{ width: '25px', height: '25px' }} />
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 950 }}>Initialize Multi-Visit Care Protocol</div><div style={{ fontSize: '0.75rem', color: '#64748B' }}>Auto-generate the standard sequence of follow-up visits.</div></div>
                </label>
                {formData.autoGenerateProtocol && (
                    <div className="preview-pane animate-fade-in">
                        <h5 style={{ margin: '0 0 10px 0', fontSize: '0.7rem', color: '#475569' }}>STANDARD SEQUENCE PREVIEW:</h5>
                        {getProtocolPlan(formData.scheduleType, formData.date).map((p, i) => (
                            <div key={i} style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}><FontAwesomeIcon icon={faCheckCircle} color="#10B981" /> {p.service}</div>
                        ))}
                    </div>
                )}
              </div>

              {/* FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '2rem', borderTop: '1.5px solid #F1F5F9' }}>
                <button type="button" className="button button--secondary" style={{ height: '60px', borderRadius: '16px' }} onClick={()=>setFormData(initialFormState)}><FontAwesomeIcon icon={faEraser} /> CLEAR FORM</button>
                <button type="submit" disabled={submitting || isProtocolLoading} className="button button--primary" style={{ minWidth: '220px', height: '60px', borderRadius: '16px', background: (submitting || isProtocolLoading) ? '#64748B' : '#0F172A', cursor: (submitting || isProtocolLoading) ? 'not-allowed' : 'pointer', opacity: (submitting || isProtocolLoading) ? 0.7 : 1 }}>
                    {submitting || isProtocolLoading ? <FontAwesomeIcon icon={faSync} spin /> : "FINALIZE SCHEDULE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIMELINE (Keep existing) */}
      {selectedPerson && (
        <div className="modal-overlay" style={{ zIndex: 2500 }}>
          <div className="glass-sheet animate-fade-in" style={{ width: '95%', maxWidth: '900px', height: '70vh', padding: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#0F172A', padding: '1.25rem 1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FontAwesomeIcon icon={faUserCircle} color="#4169E1" style={{ fontSize: '1.25rem' }} /> <div><h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{selectedPerson.name}</h2><p style={{ margin: 0, opacity: 0.6, fontSize: '0.7rem' }}>Health History</p></div></div>
                <button onClick={() => setSelectedPerson(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: '#F8FAFC' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                    {history.map((item) => {
                        const styles = getTypeStyles(item.scheduleType);
                        return (
                            <div key={item._id} className="glass-sheet" style={{ borderLeft: `4px solid ${styles.color}`, padding: '0.875rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: styles.bg, color: styles.color, fontSize: '0.6rem', fontWeight: 800 }}>{item.scheduleType}</span>
                                </div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 800 }}>{item.service}</h4>
                                <div style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600 }}>{new Date(item.date).toLocaleDateString()} • {item.timeSlot}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
