import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faEdit, faTrash, faTimes, faPlus, faSync, faEye,
  faMale, faFemale, faRing, faBaby, faWheelchair, faUserShield,
  faMapMarkerAlt, faHome, faUsers, faCheckCircle, faExclamationCircle,
  faGraduationCap, faBriefcase, faIdCard
} from "@fortawesome/free-solid-svg-icons";

const API_URL = "https://chesmssystemfinal-production.up.railway.app/api/residents";

const incomeOptions = [
  "No Income", "Below 5,000", "5,000 - 10,000", "10,000 - 15,000", 
  "15,000 - 20,000", "20,000 - 30,000", "30,000 - 50,000", "Above 50,000"
];

const DataRow = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>{value || ''}</span>
  </div>
);

const InputField = ({ name, label, required, type = "text", options = null, readOnly = false, value, onChange, error }) => (
  <div className="box-input">
    <label>{label} {required && <span style={{ color: '#EF4444' }}>*</span>}</label>
    {options ? (
      <select name={name} value={value || ""} onChange={onChange} style={{ borderColor: error ? '#EF4444' : '' }}>
        <option value="">-- Select --</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input 
        type={type} 
        name={name} 
        value={value || ""} 
        onChange={onChange} 
        readOnly={readOnly}
        placeholder={label}
        style={{ 
          borderColor: error ? '#EF4444' : '',
          background: readOnly ? '#F1F5F9' : '',
          width: '100%',
          boxSizing: 'border-box'
        }}
      />
    )}
    {error && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: 700 }}><FontAwesomeIcon icon={faExclamationCircle} /> {error}</span>}
  </div>
);

export default function Census() {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPurok, setFilterPurok] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formStep, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const isMobile = screenWidth <= 768;
  const adminName = localStorage.getItem("adminName") || "Administrator";

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initialFormState = {
    firstName: "", middleName: "", lastName: "", suffix: "",
    gender: "", birthdate: "", age: "", nationality: "Filipino",
    civilStatus: "Single", religion: "Roman Catholic", birthplace: "",
    occupation: "", monthlyIncome: "", contactNumber: "", email: "",
    sssNumber: "", philhealthNumber: "", pagibigNumber: "",
    voterStatus: "No", registeredVoter: "No",
    spouseFirstName: "", spouseMiddleName: "", spouseLastName: "",
    spouseBirthdate: "", spouseAge: "", spouseOccupation: "", spouseMonthlyIncome: "",
    spouseNationality: "Filipino", spouseReligion: "", 
    spouseSSS: "", spousePhilhealth: "", spousePagibig: "",
    childrenRoster: [], seniorRoster: [], pwdRoster: [],
    householdId: "",
    totalMembersInHousehold: 1, 
    isAnyMemberPWD: false, isAnyMemberSenior: false,
    housingType: "Concrete", ownershipStatus: "Owned",
    hasElectricity: true, hasWater: false,
    purok: "", barangay: "",
    municipality: "", province: "",
    region: "", postalCode: "", streetAddress: "",
    registeredBy: adminName
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => { fetchResidents(); }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setResidents(res.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    
    if (name === "birthdate") {
      const calculatedAge = calculateAge(value);
      setFormData(prev => ({ ...prev, [name]: value, age: calculatedAge }));
    } else if (name === "spouseBirthdate") {
      const calculatedAge = calculateAge(value);
      setFormData(prev => ({ ...prev, [name]: value, spouseAge: calculatedAge }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleChildChange = (index, field, value) => {
    const updated = [...(formData.childrenRoster || [])];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "childBirthdate") {
      updated[index].childAge = calculateAge(value);
    }
    setFormData(prev => ({ ...prev, childrenRoster: updated }));
  };

  const handleRosterChange = (listName, index, field, value) => {
    const updated = [...(formData[listName] || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, [listName]: updated }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      // Step 1: Personal - validate required fields
      if (!formData.firstName?.trim()) newErrors.firstName = "Required";
      if (!formData.middleName?.trim()) newErrors.middleName = "Required";
      if (!formData.lastName?.trim()) newErrors.lastName = "Required";
      if (!formData.birthdate) newErrors.birthdate = "Required";
      if (!formData.gender) newErrors.gender = "Required";
      if (!formData.occupation?.trim()) newErrors.occupation = "Required";
      if (!formData.monthlyIncome) newErrors.monthlyIncome = "Required";
    }
    if (step === 2) {
      // Step 2: Family - no required fields (optional based on civil status)
    }
    if (step === 3) {
      // Step 3: Address - all fields required
      if (!formData.purok?.trim()) newErrors.purok = "Required";
      if (!formData.barangay?.trim()) newErrors.barangay = "Required";
      if (!formData.municipality?.trim()) newErrors.municipality = "Required";
      if (!formData.province?.trim()) newErrors.province = "Required";
      if (!formData.region?.trim()) newErrors.region = "Required";
    }
    if (step === 4) {
      // Step 4: Household - no required fields
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      childrenRoster: [...(prev.childrenRoster || []), { 
        childFirstName: "", childMiddleName: "", childLastName: "", 
        childBirthdate: "", childAge: "", childGender: "", 
        childBirthplace: "", childNationality: "Filipino", childStatus: "Student",
        childEducation: "Elementary", childSchoolName: "", childSchoolAddress: "",
        childCourse: "", childOccupation: "", childIncome: ""
      }]
    }));
  };

  const addSenior = () => {
    setFormData(prev => ({
      ...prev,
      seniorRoster: [...(prev.seniorRoster || []), { 
        firstName: "", middleName: "", lastName: "", age: "", 
        birthdate: "", gender: "Male", birthplace: "", nationality: "Filipino",
        healthStatus: "Healthy", isPensioner: false, pensionAmount: "",
        oscaId: "", registrationDate: "", livingWithFamily: true,
        emergencyContact: "", emergencyRelation: "", emergencyPhone: ""
      }]
    }));
  };

  const addPWD = () => {
    setFormData(prev => ({
      ...prev,
      pwdRoster: [...(prev.pwdRoster || []), { 
        firstName: "", middleName: "", lastName: "", age: "", 
        birthdate: "", gender: "Male", disabilityType: "", disabilityCause: "Congenital",
        nationality: "Filipino", pwdId: "", registrationDate: "",
        isEmployed: false, occupation: "", needsAssistance: false,
        assistiveDevice: "", emergencyContact: "", emergencyPhone: ""
      }]
    }));
  };

  const removeItem = (listName, index) => {
    const updated = [...(formData[listName] || [])];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, [listName]: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(formStep)) return;
    if (formStep < 4) { setStep(formStep + 1); return; }

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${currentId}`, formData);
        alert("Profile updated successfully!");
      } else {
        await axios.post(`${API_URL}/add`, formData);
        alert("Resident registered successfully!");
      }
      fetchResidents();
      handleCloseModal();
    } catch (err) { 
      console.error("SAVE_ERROR:", err);
      alert("Error: " + (err.response?.data?.message || err.message)); 
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData(initialFormState);
    setStep(1);
    setErrors({});
    setCurrentId(null);
  };

  const inputStyle = { padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 600, width: '100%', boxSizing: 'border-box' };
  const delBtn = { background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  const handleEdit = (r) => {
    setIsEditing(true);
    setCurrentId(r._id);
    const birthDate = r.birthdate ? new Date(r.birthdate).toISOString().split('T')[0] : "";
    const spouseBDate = r.spouseBirthdate ? new Date(r.spouseBirthdate).toISOString().split('T')[0] : "";
    setFormData({
      ...initialFormState,
      ...r,
      childrenRoster: r.childrenRoster || [],
      seniorRoster: r.seniorRoster || [],
      pwdRoster: r.pwdRoster || [],
      birthdate: birthDate,
      spouseBirthdate: spouseBDate,
      age: birthDate ? calculateAge(birthDate) : r.age || "",
    });
    setStep(1);
    setIsModalOpen(true);
  };

  const handleView = (r) => {
    setSelectedResident(r);
    setIsViewModalOpen(true);
  };

  const handleCloseView = () => {
    setIsViewModalOpen(false);
    setSelectedResident(null);
  };

  const filtered = useMemo(() => {
    return residents.filter(r => {
      const s = searchTerm.toLowerCase();
      const fullName = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(s) || r.residentId?.toLowerCase().includes(s);
      const matchesPurok = filterPurok === "All" || r.purok === filterPurok;
      const matchesStatus = filterStatus === "All" || r.civilStatus === filterStatus;
      return matchesSearch && matchesPurok && matchesStatus;
    });
  }, [residents, searchTerm, filterPurok, filterStatus]);

  const purokList = useMemo(() => {
    const puros = new Set(residents.map(r => r.purok).filter(Boolean));
    return ["All", ...Array.from(puros).sort()];
  }, [residents]);

  const stats = useMemo(() => {
    const seniorCount = residents.filter(r => 
      r.age >= 60 || (r.seniorRoster && r.seniorRoster.length > 0)
    ).length;
    const pwdCount = residents.filter(r => 
      r.isAnyMemberPWD || (r.pwdRoster && r.pwdRoster.length > 0)
    ).length;
    return {
      total: residents.length,
      male: residents.filter(r => r.gender === "Male").length,
      female: residents.filter(r => r.gender === "Female").length,
      senior: seniorCount,
      married: residents.filter(r => r.civilStatus === "Married").length,
      pwd: pwdCount,
    };
  }, [residents]);

  return (
    <Layout title="Community Census" subtitle="Resident demographic management">
      <style>{`
        .sheet { background: white; border-radius: 20px; border: 1px solid #E2E8F0; overflow: hidden; }
        .nav-tab { flex: 1; padding: 1rem; text-align: center; font-size: 0.7rem; font-weight: 800; color: #94A3B8; border-bottom: 3px solid #F1F5F9; cursor: pointer; transition: 0.2s; }
        .nav-tab.active { color: #4169E1; border-bottom-color: #4169E1; background: #EEF2FF; }
        .nav-tab.completed { color: #10B981; }
        .nav-tab.completed::after { content: ' ✓'; }
        .box-input { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .box-input label { font-size: 0.6rem; font-weight: 800; color: #64748B; text-transform: uppercase; }
        .box-input input, .box-input select { padding: 0.65rem; border-radius: 8px; border: 1px solid #E2E8F0; background: #F8FAFC; font-size: 0.8rem; font-weight: 600; outline: none; transition: 0.2s; width: 100%; box-sizing: border-box; }
        .box-input input:focus { border-color: #4169E1; background: white; }
        .section-card { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1.25rem; border-radius: 12px; margin-bottom: 1rem; }
        .section-title { font-size: 0.75rem; font-weight: 900; color: #4169E1; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px; }
        .roster-card { background: white; border: 1px solid #E2E8F0; padding: 1rem; border-radius: 10px; margin-bottom: 0.75rem; border-left: 4px solid #10B981; }
        .roster-card.senior { border-left-color: #F59E0B; }
        .roster-card.pwd { border-left-color: #4169E1; }
        .roster-card-title { font-size: 0.75rem; font-weight: 800; color: #0F172A; }
        .empty-state { text-align: center; padding: 3rem; color: #94A3B8; }
        .empty-state-icon { font-size: 3rem; margin-bottom: 1rem; }
        .loading-spinner { display: flex; justify-content: center; padding: 3rem; }
        .spinner { width: 40px; height: 40px; border: 4px solid #E2E8F0; border-top: 4px solid #4169E1; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .sub-section { background: white; border: 1px solid #E2E8F0; padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem; }
        .sub-section-title { font-size: 0.7rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem; text-transform: uppercase; }
        @media (max-width: 768px) {
          .sheet-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total', value: stats.total, color: '#4169E1', icon: faUsers },
            { label: 'Male', value: stats.male, color: '#3B82F6', icon: faMale },
            { label: 'Female', value: stats.female, color: '#EC4899', icon: faFemale },
            { label: 'Married', value: stats.married, color: '#8B5CF6', icon: faRing },
            { label: 'Senior', value: stats.senior, color: '#F59E0B', icon: faUserShield },
            { label: 'PWD', value: stats.pwd, color: '#10B981', icon: faWheelchair },
          ].map(s => (
            <div key={s.label} className="sheet" style={{ padding: '1rem', textAlign: 'center' }}>
              <FontAwesomeIcon icon={s.icon} size="lg" color={s.color} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* SEARCH & FILTERS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="sheet" style={{ flex: 1, padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '250px' }}>
            <FontAwesomeIcon icon={faSearch} color="#94A3B8" />
            <input style={{ flex: 1, border: 'none', outline: 'none', fontWeight: 600, fontSize: '0.9rem' }} placeholder="Search name or ID..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          </div>
          <select value={filterPurok} onChange={e=>setFilterPurok(e.target.value)} style={{ padding: '0 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.8rem', background: 'white' }}>
            {purokList.map(p => <option key={p} value={p}>{p === 'All' ? 'All Purok' : `Purok ${p}`}</option>)}
          </select>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ padding: '0 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.8rem', background: 'white' }}>
            <option value="All">All Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Separated">Separated</option>
          </select>
          <button className="button button--secondary" onClick={fetchResidents} disabled={loading} style={{ borderRadius: '10px', height: '42px', padding: '0 1rem' }}>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh
          </button>
          <button className="button button--primary" onClick={()=>setIsModalOpen(true)} style={{ borderRadius: '10px', background: '#0F172A', padding: '0 1.5rem', fontWeight: 800 }}>
            <FontAwesomeIcon icon={faPlus} /> New Resident
          </button>
        </div>

        {/* TABLE */}
        <div className="sheet" style={{ maxHeight: '400px', overflow: 'auto' }}>
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FontAwesomeIcon icon={faUsers} /></div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>No residents found</div>
              <div style={{ fontSize: '0.8rem' }}>Try adjusting your search or filters</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem' }}>Resident</th>
                  <th>ID</th>
                  <th>Purok</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id}>
                    <td style={{ paddingLeft: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => handleView(r)}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: r.gender === 'Female' ? '#FDF2F8' : '#EFF6FF', color: r.gender === 'Female' ? '#EC4899' : '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesomeIcon icon={r.gender === 'Female' ? faFemale : faMale} />
                        </div>
                        <span style={{ fontWeight: 800 }}>{r.firstName} {r.lastName}</span>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#4169E1' }}>{r.residentId || 'PENDING'}</span></td>
                    <td><span style={{ fontWeight: 700 }}>{r.purok ? `P-${r.purok}` : 'N/A'}</span></td>
                    <td>{r.age || calculateAge(r.birthdate)}</td>
                    <td><span className="tag" style={{ background: r.civilStatus === 'Married' ? '#F0FDF4' : '#F1F5F9', color: r.civilStatus === 'Married' ? '#16A34A' : '#475569' }}>{r.civilStatus}</span></td>
                    <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="icon-button" onClick={()=>handleView(r)} title="View Details"><FontAwesomeIcon icon={faEye} /></button>
                        <button className="icon-button" onClick={()=>handleEdit(r)} title="Edit"><FontAwesomeIcon icon={faEdit} /></button>
                        <button className="icon-button" style={{ color: '#EF4444' }} onClick={async ()=>{ if(window.confirm("Delete this resident?")){ await axios.delete(`${API_URL}/${r._id}`); fetchResidents(); } }} title="Delete"><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', zIndex: 10000, overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '98%', maxWidth: '950px', maxHeight: 'none', overflow: 'visible', marginTop: '2rem' }}>
            
            <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', color: 'white', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px 20px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem' }}>{isEditing ? 'Edit Resident' : 'New Census Registration'}</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.7rem', opacity: 0.7 }}>Fill in all required fields (*)</p>
              </div>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}><FontAwesomeIcon icon={faTimes} size="lg" /></button>
            </div>

            {/* STEPPER */}
            <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #E2E8F0' }}>
              {[
                { s: 1, l: 'Personal', icon: faUsers },
                { s: 2, l: 'Family', icon: faRing },
                { s: 3, l: 'Address', icon: faMapMarkerAlt },
                { s: 4, l: 'Household', icon: faHome }
              ].map(item => (
                <div key={item.s} className={`nav-tab ${formStep === item.s ? 'active' : ''} ${formStep > item.s ? 'completed' : ''}`} onClick={()=>formStep > item.s && setStep(item.s)}>
                  <FontAwesomeIcon icon={item.icon} style={{ marginRight: 6, fontSize: '0.7rem' }} /> {item.l}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              
              {/* STEP 1 - Personal Information */}
              {formStep === 1 && (
                <div>
                  <div className="section-card">
                    <div className="section-title"><FontAwesomeIcon icon={faUsers} /> Basic Information</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', minWidth: 0 }}>
                      <InputField name="firstName" label="First Name" required value={formData.firstName} onChange={handleInputChange} error={errors.firstName} />
                      <InputField name="middleName" label="Middle Name" required value={formData.middleName} onChange={handleInputChange} error={errors.middleName} />
                      <InputField name="lastName" label="Last Name" required value={formData.lastName} onChange={handleInputChange} error={errors.lastName} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '0.75rem', minWidth: 0 }}>
                      <InputField name="birthdate" label="Birthdate" type="date" required value={formData.birthdate} onChange={handleInputChange} error={errors.birthdate} />
                      <InputField name="age" label="Age" readOnly value={formData.age} />
                      <InputField name="gender" label="Gender" required options={["Male", "Female"]} value={formData.gender} onChange={handleInputChange} error={errors.gender} />
                      <InputField name="civilStatus" label="Civil Status" options={["Single", "Married", "Widowed", "Separated", "Divorced"]} value={formData.civilStatus} onChange={handleInputChange} error={errors.civilStatus} />
                    </div>
                  </div>

                  <div className="section-card">
                    <div className="section-title"><FontAwesomeIcon icon={faBriefcase} /> Additional Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', minWidth: 0 }}>
                      <InputField name="nationality" label="Nationality" value={formData.nationality} onChange={handleInputChange} error={errors.nationality} />
                      <InputField name="religion" label="Religion" value={formData.religion} onChange={handleInputChange} error={errors.religion} />
                      <InputField name="birthplace" label="Birthplace" value={formData.birthplace} onChange={handleInputChange} error={errors.birthplace} />
                      <InputField name="occupation" label="Occupation" required value={formData.occupation} onChange={handleInputChange} error={errors.occupation} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.75rem', minWidth: 0 }}>
                      <InputField name="monthlyIncome" label="Monthly Income" required options={incomeOptions} value={formData.monthlyIncome} onChange={handleInputChange} error={errors.monthlyIncome} />
                      <InputField name="contactNumber" label="Contact No." value={formData.contactNumber} onChange={handleInputChange} error={errors.contactNumber} />
                      <InputField name="email" label="Email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} />
                    </div>
                  </div>

                  <div className="section-card">
                    <div className="section-title"><FontAwesomeIcon icon={faIdCard} /> Government IDs (Optional)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', minWidth: 0 }}>
                      <InputField name="sssNumber" label="SSS Number" value={formData.sssNumber} onChange={handleInputChange} error={errors.sssNumber} />
                      <InputField name="philhealthNumber" label="PhilHealth Number" value={formData.philhealthNumber} onChange={handleInputChange} error={errors.philhealthNumber} />
                      <InputField name="pagibigNumber" label="Pag-IBIG Number" value={formData.pagibigNumber} onChange={handleInputChange} error={errors.pagibigNumber} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.75rem', minWidth: 0 }}>
                      <InputField name="voterStatus" label="Voter Status" options={["Yes", "No"]} value={formData.voterStatus} onChange={handleInputChange} error={errors.voterStatus} />
                      <InputField name="registeredVoter" label="Registered Voter" options={["Yes", "No"]} value={formData.registeredVoter} onChange={handleInputChange} error={errors.registeredVoter} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 - Family Information (Spouse & Children) */}
              {formStep === 2 && (
                <div>
                  {(formData.civilStatus === 'Single' || formData.civilStatus === 'Separated' || formData.civilStatus === 'Divorced') && (
                    <div className="section-card" style={{ borderLeft: '4px solid #94A3B8', textAlign: 'center', padding: '2rem' }}>
                      <FontAwesomeIcon icon={faUsers} size="2x" color="#94A3B8" />
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748B', marginTop: '0.5rem' }}>No Family Information Required</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Family details are only required for married or widowed residents.</div>
                    </div>
                  )}

                  {(formData.civilStatus === 'Married' || formData.civilStatus === 'Widowed') && (
                    <div className="section-card" style={{ borderLeft: '4px solid #3B82F6' }}>
                      <div className="section-title"><FontAwesomeIcon icon={faRing} /> Spouse Information</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', minWidth: 0 }}>
                        <InputField name="spouseFirstName" label="First Name" value={formData.spouseFirstName} onChange={handleInputChange} error={errors.spouseFirstName} />
                        <InputField name="spouseMiddleName" label="Middle Name" value={formData.spouseMiddleName} onChange={handleInputChange} error={errors.spouseMiddleName} />
                        <InputField name="spouseLastName" label="Last Name" value={formData.spouseLastName} onChange={handleInputChange} error={errors.spouseLastName} />
                        <InputField name="spouseAge" label="Age" type="number" value={formData.spouseAge} onChange={handleInputChange} error={errors.spouseAge} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.75rem', minWidth: 0 }}>
                        <InputField name="spouseBirthdate" label="Birthdate" type="date" value={formData.spouseBirthdate} onChange={handleInputChange} error={errors.spouseBirthdate} />
                        <InputField name="spouseOccupation" label="Occupation" value={formData.spouseOccupation} onChange={handleInputChange} error={errors.spouseOccupation} />
                        <InputField name="spouseMonthlyIncome" label="Income" options={incomeOptions} value={formData.spouseMonthlyIncome} onChange={handleInputChange} error={errors.spouseMonthlyIncome} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.75rem', minWidth: 0 }}>
                        <InputField name="spouseNationality" label="Nationality" value={formData.spouseNationality} onChange={handleInputChange} error={errors.spouseNationality} />
                        <InputField name="spouseReligion" label="Religion" value={formData.spouseReligion} onChange={handleInputChange} error={errors.spouseReligion} />
                      </div>
                    </div>
                  )}

                  {(formData.civilStatus === 'Married' || formData.civilStatus === 'Widowed') && (
                    <div className="section-card" style={{ borderLeft: '4px solid #10B981' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div className="section-title" style={{ margin: 0 }}><FontAwesomeIcon icon={faBaby} /> Children Information</div>
                        <button type="button" onClick={addChild} className="button" style={{ background: '#10B981', color: 'white', fontWeight: 800, padding: '0.4rem 0.75rem', fontSize: '0.7rem' }}>+ Add Child</button>
                      </div>
                      {(formData.childrenRoster || []).map((c, idx) => (
                        <div key={idx} className="roster-card animate-fade-in">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#0F172A' }}>Child {idx + 1}</span>
                            <button type="button" onClick={()=>removeItem('childrenRoster', idx)} style={delBtn}><FontAwesomeIcon icon={faTrash} /></button>
                          </div>
                          
                          <div className="sub-section">
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Personal Details</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <input placeholder="First Name" value={c.childFirstName} onChange={e=>handleChildChange(idx, 'childFirstName', e.target.value)} style={inputStyle} />
                              <input placeholder="Middle Name" value={c.childMiddleName} onChange={e=>handleChildChange(idx, 'childMiddleName', e.target.value)} style={inputStyle} />
                              <input placeholder="Last Name" value={c.childLastName} onChange={e=>handleChildChange(idx, 'childLastName', e.target.value)} style={inputStyle} />
                              <select value={c.childGender || ""} onChange={e=>handleChildChange(idx, 'childGender', e.target.value)} style={inputStyle}>
                                <option value="">Gender</option>
                                <option>Male</option>
                                <option>Female</option>
                              </select>
                              <input placeholder="Age" value={c.childAge || ""} onChange={e=>handleChildChange(idx, 'childAge', e.target.value)} style={inputStyle} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                              <input type="date" placeholder="Birthdate" value={c.childBirthdate || ""} onChange={e=>handleChildChange(idx, 'childBirthdate', e.target.value)} style={inputStyle} />
                              <input placeholder="Birthplace" value={c.childBirthplace || ""} onChange={e=>handleChildChange(idx, 'childBirthplace', e.target.value)} style={inputStyle} />
                              <select value={c.childNationality || "Filipino"} onChange={e=>handleChildChange(idx, 'childNationality', e.target.value)} style={inputStyle}>
                                <option>Filipino</option>
                                <option>Other</option>
                              </select>
                              <select value={c.childStatus || "Student"} onChange={e=>handleChildChange(idx, 'childStatus', e.target.value)} style={inputStyle}>
                                <option>Student</option>
                                <option>Working</option>
                                <option>Not in School</option>
                              </select>
                            </div>
                          </div>

                          {c.childStatus === "Student" && (
                            <div className="sub-section">
                              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}><FontAwesomeIcon icon={faGraduationCap} /> Education Details</div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                <select value={c.childEducation || "Elementary"} onChange={e=>handleChildChange(idx, 'childEducation', e.target.value)} style={inputStyle}>
                                  <option value="Kinder">Kinder</option>
                                  <option value="Elementary">Elementary</option>
                                  <option value="High School">High School</option>
                                  <option value="Senior High">Senior High</option>
                                  <option value="College">College</option>
                                  <option value="Post Graduate">Post Graduate</option>
                                  <option value="Graduated">Graduated</option>
                                </select>
                                <input placeholder="Course (if college)" value={c.childCourse || ""} onChange={e=>handleChildChange(idx, 'childCourse', e.target.value)} style={inputStyle} />
                                <input placeholder="School Name" value={c.childSchoolName || ""} onChange={e=>handleChildChange(idx, 'childSchoolName', e.target.value)} style={{ ...inputStyle, gridColumn: 'span 2' }} />
                              </div>
                            </div>
                          )}

                          {c.childStatus === "Working" && (
                            <div className="sub-section">
                              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}><FontAwesomeIcon icon={faBriefcase} /> Employment Details</div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                <input placeholder="Occupation" value={c.childOccupation || ""} onChange={e=>handleChildChange(idx, 'childOccupation', e.target.value)} style={inputStyle} />
                                <select value={c.childIncome || "Below 5,000"} onChange={e=>handleChildChange(idx, 'childIncome', e.target.value)} style={inputStyle}>
                                  {incomeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 - Address */}
              {formStep === 3 && (
                <div>
                  <div className="section-card">
                    <div className="section-title"><FontAwesomeIcon icon={faMapMarkerAlt} /> Location Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', minWidth: 0 }}>
                      <InputField name="purok" label="Purok / Sitio" required value={formData.purok} onChange={handleInputChange} error={errors.purok} />
                      <InputField name="barangay" label="Barangay" required value={formData.barangay} onChange={handleInputChange} error={errors.barangay} />
                      <InputField name="municipality" label="Municipality / City" required value={formData.municipality} onChange={handleInputChange} error={errors.municipality} />
                      <InputField name="province" label="Province" required value={formData.province} onChange={handleInputChange} error={errors.province} />
                      <InputField name="region" label="Region" required value={formData.region} onChange={handleInputChange} error={errors.region} />
                      <InputField name="postalCode" label="Postal Code" value={formData.postalCode} onChange={handleInputChange} error={errors.postalCode} />
                      <div style={{ gridColumn: 'span 2' }}>
                        <InputField name="streetAddress" label="Street Address / House No." value={formData.streetAddress} onChange={handleInputChange} error={errors.streetAddress} />
                      </div>
                    </div>
                  </div>

                  <div className="section-card">
                    <div className="section-title"><FontAwesomeIcon icon={faUserShield} /> Senior Citizen & PWD Members in Household</div>
                    
                    <div style={{ borderLeft: '4px solid #F59E0B', paddingLeft: '1rem', marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                        <input type="checkbox" name="isAnyMemberSenior" checked={formData.isAnyMemberSenior} onChange={handleInputChange} />
                        <FontAwesomeIcon icon={faUserShield} color="#F59E0B" /> Has Senior Citizen(s) in Household
                      </label>
                      {formData.isAnyMemberSenior && (
                        <div>
                          <button type="button" onClick={addSenior} className="button" style={{ background: '#F59E0B', color: 'white', fontWeight: 800, marginBottom: '0.75rem', padding: '0.4rem 0.75rem', fontSize: '0.7rem' }}>+ Add Senior</button>
                          {(formData.seniorRoster || []).map((s, idx) => (
                            <div key={idx} className="roster-card senior">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#0F172A' }}>Senior Citizen {idx + 1}</span>
                                <button type="button" onClick={()=>removeItem('seniorRoster', idx)} style={delBtn}><FontAwesomeIcon icon={faTrash} /></button>
                              </div>
                              <div className="sub-section">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <input placeholder="First Name" value={s.firstName} onChange={e=>handleRosterChange('seniorRoster', idx, 'firstName', e.target.value)} style={inputStyle} />
                                  <input placeholder="Middle Name" value={s.middleName || ""} onChange={e=>handleRosterChange('seniorRoster', idx, 'middleName', e.target.value)} style={inputStyle} />
                                  <input placeholder="Last Name" value={s.lastName} onChange={e=>handleRosterChange('seniorRoster', idx, 'lastName', e.target.value)} style={inputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <input type="date" placeholder="Birthdate" value={s.birthdate || ""} onChange={e=>handleRosterChange('seniorRoster', idx, 'birthdate', e.target.value)} style={inputStyle} />
                                  <select value={s.gender || "Male"} onChange={e=>handleRosterChange('seniorRoster', idx, 'gender', e.target.value)} style={inputStyle}>
                                    <option>Male</option>
                                    <option>Female</option>
                                  </select>
                                  <input placeholder="Birthplace" value={s.birthplace || ""} onChange={e=>handleRosterChange('seniorRoster', idx, 'birthplace', e.target.value)} style={inputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <select value={s.healthStatus || "Healthy"} onChange={e=>handleRosterChange('seniorRoster', idx, 'healthStatus', e.target.value)} style={inputStyle}>
                                    <option>Healthy</option>
                                    <option>With Illness</option>
                                    <option>Bedridden</option>
                                  </select>
                                  <select value={s.nationality || "Filipino"} onChange={e=>handleRosterChange('seniorRoster', idx, 'nationality', e.target.value)} style={inputStyle}>
                                    <option>Filipino</option>
                                    <option>Other</option>
                                  </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    <input type="checkbox" checked={s.isPensioner || false} onChange={e=>handleRosterChange('seniorRoster', idx, 'isPensioner', e.target.checked)} /> Is Pensioner
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    <input type="checkbox" checked={s.livingWithFamily !== false} onChange={e=>handleRosterChange('seniorRoster', idx, 'livingWithFamily', e.target.checked)} /> Lives with Family
                                  </label>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                                  <input placeholder="OSCA ID" value={s.oscaId || ""} onChange={e=>handleRosterChange('seniorRoster', idx, 'oscaId', e.target.value)} style={inputStyle} />
                                  <input placeholder="Emergency Contact" value={s.emergencyContact || ""} onChange={e=>handleRosterChange('seniorRoster', idx, 'emergencyContact', e.target.value)} style={inputStyle} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ borderLeft: '4px solid #4169E1', paddingLeft: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                        <input type="checkbox" name="isAnyMemberPWD" checked={formData.isAnyMemberPWD} onChange={handleInputChange} />
                        <FontAwesomeIcon icon={faWheelchair} color="#4169E1" /> Has PWD(s) in Household
                      </label>
                      {formData.isAnyMemberPWD && (
                        <div>
                          <button type="button" onClick={addPWD} className="button" style={{ background: '#4169E1', color: 'white', fontWeight: 800, marginBottom: '0.75rem', padding: '0.4rem 0.75rem', fontSize: '0.7rem' }}>+ Add PWD</button>
                          {(formData.pwdRoster || []).map((p, idx) => (
                            <div key={idx} className="roster-card pwd">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#0F172A' }}>PWD {idx + 1}</span>
                                <button type="button" onClick={()=>removeItem('pwdRoster', idx)} style={delBtn}><FontAwesomeIcon icon={faTrash} /></button>
                              </div>
                              <div className="sub-section">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <input placeholder="First Name" value={p.firstName} onChange={e=>handleRosterChange('pwdRoster', idx, 'firstName', e.target.value)} style={inputStyle} />
                                  <input placeholder="Middle Name" value={p.middleName || ""} onChange={e=>handleRosterChange('pwdRoster', idx, 'middleName', e.target.value)} style={inputStyle} />
                                  <input placeholder="Last Name" value={p.lastName} onChange={e=>handleRosterChange('pwdRoster', idx, 'lastName', e.target.value)} style={inputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <input type="date" placeholder="Birthdate" value={p.birthdate || ""} onChange={e=>handleRosterChange('pwdRoster', idx, 'birthdate', e.target.value)} style={inputStyle} />
                                  <select value={p.gender || "Male"} onChange={e=>handleRosterChange('pwdRoster', idx, 'gender', e.target.value)} style={inputStyle}>
                                    <option>Male</option>
                                    <option>Female</option>
                                  </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <select value={p.disabilityType || ""} onChange={e=>handleRosterChange('pwdRoster', idx, 'disabilityType', e.target.value)} style={inputStyle}>
                                    <option value="">Select Disability Type</option>
                                    <option>Physical/Orthopedic</option>
                                    <option>Visual</option>
                                    <option>Hearing/Speech</option>
                                    <option>Intellectual</option>
                                    <option>Psychosocial</option>
                                    <option>Multiple</option>
                                  </select>
                                  <select value={p.disabilityCause || "Congenital"} onChange={e=>handleRosterChange('pwdRoster', idx, 'disabilityCause', e.target.value)} style={inputStyle}>
                                    <option>Congenital</option>
                                    <option>Accident</option>
                                    <option>Illness</option>
                                    <option>Other</option>
                                  </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  <input placeholder="PWD ID Number" value={p.pwdId || ""} onChange={e=>handleRosterChange('pwdRoster', idx, 'pwdId', e.target.value)} style={inputStyle} />
                                  <select value={p.nationality || "Filipino"} onChange={e=>handleRosterChange('pwdRoster', idx, 'nationality', e.target.value)} style={inputStyle}>
                                    <option>Filipino</option>
                                    <option>Other</option>
                                  </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    <input type="checkbox" checked={p.isEmployed || false} onChange={e=>handleRosterChange('pwdRoster', idx, 'isEmployed', e.target.checked)} /> Currently Employed
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    <input type="checkbox" checked={p.needsAssistance || false} onChange={e=>handleRosterChange('pwdRoster', idx, 'needsAssistance', e.target.checked)} /> Needs Assistance
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 - Household */}
              {formStep === 4 && (
                <div>
                  <div className="section-card">
                    <div className="section-title"><FontAwesomeIcon icon={faHome} /> Household Information</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', minWidth: 0 }}>
                      <InputField name="householdId" label="Household ID" value={formData.householdId} onChange={handleInputChange} error={errors.householdId} />
                      <InputField name="totalMembersInHousehold" label="Total Members" type="number" value={formData.totalMembersInHousehold} onChange={handleInputChange} error={errors.totalMembersInHousehold} />
                      <InputField name="housingType" label="Housing Type" options={["Concrete", "Semi-Concrete", "Wood/Bamboo", "Mixed", "Others"]} value={formData.housingType} onChange={handleInputChange} error={errors.housingType} />
                      <InputField name="ownershipStatus" label="Ownership" options={["Owned", "Rented", "Free Use", "Shared", "Homeless"]} value={formData.ownershipStatus} onChange={handleInputChange} error={errors.ownershipStatus} />
                    </div>
                  </div>

                  <div className="section-card">
                    <div className="section-title"><FontAwesomeIcon icon={faHome} /> Utilities & Amenities</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', minWidth: 0 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                        <input type="checkbox" name="hasElectricity" checked={formData.hasElectricity} onChange={handleInputChange} />
                        Has Electricity
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                        <input type="checkbox" name="hasWater" checked={formData.hasWater} onChange={handleInputChange} />
                        Has Water
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #F1F5F9', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button type="button" className="button button--secondary" onClick={handleCloseModal} style={{ borderRadius: '8px', height: '40px' }}>Cancel</button>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {formStep > 1 && (
                    <button type="button" className="button button--secondary" onClick={()=>setStep(formStep - 1)} style={{ borderRadius: '8px', height: '40px', padding: '0 1rem' }}>Back</button>
                  )}
                  <button type="submit" className="button button--primary" style={{ borderRadius: '8px', height: '40px', minWidth: '120px', background: formStep === 4 ? '#10B981' : '#0F172A' }}>
                    {formStep < 4 ? 'Next' : <><FontAwesomeIcon icon={faCheckCircle} /> Save</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && selectedResident && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', zIndex: 10000, overflowY: 'auto' }}>
          <div className="sheet animate-fade-in" style={{ width: '98%', maxWidth: '900px', background: 'white', marginTop: '1rem', borderRadius: '20px', overflow: 'hidden' }}>
            
            <div style={{ background: 'linear-gradient(135deg, #4169E1, #2563EB)', color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  <FontAwesomeIcon icon={selectedResident.gender === 'Female' ? faFemale : faMale} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>{selectedResident.firstName} {selectedResident.lastName}</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>{selectedResident.residentId}</p>
                </div>
              </div>
              <button onClick={handleCloseView} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FontAwesomeIcon icon={faTimes} /></button>
            </div>

            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '2rem' }}>
                
                {/* Personal Info */}
                <div className="section-card" style={{ marginBottom: 0 }}>
                  <div className="section-title"><FontAwesomeIcon icon={faUsers} /> Personal Profile</div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <DataRow label="Full Name" value={`${selectedResident.firstName} ${selectedResident.middleName || ''} ${selectedResident.lastName} ${selectedResident.suffix || ''}`} />
                    <DataRow label="ID Number" value={selectedResident.residentId || ''} />
                    <DataRow label="Birthdate" value={selectedResident.birthdate ? new Date(selectedResident.birthdate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : ''} />
                    <DataRow label="Age" value={selectedResident.age || calculateAge(selectedResident.birthdate) ? `${selectedResident.age || calculateAge(selectedResident.birthdate)} years old` : ''} />
                    <DataRow label="Gender" value={selectedResident.gender || ''} />
                    <DataRow label="Civil Status" value={selectedResident.civilStatus || ''} />
                    <DataRow label="Nationality" value={selectedResident.nationality || ''} />
                    <DataRow label="Religion" value={selectedResident.religion || ''} />
                    <DataRow label="Occupation" value={selectedResident.occupation || ''} />
                    <DataRow label="Monthly Income" value={selectedResident.monthlyIncome || ''} />
                  </div>
                </div>

                {/* Contact & Gov Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="section-card" style={{ marginBottom: 0 }}>
                    <div className="section-title"><FontAwesomeIcon icon={faMapMarkerAlt} /> Location & Contact</div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <DataRow label="Street Address" value={selectedResident.streetAddress || ''} />
                      <DataRow label="Purok" value={selectedResident.purok ? `Purok ${selectedResident.purok}` : ''} />
                      <DataRow label="Barangay" value={selectedResident.barangay || ''} />
                      <DataRow label="Municipality" value={selectedResident.municipality || ''} />
                      <DataRow label="Province" value={selectedResident.province || ''} />
                      <DataRow label="Region" value={selectedResident.region || ''} />
                      <DataRow label="Postal Code" value={selectedResident.postalCode || ''} />
                      <DataRow label="Contact No." value={selectedResident.contactNumber || ''} />
                      <DataRow label="Email" value={selectedResident.email || ''} />
                    </div>
                  </div>
                  
                  <div className="section-card" style={{ marginBottom: 0 }}>
                    <div className="section-title"><FontAwesomeIcon icon={faIdCard} /> Government Records</div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <DataRow label="SSS No." value={selectedResident.sssNumber || ''} />
                      <DataRow label="PhilHealth No." value={selectedResident.philhealthNumber || ''} />
                      <DataRow label="Pag-IBIG No." value={selectedResident.pagibigNumber || ''} />
                      <DataRow label="Voter Status" value={selectedResident.voterStatus === 'Yes' ? 'Registered Voter' : ''} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Details */}
              {(selectedResident.civilStatus === 'Married' || selectedResident.civilStatus === 'Widowed') && (
                <div className="section-card" style={{ marginTop: '1.5rem' }}>
                  <div className="section-title"><FontAwesomeIcon icon={faRing} /> Family Information</div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.75rem', color: '#4169E1', marginBottom: '10px' }}>Spouse Details</h4>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        <DataRow label="Spouse Name" value={`${selectedResident.spouseFirstName} ${selectedResident.spouseLastName}`} />
                        <DataRow label="Occupation" value={selectedResident.spouseOccupation || 'N/A'} />
                        <DataRow label="Income" value={selectedResident.spouseMonthlyIncome || 'N/A'} />
                      </div>
                    </div>
                    {selectedResident.childrenRoster && selectedResident.childrenRoster.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.75rem', color: '#10B981', marginBottom: '10px' }}>Children ({selectedResident.childrenRoster.length})</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {selectedResident.childrenRoster.map((c, i) => (
                            <div key={i} style={{ padding: '6px 12px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700 }}>
                              {c.childFirstName} ({c.childAge}y/o)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Special Categories */}
              {(selectedResident.seniorRoster?.length > 0 || selectedResident.pwdRoster?.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
                  {selectedResident.seniorRoster?.length > 0 && (
                    <div className="section-card" style={{ marginBottom: 0, borderLeft: '4px solid #F59E0B' }}>
                      <div className="section-title" style={{ color: '#F59E0B' }}><FontAwesomeIcon icon={faUserShield} /> Senior Citizens</div>
                      {selectedResident.seniorRoster.map((s, i) => (
                        <div key={i} style={{ padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '8px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{s.firstName} {s.lastName}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{s.age} y/o • {s.healthStatus} • {s.isPensioner ? 'Pensioner' : 'No Pension'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedResident.pwdRoster?.length > 0 && (
                    <div className="section-card" style={{ marginBottom: 0, borderLeft: '4px solid #4169E1' }}>
                      <div className="section-title" style={{ color: '#4169E1' }}><FontAwesomeIcon icon={faWheelchair} /> PWD Members</div>
                      {selectedResident.pwdRoster.map((p, i) => (
                        <div key={i} style={{ padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '8px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{p.firstName} {p.lastName}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{p.disabilityType} • {p.isEmployed ? 'Employed' : 'Unemployed'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="section-card" style={{ marginTop: '1.5rem', background: '#F8FAFC', borderStyle: 'dashed' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <DataRow label="Registered By" value={selectedResident.registeredBy || 'System'} />
                  <DataRow label="Registration Date" value={new Date(selectedResident.createdAt).toLocaleDateString()} />
                  <DataRow label="Resident Status" value={selectedResident.status || 'Active'} />
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem 2rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="button button--secondary" onClick={handleCloseView} style={{ borderRadius: '10px' }}>Close</button>
              <button className="button button--primary" onClick={() => { handleCloseView(); handleEdit(selectedResident); }} style={{ borderRadius: '10px' }}>
                <FontAwesomeIcon icon={faEdit} /> Edit Resident
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}