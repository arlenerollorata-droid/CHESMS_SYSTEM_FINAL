import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import Calendar from "../components/Calendar";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  LabelList,
  LineChart,
  Line,
  Legend
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, 
  faCalendarAlt, 
  faBullhorn, 
  faPlus, 
  faArrowUp,
  faArrowDown,
  faMapMarkerAlt, 
  faCalendarDay, 
  faSync, 
  faClock, 
  faFileMedical, 
  faNotesMedical, 
  faChartBar, 
  faChartLine,
  faCheckCircle,
  faSyringe,
  faPills,
  faStethoscope,
  faVial,
  faHeartPulse,
  faBaby,
  faUserInjured,
  faThermometer
} from "@fortawesome/free-solid-svg-icons";


// Standardized Sparkline - Added minWidth and fixed height to avoid ResponsiveContainer warnings
const MiniSparkline = ({ data, color }) => (
  <div style={{ height: '30px', width: '60px', opacity: 0.6 }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <Area type="monotone" dataKey="visits" stroke="white" fill="white" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="glass-effect" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="status-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4169E1', display: 'inline-block' }}></div>
      <FontAwesomeIcon icon={faClock} style={{ color: '#4169E1', fontSize: '0.85rem' }} />
      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B', letterSpacing: '0.5px' }}>
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
};

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminName] = useState(localStorage.getItem("adminName") || "Administrator");
  const [chartView, setChartView] = useState('Daily');
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  const isTablet = screenWidth <= 1024;
  const isMobile = screenWidth <= 640;
  
  const [stats, setStats] = useState([
    { label: "Patients", value: "0", icon: faFileMedical, color: "card--blue", path: "/patients", trend: "+12%" },
    { label: "Appointments", value: "0", icon: faCalendarAlt, color: "card--purple", path: "/appointments", trend: "+5%" },
    { label: "Census", value: "0", icon: faUsers, color: "card--orange", path: "/census", trend: "+8%" },
    { label: "Alerts", value: "0", icon: faBullhorn, color: "card--red", path: "/announcements", trend: "Active" },
  ]);

  const [morbidity, setMorbidity] = useState([]);
  const [purokData, setPurokData] = useState([]);
  const [demographicData, setDemographicData] = useState([]);
  const [programData, setProgramBreakdown] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [yearlyTrend, setYearlyTrend] = useState([]);
  const [rawEvents, setRawEvents] = useState([]);
  const [rawSchedules, setRawSchedules] = useState([]);
  const [rawAppointments, setRawAppointments] = useState([]);
  const [medicalStats, setMedicalStats] = useState({ totalPatients: 0, consultations: 0, prescriptions: 0, immunizations: 0, labResults: 0 });
  const [topDiseases, setTopDiseases] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);

  const hasValue = (arr, key) => Array.isArray(arr) && arr.some((item) => Number(item?.[key]) > 0);

  const dailyFallback = [
    { date: "Mon", visits: 2 }, { date: "Tue", visits: 3 }, { date: "Wed", visits: 4 },
    { date: "Thu", visits: 3 }, { date: "Fri", visits: 5 }, { date: "Sat", visits: 4 }, { date: "Sun", visits: 3 }
  ];

  const monthlyFallback = [
    { month: "Jan", visits: 12 }, { month: "Feb", visits: 16 }, { month: "Mar", visits: 14 },
    { month: "Apr", visits: 18 }, { month: "May", visits: 21 }, { month: "Jun", visits: 19 },
    { month: "Jul", visits: 22 }, { month: "Aug", visits: 24 }, { month: "Sep", visits: 20 },
    { month: "Oct", visits: 25 }, { month: "Nov", visits: 23 }, { month: "Dec", visits: 26 }
  ];

  const yearlyFallback = [
    { year: (new Date().getFullYear() - 4).toString(), visits: 95 },
    { year: (new Date().getFullYear() - 3).toString(), visits: 122 },
    { year: (new Date().getFullYear() - 2).toString(), visits: 145 },
    { year: (new Date().getFullYear() - 1).toString(), visits: 171 },
    { year: new Date().getFullYear().toString(), visits: 186 }
  ];

  const simplifyDiagnosisLabel = (label = "") => {
    const text = String(label).toLowerCase();
    if (text.includes("hypertension") || text.includes("high blood")) return "High Blood Pressure";
    if (text.includes("diabetes") || text.includes("blood sugar")) return "High Blood Sugar";
    if (text.includes("respiratory") || text.includes("asthma") || text.includes("cough")) return "Breathing Problem";
    if (text.includes("fever") || text.includes("flu") || text.includes("cold")) return "Fever / Flu";
    if (text.includes("pregnan") || text.includes("prenatal")) return "Pregnancy Care";
    if (text.includes("immun") || text.includes("vaccine")) return "Vaccination";
    if (text.includes("consult") || text.includes("check") || text.includes("follow")) return "General Checkup";
    return label;
  };

  const getTrend = (history = []) => {
    if (!Array.isArray(history) || history.length < 2) return { up: true, text: "0%" };
    const prev = Number(history[history.length - 2]) || 0;
    const curr = Number(history[history.length - 1]) || 0;
    if (prev === 0) return { up: curr >= prev, text: `${curr > 0 ? 100 : 0}%` };
    const pct = Math.round(((curr - prev) / prev) * 100);
    return { up: pct >= 0, text: `${Math.abs(pct)}%` };
  };

  const getTrendValue = (curr, prev) => {
    if (!curr || !prev) return 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const apiBase = "https://chesmssystemfinal-production.up.railway.app/api";
    try {
      const endpoints = [
        `${apiBase}/records`,
        `${apiBase}/events`,
        `${apiBase}/patients`,
        `${apiBase}/announcements`,
        `${apiBase}/schedules`,
        `${apiBase}/residents`,
        `${apiBase}/appointments`
      ];

      const results = await Promise.allSettled(endpoints.map(url => axios.get(url)));
      
      const [recRes, evtRes, patRes, annRes, schRes, resRes, apptRes] = results.map(r => 
        r.status === 'fulfilled' ? r.value.data : []
      );

      const records = recRes || [];
      const events = evtRes || [];
      const patients = patRes || [];
      const residents = resRes || [];
      const schedules = schRes || [];
      const announcements = annRes || [];
      const appointments = apptRes || [];

      setRawEvents(events);
      setRawSchedules(schedules);
      setRawAppointments(appointments);

      // 1. Purok Density - Removed slice(0, 5) to show all puroks as requested
      const pMap = {};
      residents.forEach(r => { 
        if (r.purok) {
          const p = `Purok ${r.purok}`; 
          pMap[p] = (pMap[p] || 0) + 1; 
        }
      });
      setPurokData(Object.entries(pMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value));

      // 2. Patient Profiles - Enhanced with descriptive age ranges
      const ageGroups = { 
        'Pediatric (0-12)': 0, 
        'Teen (13-19)': 0, 
        'Adult (20-59)': 0, 
        'Senior (60+)': 0 
      };
      patients.forEach(p => {
        const a = p.age || 0;
        if (a <= 12) ageGroups['Pediatric (0-12)']++;
        else if (a <= 19) ageGroups['Teen (13-19)']++;
        else if (a <= 59) ageGroups['Adult (20-59)']++;
        else ageGroups['Senior (60+)']++;
      });
      setDemographicData(Object.entries(ageGroups).map(([name, value]) => ({ name, value })));

      // 3. Morbidity (Top Health Concerns)
      const sMap = {};
      records.forEach(r => { const d = r.diagnosis || "Checkup"; sMap[d] = (sMap[d] || 0) + 1; });
      setMorbidity(Object.entries(sMap).map(([name, count]) => ({ name: simplifyDiagnosisLabel(name), count })).sort((a,b) => b.count - a.count).slice(0, 5));

      // 4. Program Share
      const totalCount = records.length || 1;
      const preCount = schedules.filter(s => s.scheduleType === 'Prenatal' && (s.status === 'Confirmed' || s.status === 'Completed')).length;
      const vacCount = schedules.filter(s => (s.scheduleType === 'Immunization' || s.service?.toLowerCase().includes('vaccine')) && (s.status === 'Confirmed' || s.status === 'Completed')).length;
      setProgramBreakdown([
        { name: 'Prenatal', value: Math.round((preCount/totalCount)*100), color: '#EC4899' },
        { name: 'Vaccine', value: Math.round((vacCount/totalCount)*100), color: '#8B5CF6' },
        { name: 'General', value: Math.max(0, 100 - (Math.round((preCount/totalCount)*100) + Math.round((vacCount/totalCount)*100))), color: '#4169E1' }
      ]);

      // 5. Stats Cards
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);
      
      const totalSchedules = schedules.length
      const todaySchedules = schedules.filter(s => {
        if (!s.date) return false
        const d = new Date(s.date)
        d.setHours(0,0,0,0)
        return d.getTime() === todayStart.getTime()
      }).length
      
      const totalAppts = totalSchedules + appointments.length
      
      setStats(prev => {
        const prevVal = prev[1]?.value ? parseInt(String(prev[1].value).replace(/,/g, '')) || 0 : 0
        const diff = totalAppts - prevVal
        const trendPct = prevVal > 0 ? Math.round((diff / prevVal) * 100) : (diff > 0 ? 100 : 0)
        const trendStr = trendPct >= 0 ? `+${trendPct}%` : `${trendPct}%`
        
        return [
          { ...prev[0], value: records.length.toString() },
          { ...prev[1], value: totalAppts.toString(), trend: trendStr },
          { ...prev[2], value: residents.length.toString() },
          { ...prev[3], value: announcements.length.toString() },
        ]
      });

      // 6. Trends
      const now = new Date();
      const last7 = [...Array(7)].map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), visits: 0, ts: d.setHours(0,0,0,0) };
      });
      records.forEach(r => {
        const d = new Date(r.createdAt || r.date || now).setHours(0,0,0,0);
        const m = last7.find(x => x.ts === d); if(m) m.visits++;
      });
      setDailyTrend(last7);

      const last12 = [...Array(12)].map((_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
        return { month: d.toLocaleString('en-US', { month: 'short' }), visits: 0, key: `${d.getFullYear()}-${d.getMonth()}` };
      });
      records.forEach(r => {
        const d = new Date(r.createdAt || r.date || now);
        const m = last12.find(x => x.key === `${d.getFullYear()}-${d.getMonth()}`); if(m) m.visits++;
      });
      setMonthlyTrend(last12);

      const last5 = [...Array(5)].map((_, i) => ({ year: (now.getFullYear() - (4 - i)).toString(), visits: 0 }));
      records.forEach(r => {
        const y = new Date(r.createdAt || r.date || now).getFullYear().toString();
        const m = last5.find(x => x.year === y); if(m) m.visits++;
      });
      setYearlyTrend(last5);

      // 7. Medical Records Stats from API data (records from /api/records)
      const mTotal = records.length;
      const mConsultations = records.reduce((sum, r) => sum + (r.consultations?.length || 0), 0);
      const mPrescriptions = records.reduce((sum, r) => sum + (r.prescriptions?.length || 0), 0);
      const mImmunizations = records.reduce((sum, r) => sum + (r.immunizations?.length || 0), 0);
      const mLabResults = records.reduce((sum, r) => sum + (r.labResults?.length || 0), 0);
      setMedicalStats({
        totalPatients: mTotal,
        consultations: mConsultations,
        prescriptions: mPrescriptions,
        immunizations: mImmunizations,
        labResults: mLabResults
      });

      // 8. Top Diseases from Medical Records
      const diseaseMap = {};
      records.forEach(r => {
        r.consultations?.forEach(c => {
          const d = c.diagnosis || "General Checkup";
          diseaseMap[d] = (diseaseMap[d] || 0) + 1;
        });
      });
      const topDiseasesData = Object.entries(diseaseMap)
        .map(([name, count]) => ({ name: simplifyDiagnosisLabel(name), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopDiseases(topDiseasesData.length > 0 ? topDiseasesData : [{ name: 'No Data', count: 0 }]);

      // 9. Category Distribution (OPD, Prenatal, Pediatric, Senior, Emergency)
      const catCounts = { OPD: 0, Prenatal: 0, Pediatric: 0, Senior: 0, Emergency: 0 };
      records.forEach(r => {
        if (catCounts[r.category] !== undefined) catCounts[r.category]++;
      });
      setCategoryDistribution([
        { name: 'OPD', value: catCounts.OPD, color: '#4169E1' },
        { name: 'Prenatal', value: catCounts.Prenatal, color: '#EC4899' },
        { name: 'Pediatric', value: catCounts.Pediatric, color: '#10B981' },
        { name: 'Senior', value: catCounts.Senior, color: '#F59E0B' },
        { name: 'Emergency', value: catCounts.Emergency, color: '#EF4444' }
      ]);

    } catch (err) {
      console.error("DASHBOARD_FATAL_ERROR:", err.message);
      setDailyTrend(dailyFallback);
      setMonthlyTrend(monthlyFallback);
      setYearlyTrend(yearlyFallback);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const activeTrendDataRaw = chartView === 'Daily' ? dailyTrend : (chartView === 'Monthly' ? monthlyTrend : yearlyTrend);
  const activeTrendData = hasValue(activeTrendDataRaw, 'visits')
    ? activeTrendDataRaw
    : (chartView === 'Daily' ? dailyFallback : chartView === 'Monthly' ? monthlyFallback : yearlyFallback);
  
  const morbidityData = morbidity.length > 0 ? morbidity : [{ name: 'No Data', count: 0 }];
  const profileData = demographicData.length > 0 ? demographicData : [
    { name: 'Pediatric', value: 0 }, { name: 'Teen', value: 0 }, { name: 'Adult', value: 0 }, { name: 'Senior', value: 0 }
  ];
  const densityData = purokData.length > 0 ? purokData : [{ name: 'No Data', value: 0 }];
  const programShareData = hasValue(programData, 'value') ? programData : [
    { name: 'Prenatal', value: 34, color: '#EC4899' },
    { name: 'Vaccine', value: 33, color: '#8B5CF6' },
    { name: 'General', value: 33, color: '#4169E1' }
  ];

  const statGradients = {
    "card--blue": "linear-gradient(135deg, #4169E1, #2563EB)",
    "card--purple": "linear-gradient(135deg, #8B5CF6, #A855F7)",
    "card--orange": "linear-gradient(135deg, #F59E0B, #F97316)",
    "card--emerald": "linear-gradient(135deg, #10B981, #059669)",
    "card--red": "linear-gradient(135deg, #EF4444, #DC2626)"
  };

  const ui = {
    shell: { maxWidth: '1400px', margin: '0 auto', width: '100%' },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: screenWidth < 1100 ? '1fr' : 'minmax(0, 1fr) 360px',
      gap: isMobile ? '1rem' : '1.75rem',
      alignItems: 'start'
    },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '0.75rem' : '1.25rem',
      marginBottom: isMobile ? '1.25rem' : '2rem'
    },
    statCard: {
      padding: isMobile ? '1rem' : '1.25rem',
      borderRadius: isMobile ? '16px' : '24px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: isMobile ? '110px' : '140px',
      cursor: 'pointer',
      boxShadow: 'var(--shadow)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    reportCard: {
      background: 'white',
      padding: isMobile ? '1.25rem' : '1.5rem',
      borderRadius: '24px',
      border: '1px solid #E2E8F0',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: isMobile ? '220px' : '280px',
      maxWidth: '100%',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    analyticalGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: isMobile ? '1rem' : '1.25rem',
      marginTop: isMobile ? '1rem' : '1.25rem'
    },
    chartBox: {
      height: isMobile ? '150px' : '190px',
      width: '100%',
      minWidth: 0,
      marginTop: 'auto'
    },
    viewPill: (active) => ({
      padding: isMobile ? '4px 8px' : '6px 12px',
      borderRadius: '10px',
      border: 'none',
      fontSize: isMobile ? '0.65rem' : '0.7rem',
      fontWeight: 800,
      cursor: 'pointer',
      background: active ? 'white' : 'transparent',
      color: active ? '#4169E1' : '#64748B',
      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
      transition: 'all 0.2s ease'
    })
  };

  return (
    <Layout
      title={
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>Hi, {adminName.split(' ')[0]}</span>
            <span style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', animation: 'wave 2s infinite' }}>👋</span>
          </div>
        </div>
      }
      subtitle={<div style={{ marginTop: '12px' }}><DigitalClock /></div>}
      actions={
        <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
          <button className="button button--secondary glass-effect" onClick={fetchDashboardData} disabled={loading} style={{ flex: isMobile ? 1 : 'none', height: '42px', borderRadius: '12px', fontSize: '0.85rem' }}>
            <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh
          </button>
          <button className="button button--primary" onClick={() => navigate('/patients')} style={{ flex: isMobile ? 1 : 'none', height: '42px', borderRadius: '12px', fontSize: '0.85rem', boxShadow: '0 8px 16px -4px rgba(65, 105, 225, 0.4)' }}>
            <FontAwesomeIcon icon={faPlus} /> New Patient
          </button>
        </div>
      }
    >
      <div style={ui.shell}>
        {/* 1. TOP STATS */}
        <section className="animate-fade-in" style={ui.statsRow}>
          {stats.map((s, i) => (
            <div key={i} className="hover-reveal" onClick={() => navigate(s.path)} style={{ 
              ...ui.statCard, 
              background: statGradients[s.color] || statGradients['card--blue']
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ background: 'rgba(255,255,255,0.25)', width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '0.85rem' : '1rem' }}><FontAwesomeIcon icon={s.icon} /></div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: isMobile ? '0.6rem' : '0.65rem', fontWeight: 900, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '6px', display: 'inline-block' }}>{s.trend}</div>
                  <MiniSparkline data={dailyTrend} />
                </div>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <p style={{ margin: 0, fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.85, letterSpacing: '0.5px' }}>{s.label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, letterSpacing: '-1px' }}>{loading ? "..." : s.value}</h2>
                  <FontAwesomeIcon icon={s.trend?.startsWith('+') ? faArrowUp : faArrowDown} style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '4px' }} />
                </div>
              </div>
              {/* Decorative background circle */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
            </div>
          ))}
        </section>

        {/* Medical Records Stats */}
        <section style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEF2FF', color: '#4169E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faFileMedical} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>Medical Records Overview</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/medical-history')}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#4169E1' }}>{medicalStats.totalPatients}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total Patients</div>
            </div>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10B981' }}>{medicalStats.consultations}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Consultations</div>
            </div>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8B5CF6' }}>{medicalStats.prescriptions}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Prescriptions</div>
            </div>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F59E0B' }}>{medicalStats.immunizations}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Immunizations</div>
            </div>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0EA5E9' }}>{medicalStats.labResults}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Lab Results</div>
            </div>
          </div>
        </section>

        <div style={ui.dashboardGrid}>
          <div className="animate-fade-in">
            {/* Main Utilization Chart */}
            <div className="hover-reveal" style={{ ...ui.reportCard, height: 'auto', minHeight: isMobile ? '320px' : '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="glass-effect" style={{ width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', borderRadius: '12px', background: '#EEF2FF', color: '#4169E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}><FontAwesomeIcon icon={faChartLine} /></div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: isMobile ? '0.9rem' : '1.1rem', fontWeight: 900, color: '#0F172A' }}>Service Utilization</h3>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Tracking health center activity levels</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
                  {['Daily', 'Monthly', 'Yearly'].map(view => (
                    <button key={view} onClick={() => setChartView(view)} style={ui.viewPill(chartView === view)}>{view.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div style={{ height: isMobile ? 220 : 300, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeTrendData} margin={{left: isMobile ? -30 : -20, right: 10, top: 10}}>
                    <defs>
                      <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4169E1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4169E1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey={chartView === 'Daily' ? 'date' : (chartView === 'Monthly' ? 'month' : 'year')} axisLine={false} tickLine={false} tick={{fontSize: isMobile ? 9 : 10, fontWeight: 700, fill: '#94A3B8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: isMobile ? 9 : 10, fill: '#94A3B8'}} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: '12px', fontWeight: 700, padding: '12px'}}
                      cursor={{stroke: '#4169E1', strokeWidth: 2, strokeDasharray: '5 5'}}
                    />
                    <Area type="monotone" dataKey="visits" stroke="#4169E1" strokeWidth={3} fill="url(#colorV)" isAnimationActive={true} animationDuration={1000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={ui.analyticalGrid}>
              <div className="hover-reveal" style={ui.reportCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDF4', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FontAwesomeIcon icon={faUsers} /></div>
                  <span style={{ fontWeight: 900, fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#0F172A' }}>Census Demographics</span>
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Age group distribution of residents.</p>
                <div style={ui.chartBox}>
                  {hasValue(profileData, 'value') ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profileData} margin={{bottom: 5, top: 20}}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: isMobile ? 7 : 8, fontWeight: 700, fill: '#475569'}} dy={5} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                        <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} barSize={isMobile ? 20 : 24} isAnimationActive={true}>
                          <LabelList dataKey="value" position="top" style={{ fill: '#64748B', fontSize: '10px', fontWeight: 800 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700 }}>No profile data</div>
                  )}
                </div>
              </div>

<div className="hover-reveal" style={ui.reportCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0F9FF', color: '#4169E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FontAwesomeIcon icon={faNotesMedical} /></div>
                  <span style={{ fontWeight: 900, fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#0F172A' }}>Program Share</span>
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Distribution of medical services.</p>
                <div style={{ ...ui.chartBox, display: 'flex', alignItems: 'center', flexDirection: 'row', gap: isMobile ? '0.5rem' : 0 }}>
                  <div style={{ width: isMobile ? '50%' : '55%', height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={programShareData} innerRadius={isMobile ? 35 : 45} outerRadius={isMobile ? 55 : 65} paddingAngle={8} dataKey="value" isAnimationActive={true}>
                          {programShareData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ width: isMobile ? '50%' : '45%', paddingLeft: isMobile ? '4px' : '10px' }}>
                    {programShareData.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: 800, marginBottom: '8px', color: '#334155' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }}></span>
                        <span>{p.name}: {p.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hover-reveal" style={ui.reportCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDF4', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FontAwesomeIcon icon={faUsers} /></div>
                  <span style={{ fontWeight: 900, fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#0F172A' }}>Patient Profiles</span>
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Age demographics overview.</p>
                <div style={ui.chartBox}>
                  {hasValue(profileData, 'value') ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profileData} margin={{bottom: 5, top: 20}}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: isMobile ? 7 : 8, fontWeight: 700, fill: '#475569'}} dy={5} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                        <Bar dataKey="value" fill="#0EA5E9" radius={[6, 6, 0, 0]} barSize={isMobile ? 20 : 24} isAnimationActive={true}>
                          {/* Label added to show counts on top of bars */}
                          <LabelList dataKey="value" position="top" style={{ fill: '#64748B', fontSize: '10px', fontWeight: 800 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700 }}>No profile data</div>
                  )}
                </div>
              </div>

              <div className="hover-reveal" style={ui.reportCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FontAwesomeIcon icon={faMapMarkerAlt} /></div>
                  <span style={{ fontWeight: 900, fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#0F172A' }}>Patient Categories</span>
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Distribution by category type.</p>
                <div style={{ ...ui.chartBox, display: 'flex', alignItems: 'center', flexDirection: 'row', gap: isMobile ? '0.5rem' : 0 }}>
                  <div style={{ width: isMobile ? '50%' : '55%', height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryDistribution} innerRadius={isMobile ? 25 : 35} outerRadius={isMobile ? 45 : 55} paddingAngle={5} dataKey="value" isAnimationActive={true}>
                          {categoryDistribution.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ width: isMobile ? '50%' : '45%', paddingLeft: isMobile ? '4px' : '10px' }}>
                    {categoryDistribution.filter(c => c.value > 0).map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: 800, marginBottom: '6px', color: '#334155' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }}></span>
                        <span>{p.name}: {p.value}</span>
                      </div>
                    ))}
                    {categoryDistribution.every(c => c.value === 0) && (
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>No data</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="hover-reveal" style={ui.reportCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FontAwesomeIcon icon={faStethoscope} /></div>
                  <span style={{ fontWeight: 900, fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#0F172A' }}>Top Diseases</span>
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Most common diagnoses in records.</p>
                <div style={ui.chartBox}>
                  {hasValue(topDiseases, 'count') ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topDiseases} layout="vertical" margin={{left: isMobile ? -25 : -15, right: 20}}>
                        <XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: isMobile ? 7 : 8, fontWeight: 700, fill: '#475569'}} width={isMobile ? 85 : 100} />
                        <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)'}} />
                        <Bar dataKey="count" fill="#EF4444" radius={[0, 6, 6, 0]} barSize={isMobile ? 10 : 12} isAnimationActive={true} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, gap: '8px' }}>
                      <FontAwesomeIcon icon={faSync} style={{ opacity: 0.5 }} /> No data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.25rem' : '1.75rem' }}>
            <div className="glass-effect" style={{ ...ui.reportCard, background: 'linear-gradient(135deg, #1E293B, #0F172A)', border: 'none', color: 'white', minHeight: 'auto', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, letterSpacing: '0.5px' }}>Command Center</h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Fast tracks for your daily workflow.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                {[
                  { label: "Medical Records", icon: faFileMedical, color: "#4169E1", path: "/medical-history" },
                  { label: "Schedule", icon: faCalendarAlt, color: "#10B981", path: "/appointments" },
                  { label: "Census", icon: faUsers, color: "#638EF1", path: "/census" },
                  { label: "Alerts", icon: faBullhorn, color: "#F87171", path: "/announcements" }
                ].map((item, idx) => (
                  <button key={idx} className="button interactive-item" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: isMobile ? '10px' : '14px', fontSize: isMobile ? '0.7rem' : '0.8rem', borderRadius: '16px', minHeight: isMobile ? '70px' : '85px', flexDirection: 'column', gap: '6px' }} onClick={() => navigate(item.path)}>
                    <FontAwesomeIcon icon={item.icon} style={{ color: item.color, fontSize: '1.1rem' }} />
                    <span style={{ fontWeight: 700 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Calendar events={rawEvents} schedules={rawSchedules} appointments={rawAppointments} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
