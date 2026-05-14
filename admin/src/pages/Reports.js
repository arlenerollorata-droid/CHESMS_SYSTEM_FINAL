import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPrint, faFileCsv, faUsers, faStethoscope,
  faBaby, faSyringe, faChartLine, faNotesMedical,
  faHeartPulse, faCapsules, faUserNurse,
  faCalendarCheck, faVirus, faCheckCircle, faExclamationCircle,
  faClock, faArrowTrendUp, faArrowTrendDown,
  faDisease, faFirstAid, faHandHoldingMedical
} from "@fortawesome/free-solid-svg-icons";

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '12px 16px', 
        border: '1px solid #E2E8F0', 
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        fontSize: '0.8rem'
      }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: 900, color: '#1E293B' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, color: entry.color || entry.stroke, fontWeight: 700 }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
  <div style={{ 
    background: 'white', 
    padding: '1.25rem', 
    borderRadius: '16px', 
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>{title}</span>
      <div style={{ 
        width: '32px', 
        height: '32px', 
        borderRadius: '10px', 
        background: `${color}15`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: color
      }}>
        <FontAwesomeIcon icon={icon} />
      </div>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A' }}>{value}</div>
    {trend !== undefined && (
      <div style={{ 
        fontSize: '0.65rem', 
        fontWeight: 700, 
        color: trend >= 0 ? '#10B981' : '#EF4444',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <FontAwesomeIcon icon={trend >= 0 ? faArrowTrendUp : faArrowTrendDown} />
        {Math.abs(trend)}% vs last period
      </div>
    )}
    {subtitle && <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{subtitle}</span>}
  </div>
);

function Reports() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('year');
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalVisits: 0,
    visitTrend: 0,
    totalResidents: 0,
    activeSchedules: 0,
    completedSchedules: 0,
    pendingSchedules: 0,
    cancelledSchedules: 0,
    appointmentsToday: 0,
    monthlyVisits: [],
    serviceStats: [],
    categoryBreakdown: [],
    statusBreakdown: [],
    purokData: [],
    topDiagnoses: [],
    ageGroups: [],
    dailySchedule: []
  });

  const processAllData = useCallback((records, patients, schedules, residents, filterRange) => {
    const now = new Date();
    let filteredRecords = records;
    let filteredSchedules = schedules;
    let prevRecords = [];
    let trafficData = [];

    if (filterRange === 'month') {
      filteredRecords = records.filter(r => {
        const d = new Date(r.lastVisit || r.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      prevRecords = records.filter(r => {
        const d = new Date(r.lastVisit || r.createdAt);
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      });
      filteredSchedules = schedules.filter(s => {
        const d = new Date(s.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (filterRange === 'year') {
      filteredRecords = records.filter(r => new Date(r.lastVisit || r.createdAt).getFullYear() === now.getFullYear());
      prevRecords = records.filter(r => new Date(r.lastVisit || r.createdAt).getFullYear() === now.getFullYear() - 1);
      filteredSchedules = schedules.filter(s => new Date(s.date).getFullYear() === now.getFullYear());
    } else {
      filteredRecords = records;
      filteredSchedules = schedules;
    }

    const trend = prevRecords.length === 0 ? 0 : Math.round(((filteredRecords.length - prevRecords.length) / prevRecords.length) * 100);

    if (filterRange === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      trafficData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const count = filteredRecords.filter(r => new Date(r.lastVisit || r.createdAt).getDate() === day).length;
        return { name: `Day ${day}`, visits: count };
      });
    } else if (filterRange === 'year') {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      trafficData = months.map((m, i) => ({
        name: m,
        visits: filteredRecords.filter(r => new Date(r.lastVisit || r.createdAt).getMonth() === i).length
      }));
    } else {
      const years = [...new Set(records.map(r => new Date(r.lastVisit || r.createdAt).getFullYear()))].sort();
      trafficData = years.map(y => ({
        name: y.toString(),
        visits: records.filter(r => new Date(r.lastVisit || r.createdAt).getFullYear() === y).length
      }));
    }

    const serviceCounts = {};
    filteredSchedules.forEach(s => {
      const svc = s.service || 'Other';
      serviceCounts[svc] = (serviceCounts[svc] || 0) + 1;
    });
    const serviceStats = Object.entries(serviceCounts)
      .map(([name, value]) => ({ name, value, color: getServiceColor(name) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const categoryCounts = {};
    filteredRecords.forEach(r => {
      const cat = r.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value, color: getCategoryColor(name) }))
      .sort((a, b) => b.value - a.value);

    const statusCounts = {};
    filteredSchedules.forEach(s => {
      const status = s.status || 'Pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const statusBreakdown = Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value, color: getStatusColor(name) }));

    const diagnosisCounts = {};
    filteredRecords.forEach(r => {
      const diag = r.consultations?.[0]?.diagnosis || r.chiefComplaint || 'General Visit';
      diagnosisCounts[diag] = (diagnosisCounts[diag] || 0) + 1;
    });
    const topDiagnoses = Object.entries(diagnosisCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const ageGroups = { '0-12': 0, '13-19': 0, '20-39': 0, '40-59': 0, '60+': 0 };
    patients.forEach(p => {
      const age = p.age || 0;
      if (age <= 12) ageGroups['0-12']++;
      else if (age <= 19) ageGroups['13-19']++;
      else if (age <= 39) ageGroups['20-39']++;
      else if (age <= 59) ageGroups['40-59']++;
      else ageGroups['60+']++;
    });
    const ageGroupData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));

    const purokCounts = {};
    residents.forEach(r => {
      const purok = r.purok ? `Purok ${r.purok}` : 'Not Specified';
      purokCounts[purok] = (purokCounts[purok] || 0) + 1;
    });
    const purokData = Object.entries(purokCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySchedules = schedules.filter(s => {
      const d = new Date(s.date);
      return d >= today && d < tomorrow;
    });

    const activeSchedules = filteredSchedules.filter(s => s.status === 'In Progress' || s.status === 'Confirmed').length;
    const completedSchedules = filteredSchedules.filter(s => s.status === 'Confirmed' || s.status === 'Completed').length;
    const pendingSchedules = filteredSchedules.filter(s => s.status === 'Pending').length;
    const cancelledSchedules = filteredSchedules.filter(s => s.status === 'Cancelled').length;

    setStats({
      totalPatients: patients.length,
      totalVisits: filteredRecords.length,
      visitTrend: trend,
      totalResidents: residents.length,
      activeSchedules,
      completedSchedules,
      pendingSchedules,
      cancelledSchedules,
      appointmentsToday: todaySchedules.length,
      monthlyVisits: trafficData,
      serviceStats,
      categoryBreakdown,
      statusBreakdown,
      purokData,
      topDiagnoses,
      ageGroups: ageGroupData,
      dailySchedule: todaySchedules.map(s => ({
        id: s._id,
        patient: s.patientName || 'Unknown',
        service: s.service,
        time: s.time || 'N/A',
        status: s.status
      }))
    });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recRes, patRes, schRes, resRes] = await Promise.allSettled([
        axios.get("http://localhost:5000/api/records"),
        axios.get("http://localhost:5000/api/patients"),
        axios.get("http://localhost:5000/api/schedules"),
        axios.get("http://localhost:5000/api/residents")
      ]);
      
      const records = recRes.status === 'fulfilled' ? recRes.value.data : [];
      const patients = patRes.status === 'fulfilled' ? patRes.value.data : [];
      const schedules = schRes.status === 'fulfilled' ? schRes.value.data : [];
      const residents = resRes.status === 'fulfilled' ? resRes.value.data : [];
      
      processAllData(records, patients, schedules, residents, filter);
    } catch (err) {
      console.error("Error fetching data:", err);
      processAllData([], [], [], [], filter);
    } finally {
      setLoading(false);
    }
  }, [filter, processAllData]);

  useEffect(() => { fetchData(); }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchData();
  };

  const escapeCSVValue = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const downloadCSV = () => {
    const rows = [];
    
    // Header section
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    rows.push([escapeCSVValue("BARANGAY HEALTH CENTER")]);
    rows.push([escapeCSVValue("Community Health and Electronic Medical System (CHESMS)")]);
    rows.push([]);
    rows.push([escapeCSVValue(`CLINIC REPORT - ${activeTab.toUpperCase()}`)]);
    rows.push([escapeCSVValue(`Generated: ${dateStr} at ${timeStr}`)]);
    rows.push([escapeCSVValue(`Period Filter: ${filter === 'all' ? 'All Time' : filter === 'year' ? 'This Year' : 'This Month'}`)]);
    rows.push([]);

    if (activeTab === 'overview') {
      rows.push([escapeCSVValue("== SUMMARY STATISTICS ==")]);
      rows.push([escapeCSVValue("Metric"), escapeCSVValue("Value")]);
      rows.push([escapeCSVValue("Total Registered Patients"), stats.totalPatients]);
      rows.push([escapeCSVValue("Total Resident Base"), stats.totalResidents]);
      rows.push([escapeCSVValue("Total Consultations/Visits"), stats.totalVisits]);
      rows.push([escapeCSVValue("Active Schedules"), stats.activeSchedules]);
      rows.push([escapeCSVValue("Confirmed Schedules"), stats.completedSchedules]);
      rows.push([escapeCSVValue("Pending Schedules"), stats.pendingSchedules]);
      rows.push([escapeCSVValue("Cancelled Schedules"), stats.cancelledSchedules]);
      rows.push([escapeCSVValue("Today's Appointments"), stats.appointmentsToday]);
      rows.push([]);
      rows.push([escapeCSVValue("== VISIT TREND ==")]);
      rows.push([escapeCSVValue("Period"), escapeCSVValue("Number of Visits")]);
      stats.monthlyVisits.forEach(v => rows.push([escapeCSVValue(v.name), v.visits]));
      rows.push([]);
      rows.push([escapeCSVValue("== CATEGORY BREAKDOWN ==")]);
      rows.push([escapeCSVValue("Category"), escapeCSVValue("Count"), escapeCSVValue("Percentage")]);
      stats.categoryBreakdown.forEach(c => {
        const pct = stats.totalVisits > 0 ? ((c.value / stats.totalVisits) * 100).toFixed(1) : 0;
        rows.push([escapeCSVValue(c.name), c.value, escapeCSVValue(`${pct}%`)]);
      });
    } else if (activeTab === 'services') {
      rows.push([escapeCSVValue("== SERVICE DELIVERY STATISTICS ==")]);
      rows.push([escapeCSVValue("Service Type"), escapeCSVValue("Count")]);
      stats.serviceStats.forEach(s => rows.push([escapeCSVValue(s.name), s.value]));
      rows.push([]);
      rows.push([escapeCSVValue("== SCHEDULE STATUS SUMMARY ==")]);
      rows.push([escapeCSVValue("Status"), escapeCSVValue("Count"), escapeCSVValue("Percentage")]);
      const statusTotal = stats.statusBreakdown.reduce((sum, item) => sum + item.value, 0);
      stats.statusBreakdown.forEach(s => {
        const pct = statusTotal > 0 ? ((s.value / statusTotal) * 100).toFixed(1) : 0;
        rows.push([escapeCSVValue(s.name), s.value, escapeCSVValue(`${pct}%`)]);
      });
      rows.push([]);
      rows.push([escapeCSVValue("== ADDITIONAL METRICS ==")]);
      rows.push([escapeCSVValue("Pending Schedules"), stats.pendingSchedules]);
      rows.push([escapeCSVValue("Confirmed Schedules"), stats.completedSchedules]);
      rows.push([escapeCSVValue("Cancelled Schedules"), stats.cancelledSchedules]);
    } else if (activeTab === 'morbidity') {
      rows.push([escapeCSVValue("== MORBIDITY PROFILE ==")]);
      rows.push([escapeCSVValue("Rank"), escapeCSVValue("Diagnosis/Condition"), escapeCSVValue("Count")]);
      stats.topDiagnoses.forEach((d, i) => rows.push([i + 1, escapeCSVValue(d.name), d.count]));
      rows.push([]);
      rows.push([escapeCSVValue("== CATEGORY DISTRIBUTION ==")]);
      rows.push([escapeCSVValue("Category"), escapeCSVValue("Count"), escapeCSVValue("Percentage")]);
      stats.categoryBreakdown.forEach(c => {
        const pct = stats.totalVisits > 0 ? ((c.value / stats.totalVisits) * 100).toFixed(1) : 0;
        rows.push([escapeCSVValue(c.name), c.value, escapeCSVValue(`${pct}%`)]);
      });
    } else if (activeTab === 'appointments') {
      rows.push([escapeCSVValue("== TODAY'S APPOINTMENTS ==")]);
      rows.push([escapeCSVValue("Patient Name"), escapeCSVValue("Service"), escapeCSVValue("Time"), escapeCSVValue("Status")]);
      if (stats.dailySchedule.length > 0) {
        stats.dailySchedule.forEach(s => rows.push([escapeCSVValue(s.patient), escapeCSVValue(s.service), escapeCSVValue(s.time), escapeCSVValue(s.status)]));
      } else {
        rows.push([escapeCSVValue("No appointments scheduled for today")]);
      }
      rows.push([]);
      rows.push([escapeCSVValue("== APPOINTMENT SUMMARY ==")]);
      rows.push([escapeCSVValue("Total Today"), stats.appointmentsToday]);
      rows.push([escapeCSVValue("Pending"), stats.pendingSchedules]);
      rows.push([escapeCSVValue("In Progress"), stats.activeSchedules]);
      rows.push([escapeCSVValue("Confirmed"), stats.completedSchedules]);
    } else if (activeTab === 'demographics') {
      rows.push([escapeCSVValue("== AGE DISTRIBUTION ==")]);
      rows.push([escapeCSVValue("Age Group"), escapeCSVValue("Count"), escapeCSVValue("Percentage")]);
      const ageTotal = stats.ageGroups.reduce((sum, item) => sum + item.value, 0);
      stats.ageGroups.forEach(a => {
        const pct = ageTotal > 0 ? ((a.value / ageTotal) * 100).toFixed(1) : 0;
        rows.push([escapeCSVValue(a.name), a.value, escapeCSVValue(`${pct}%`)]);
      });
      rows.push([]);
      rows.push([escapeCSVValue("== PUROC/BARANGAY DISTRIBUTION ==")]);
      rows.push([escapeCSVValue("Area"), escapeCSVValue("Count"), escapeCSVValue("Percentage")]);
      const purokTotal = stats.purokData.reduce((sum, item) => sum + item.value, 0);
      stats.purokData.forEach(p => {
        const pct = purokTotal > 0 ? ((p.value / purokTotal) * 100).toFixed(1) : 0;
        rows.push([escapeCSVValue(p.name), p.value, escapeCSVValue(`${pct}%`)]);
      });
    }

    // Convert to proper CSV format (comma-separated, with newlines between rows)
    const csvContent = rows.map(row => row.join(',')).join('\n');
    
    // Create downloadable file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BHC_${activeTab}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout 
      title="Clinic Reports" 
      subtitle="Barangay Health Center Analytics"
      actions={
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '12px', padding: '4px', gap: '2px' }}>
            <button onClick={() => handleFilterChange('month')} style={{ 
              padding: '6px 14px', 
              borderRadius: '8px', 
              border: 'none', 
              background: filter === 'month' ? 'white' : 'transparent',
              color: filter === 'month' ? '#4F46E5' : '#64748B',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}>Month</button>
            <button onClick={() => handleFilterChange('year')} style={{ 
              padding: '6px 14px', 
              borderRadius: '8px', 
              border: 'none', 
              background: filter === 'year' ? 'white' : 'transparent',
              color: filter === 'year' ? '#4F46E5' : '#64748B',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}>Year</button>
            <button onClick={() => handleFilterChange('all')} style={{ 
              padding: '6px 14px', 
              borderRadius: '8px', 
              border: 'none', 
              background: filter === 'all' ? 'white' : 'transparent',
              color: filter === 'all' ? '#4F46E5' : '#64748B',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}>All Time</button>
          </div>
          <button onClick={downloadCSV} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            background: 'white',
            color: '#64748B',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}>
            <FontAwesomeIcon icon={faFileCsv} /> Export CSV
          </button>
        </div>
      }
    >
      <style>{`
        .tab-button { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 12px; border: none; background: transparent; color: #64748B; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .tab-button.active { background: #4F46E5; color: white; box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
        @media print { .sidebar, .top-navbar { display: none !important; } }
      `}</style>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <FontAwesomeIcon icon={faChartLine} /> Overview
        </button>
        <button className={`tab-button ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
          <FontAwesomeIcon icon={faFirstAid} /> Services
        </button>
        <button className={`tab-button ${activeTab === 'morbidity' ? 'active' : ''}`} onClick={() => setActiveTab('morbidity')}>
          <FontAwesomeIcon icon={faDisease} /> Morbidity
        </button>
        <button className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
          <FontAwesomeIcon icon={faCalendarCheck} /> Appointments
        </button>
        <button className={`tab-button ${activeTab === 'demographics' ? 'active' : ''}`} onClick={() => setActiveTab('demographics')}>
          <FontAwesomeIcon icon={faUsers} /> Demographics
        </button>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <StatCard title="Patients" value={stats.totalPatients} subtitle="Registered" icon={faUsers} color="#4F46E5" />
              <StatCard title="Residents" value={stats.totalResidents} subtitle="Barangay" icon={faUserNurse} color="#10B981" />
              <StatCard title="Consultations" value={stats.totalVisits} subtitle="This period" icon={faStethoscope} color="#F59E0B" trend={stats.visitTrend} />
              <StatCard title="Active" value={stats.activeSchedules} subtitle="Schedules" icon={faCalendarCheck} color="#8B5CF6" />
              <StatCard title="Confirmed" value={stats.completedSchedules} subtitle="This period" icon={faCheckCircle} color="#06B6D4" />
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E293B', marginBottom: '1rem' }}>
                  <FontAwesomeIcon icon={faChartLine} color="#4F46E5" /> Visit Trend
                </div>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <AreaChart data={stats.monthlyVisits}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 700, fill: '#64748B'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fontWeight: 700, fill: '#64748B'}} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="visits" fill="url(#areaGrad)" stroke="#4F46E5" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E293B', marginBottom: '1rem' }}>
                  <FontAwesomeIcon icon={faHandHoldingMedical} color="#EC4899" /> Patient Categories
                </div>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={stats.categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {stats.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <StatCard title="Pending" value={stats.pendingSchedules} subtitle="Awaiting" icon={faClock} color="#F59E0B" />
              <StatCard title="Active" value={stats.activeSchedules} subtitle="In Progress" icon={faCalendarCheck} color="#8B5CF6" />
              <StatCard title="Confirmed" value={stats.completedSchedules} subtitle="Done" icon={faCheckCircle} color="#10B981" />
              <StatCard title="Cancelled" value={stats.cancelledSchedules} subtitle="Voided" icon={faExclamationCircle} color="#EF4444" />
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E293B', marginBottom: '1rem' }}>
                  <FontAwesomeIcon icon={faFirstAid} color="#10B981" /> Services Delivered
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={stats.serviceStats} layout="vertical" margin={{ left: 120 }}>
                      <XAxis type="number" tick={{fontSize: 11}} axisLine={false} />
                      <YAxis dataKey="name" type="category" tick={{fontSize: 11, fontWeight: 700}} axisLine={false} tickLine={false} width={110} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#10B981" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E293B', marginBottom: '1rem' }}>
                  <FontAwesomeIcon icon={faNotesMedical} color="#4F46E5" /> Schedule Status
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={stats.statusBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                        {stats.statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'morbidity' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E293B', marginBottom: '1rem' }}>
                <FontAwesomeIcon icon={faDisease} color="#EF4444" /> Morbidity Profile (Top Diagnoses)
              </div>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={stats.topDiagnoses} layout="vertical" margin={{ left: 150 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" tick={{fontSize: 11}} />
                    <YAxis dataKey="name" type="category" tick={{fontSize: 11, fontWeight: 700}} width={140} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#EF4444" radius={[0, 6, 6, 0]}>
                      {stats.topDiagnoses.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E293B', marginBottom: '1rem' }}>
                <FontAwesomeIcon icon={faNotesMedical} color="#8B5CF6" /> Category Distribution
              </div>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={stats.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 700, fill: '#64748B'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10, fontWeight: 700, fill: '#64748B'}} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <StatCard title="Today" value={stats.appointmentsToday} subtitle="Scheduled" icon={faCalendarCheck} color="#4F46E5" />
              <StatCard title="Pending" value={stats.pendingSchedules} subtitle="Awaiting" icon={faClock} color="#F59E0B" />
              <StatCard title="In Progress" value={stats.activeSchedules} subtitle="Active" icon={faSyringe} color="#8B5CF6" />
            </section>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E293B', marginBottom: '1rem' }}>
                <FontAwesomeIcon icon={faCalendarCheck} color="#4F46E5" /> Today's Schedule
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.7rem', color: '#64748B', fontWeight: 900, textTransform: 'uppercase' }}>Patient</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.7rem', color: '#64748B', fontWeight: 900, textTransform: 'uppercase' }}>Service</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.7rem', color: '#64748B', fontWeight: 900, textTransform: 'uppercase' }}>Time</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontSize: '0.7rem', color: '#64748B', fontWeight: 900, textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.dailySchedule.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>No appointments today</td></tr>
                    ) : (
                      stats.dailySchedule.map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#1E293B' }}>{s.patient}</td>
                          <td style={{ padding: '12px', color: '#64748B' }}>{s.service}</td>
                          <td style={{ padding: '12px', color: '#64748B' }}>{s.time}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '20px', background: getStatusBg(s.status), color: getStatusColor(s.status), fontSize: '0.7rem', fontWeight: 800 }}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'demographics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E293B', marginBottom: '1rem' }}>
                <FontAwesomeIcon icon={faUsers} color="#EC4899" /> Age Distribution
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={stats.ageGroups}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{fontSize: 11, fontWeight: 700, fill: '#64748B'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 11, fontWeight: 700, fill: '#64748B'}} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#EC4899" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E293B', marginBottom: '1rem' }}>
                <FontAwesomeIcon icon={faUserNurse} color="#10B981" /> Purok Distribution
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.purokData.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>No purok data available</div>
                ) : (
                  stats.purokData.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '12px', background: '#F8FAFC' }}>
                      <span style={{ fontWeight: 700, color: '#1E293B' }}>{p.name}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, color: '#10B981', fontSize: '1.1rem' }}>{p.value}</div>
                        <div style={{ fontSize: '0.6rem', color: '#94A3B8' }}>RESIDENTS</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function getServiceColor(service) {
  const colors = {
    'Prenatal': '#EC4899',
    'Immunization': '#8B5CF6',
    'General Consultation': '#4F46E5',
    'Dental': '#F59E0B',
    'Family Planning': '#06B6D4',
    'NCD': '#EF4444',
    'TB': '#6366F1',
    'Nutrition': '#14B8A6',
    'Laboratory': '#10B981'
  };
  return colors[service] || '#64748B';
}

function getCategoryColor(category) {
  const colors = {
    'OPD': '#4F46E5',
    'Prenatal': '#EC4899',
    'Pediatric': '#10B981',
    'Senior': '#F59E0B',
    'NCD': '#EF4444',
    'Emergency': '#DC2626'
  };
  return colors[category] || '#64748B';
}

function getStatusColor(status) {
  const colors = {
    'Pending': '#F59E0B',
    'Confirmed': '#3B82F6',
    'In Progress': '#8B5CF6',
    'Completed': '#10B981',
    'No-show': '#64748B',
    'Cancelled': '#EF4444'
  };
  return colors[status] || '#64748B';
}

function getStatusBg(status) {
  const bgs = {
    'Pending': '#FEF3C7',
    'Confirmed': '#DBEAFE',
    'In Progress': '#EDE9FE',
    'Completed': '#D1FAE5',
    'No-show': '#F1F5F9',
    'Cancelled': '#FEE2E2'
  };
  return bgs[status] || '#F1F5F9';
}

export default Reports;