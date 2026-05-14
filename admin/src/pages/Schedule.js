import React, { useState, useMemo, useEffect, useRef } from "react"
import axios from "axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight, faPlus, faTimes, faCalendarAlt, faUser, faStethoscope, faSyringe, faBaby, faHeartbeat, faTooth, faUsers, faUserPlus, faLungs, faBone, faExclamationTriangle, faEdit, faTrash, faCheck, faClock } from "@fortawesome/free-solid-svg-icons"
import { Toaster, toast } from "react-hot-toast"
import Layout from "../components/Layout"
import { CASE_CATEGORIES, PROTOCOLS, TIME_SLOTS, URGENCY_LEVELS, APPOINTMENT_STATUS, LOCATIONS, SCHEDULE_TYPES, SERVICE_DURATION } from "../data/appointmentSchema"

const API_URL = "http://localhost:5000/api/schedules"
const APPOINTMENTS_API_URL = "http://localhost:5000/api/appointments"

const CATEGORY_ICONS = {
  'Prenatal': faBaby,
  'Immunization': faSyringe,
  'Pediatric': faHeartbeat,
  'General': faStethoscope,
  'Dental': faTooth,
  'Family Planning': faUsers,
  'Senior': faUserPlus,
  'NCD': faLungs,
  'TB DOTS': faBone,
  'Nutrition': faHeartbeat
}

export default function Schedule() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [residents, setResidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('week')
  const [selected, setSelected] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [serviceType, setServiceType] = useState('Scheduled Appointment')
  const [form, setForm] = useState({
    patientId: '', patientName: '', patientModel: 'Patient', category: '', scheduleType: 'Scheduled Appointment', service: '',
    date: new Date().toISOString().split('T')[0], time: '9:00 AM',
    urgency: 'Normal', location: 'Health Center', notes: ''
  })
  
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [conflictData, setConflictData] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingAppointment, setDeletingAppointment] = useState(null)
  const [showDateSlotsModal, setShowDateSlotsModal] = useState(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null)
  const [selectedDayForList, setSelectedDayForList] = useState(new Date())
  const [filterStatus, setFilterStatus] = useState(null)

  const toDateKey = (value) => {
    if (!value) return ''
    
    // If it's a string from DB (e.g., "2026-05-14T00:00:00.000Z"),
    // split it to get "2026-05-14" regardless of local timezone.
    if (typeof value === 'string') {
      return value.split('T')[0]
    }
    
    // If it's a Date object (from calendar grid)
    if (value instanceof Date) {
      const y = value.getFullYear()
      const m = String(value.getMonth() + 1).padStart(2, '0')
      const d = String(value.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    return ''
  }

  useEffect(() => { fetchAll() }, [])

  // Refresh appointments when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAll()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    if (showModal && !isEditing) {
      setForm(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0]
      }))
    }
  }, [showModal, isEditing])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [s, a, p, r] = await Promise.all([
        axios.get(API_URL), // schedules
        axios.get(APPOINTMENTS_API_URL), // appointments
        axios.get("http://localhost:5000/api/patients"),
        axios.get("http://localhost:5000/api/residents"),
      ])
      
      // Merge schedules and appointments into one list
      // Standardize the data structure for consistent display in the calendar
      const merged = [
        ...s.data.map(item => ({ 
          ...item, 
          dataSource: 'schedule',
          // Normalize 'Completed' → 'Confirmed' for consistent terminology
          status: item.status === 'Completed' ? 'Confirmed' : item.status
        })),
        ...a.data.map(item => ({ 
          ...item, 
          dataSource: 'appointment',
          // Use 'date' field consistently
          date: item.date || item.appointmentDate || item.scheduleDate,
          // Map appointment fields to schedule fields for the UI
          category: item.category || item.type || 'General',
          scheduleType: item.scheduleType || item.type || 'Appointment',
          time: item.time || item.timeSlot || '9:00 AM',
          // Normalize status: appliance schema → unified display values
          // 'Scheduled' maps to 'Pending', 'No Show' maps to 'No-show',
          // 'Completed' maps to 'Confirmed' (replaced terminology)
          status: item.status === 'Scheduled' ? 'Pending' : 
                  item.status === 'No Show' ? 'No-show' : 
                  item.status === 'Completed' ? 'Confirmed' :
                  item.status || 'Pending'
        }))
      ]
      
      // Deduplicate by _id first, then by composite key (patient+date+time)
      // to catch cross-collection duplicates with different _ids
      const seenId = new Set()
      const seenComposite = new Set()
      const deduped = merged.filter(item => {
        if (seenId.has(item._id)) return false
        seenId.add(item._id)
        // Build composite key from patient + date + time for cross-collection dedup
        const patientId = item.patient ? String(item.patient) : ''
        const dateStr = item.date ? String(item.date).split('T')[0] : ''
        const timeStr = item.time || ''
        const compositeKey = `${patientId}|${dateStr}|${timeStr}`
        if (compositeKey !== '||' && seenComposite.has(compositeKey)) return false
        seenComposite.add(compositeKey)
        return true
      })
      
      setAppointments(deduped)
      setPatients(p.data)
      setResidents(r.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const weekDays = useMemo(() => {
    const d = new Date(currentDate), start = new Date(d)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => { const x = new Date(start); x.setDate(x.getDate() + i); return x })
  }, [currentDate])

  const monthDays = useMemo(() => {
    const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const last = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const days = Array.from({ length: first.getDay() }, (_, i) => ({ date: new Date(first.getTime() - (first.getDay() - i) * 864e5), cur: false }))
    days.push(...Array.from({ length: last.getDate() }, (_, i) => ({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1), cur: true })))
    return [...days, ...Array.from({ length: 42 - days.length }, (_, i) => ({ date: new Date(last.getTime() + (i + 1) * 864e5), cur: false }))]
  }, [currentDate])

  // Check if appointment has a valid patient in database
  const hasValidPatient = (appointment) => {
    if (!appointment.patient) return false
    const patientExists = patients.some(p => String(p._id) === String(appointment.patient))
    const residentExists = residents.some(r => String(r._id) === String(appointment.patient))
    return patientExists || residentExists
  }

  const getAppts = (d) => {
    const selectedDateKey = toDateKey(d)
    return appointments.filter(a => {
      if (!a.date) return false
      if (filterStatus && a.status !== filterStatus) return false
      return toDateKey(a.date) === selectedDateKey && a.status !== 'Cancelled'
    }).sort((a, b) => {
      const timeA = a.time || a.timeSlot || ''
      const timeB = b.time || b.timeSlot || ''
      return timeA.localeCompare(timeB)
    })
  }

  const getCaseColor = (cat) => CASE_CATEGORIES[cat]?.color || '#94A3B8'

  // Helper to get patient name from appointment
  const getPatientDisplayName = (appointment) => {
    // Try to find patient in patients list
    if (appointment.patient && patients.length > 0) {
      const patient = patients.find(p => String(p._id) === String(appointment.patient))
      if (patient && patient.name) return patient.name
    }
    
    // Try to find patient in residents list
    if (appointment.patient && residents.length > 0) {
      const resident = residents.find(r => String(r._id) === String(appointment.patient))
      if (resident) {
        const name = `${resident.firstName || ''} ${resident.lastName || ''}`.trim()
        if (name) return name
      }
    }
    
    // If we have a stored name but patient doesn't exist in DB, show as deleted
    if (appointment.patientName) {
      return `${appointment.patientName} (Deleted)`
    }
    
    // Fallback
    return 'Unknown Patient'
  }

  const nav = (v) => { const d = new Date(currentDate); view === 'week' ? d.setDate(d.getDate() + v * 7) : d.setMonth(d.getMonth() + v); setCurrentDate(d) }

  // Helper functions for date validation
  const isWeekendDate = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDay();
    return day === 0 || day === 6; // Sunday=0, Saturday=6
  }

  const isPastDate = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  }

  const isTodayDate = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  }

  const isAfter5PMToday = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const fivePMMinutes = 17 * 60; // 5:00 PM = 1020 minutes
    return currentMinutes >= fivePMMinutes;
  }

  const handleCategoryChange = (cat) => {
    const data = CASE_CATEGORIES[cat]
    setForm({ ...form, category: cat, scheduleType: data.cases[0], service: data.cases[0] })
  }

  const getIsConsecutive = (type) => CASE_CATEGORIES[form.category]?.consecutive && PROTOCOLS[type]

  // Conflict Detection Algorithm
  const checkConflict = (patientId, date, time, excludeId = null) => {
    const appointmentDate = toDateKey(date)
    return appointments.find(a => 
      String(a.patient) === String(patientId) &&
      toDateKey(a.date) === appointmentDate &&
      (a.time === time || a.timeSlot === time) &&
      a._id !== excludeId &&
      a.status !== 'Cancelled'
    )
  }

  // Time Slot Availability Algorithm
  const getTimeSlotStatus = (date) => {
    if (!date) return TIME_SLOTS.map(slot => ({ slot, status: 'vacant', appointment: null }));
    
    // Check if date is weekend or past
    const checkDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);
    
    const isPastDate = checkDate < today;
    const isToday = checkDate.getTime() === today.getTime();
    const isWeekend = checkDate.getDay() === 0 || checkDate.getDay() === 6;
    
    // If past date or weekend, return all slots as past
    if (isPastDate || isWeekend) {
      return TIME_SLOTS.map(slot => ({
        slot,
        status: 'past',
        appointment: null
      }));
    }
    
    // Convert time slot to minutes from midnight
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    
    // Normalize time for comparison
    const normalizeTime = (t) => {
      if (!t) return '';
      return String(t).trim().replace(/\s+/g, ' ').toUpperCase();
    };
    
    const selectedDateStr = toDateKey(date)
    const currentMinutes = today.getHours() * 60 + today.getMinutes();
    const fivePMMinutes = 17 * 60;
    
    const dayAppointments = appointments.filter(a => {
      if (!a.date || !a.time || a.status === 'Cancelled') return false
      return toDateKey(a.date) === selectedDateStr
    })
    
    return TIME_SLOTS.map(slot => {
      const normalizedSlot = normalizeTime(slot);
      const slotMinutes = timeToMinutes(slot);
      
      // Check if time is past (for today)
      const isPastTime = isToday && slotMinutes <= currentMinutes;
      // 5:00 PM is always marked as closed
      const isFivePM = slotMinutes === fivePMMinutes;
      
      const appointment = dayAppointments.find(a => {
        if (!a.time) return false;
        const storedTime = normalizeTime(a.time);
        return storedTime === normalizedSlot;
      })
      
      // Priority: past > closed (5PM) > occupied > vacant
      let status = 'vacant';
      if (isPastTime) {
        status = 'past';
      } else if (isFivePM) {
        status = 'closed';
      } else if (appointment) {
        status = 'occupied';
      }
      
      return {
        slot,
        status,
        appointment: appointment || null
      }
    })
  }

  // Open edit modal
  const openEditModal = (appointment) => {
    if (appointment.status === 'Confirmed') {
      toast.error('Cannot edit a confirmed appointment')
      return
    }
    setIsEditing(true)
    setEditingId(appointment._id)
    setForm({
      patientId: appointment.patient || '',
      patientName: appointment.patientName || '',
      patientModel: appointment.patientModel || 'Patient',
      category: appointment.category || '',
      scheduleType: appointment.scheduleType || 'Scheduled Appointment',
      service: appointment.service || '',
      date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: appointment.time || '9:00 AM',
      urgency: appointment.urgency || 'Normal',
      location: appointment.location || 'Health Center',
      notes: appointment.notes || ''
    })
    setServiceType(appointment.scheduleType || 'Scheduled Appointment')
    setShowModal(true)
    setSelected(null)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deletingAppointment) return
    try {
      const deleteUrl = deletingAppointment.dataSource === 'appointment'
        ? `${APPOINTMENTS_API_URL}/${deletingAppointment._id}`
        : `${API_URL}/${deletingAppointment._id}`
      await axios.delete(deleteUrl)
      toast.success('Appointment deleted successfully')
      await fetchAll()
      setShowDeleteConfirm(false)
      setDeletingAppointment(null)
      setSelected(null)
    } catch (err) {
      await fetchAll()
      const status = err.response?.status
      if (status === 404) {
        toast.error('Appointment not found in database — it may have already been deleted')
      } else {
        toast.error('Error deleting appointment')
      }
    }
  }

  // Helper to convert time to minutes
  const timeToMinutes = (timeStr) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return 0
    let hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    const period = match[3].toUpperCase()
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    return hours * 60 + minutes
  }

  // Submit form (create or update)
  const submitForm = async (e) => {
    e.preventDefault()
    if (submitting || submittingRef.current) return
    submittingRef.current = true
    if (!form.patientId || !form.category || !form.service) { submittingRef.current = false; return toast.error('Please select patient, category, and service') }
    
    // FIXED: Proper date validation
    if (!isEditing) {
      // Get today's date at midnight (no time component)
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      // Check if selected date is in the past (before today)
      if (form.date < todayStr) {
        toast.error('Cannot book appointments for past dates')
        return
      }
      
      // Check if it's today and time has passed 5 PM
      if (form.date === todayStr) {
        const selectedMinutes = timeToMinutes(form.time)
        const fivePMMinutes = 17 * 60 // 5:00 PM in minutes
        
        if (selectedMinutes >= fivePMMinutes) {
          toast.error('Cannot book after 5:00 PM - clinic hours ended')
          return
        }
      }
    }
    
    // Validate patient exists in database
    if (!isEditing) {
      const patientExists = patients.some(p => String(p._id) === String(form.patientId))
      const residentExists = residents.some(r => String(r._id) === String(form.patientId))
      
      if (!patientExists && !residentExists) {
        toast.error('Patient/Resident does not exist in database')
        return
      }
    }
    
    // Conflict Detection
    const conflict = checkConflict(form.patientId, form.date, form.time, isEditing ? editingId : null)
    if (conflict) {
      setConflictData({
        patient: form.patientName,
        existingDate: conflict.date,
        existingTime: conflict.time,
        existingService: conflict.service,
        patientId: form.patientId,
        date: form.date,
        time: form.time
      })
      setShowConflictModal(true)
      return
    }
    
    if (isEditing) {
      await updateAppointment()
    } else {
      await createAppointment()
    }
  }

  // Update appointment
  const updateAppointment = async (force = false) => {
    try {
      const payload = {
        patient: form.patientId,
        patientModel: form.patientModel,
        patientName: form.patientName,
        category: form.category,
        scheduleType: form.scheduleType || serviceType,
        service: form.service,
        date: form.date,
        time: form.time,
        urgency: form.urgency,
        location: form.location,
        notes: form.notes,
        status: 'Pending'
      }

      await axios.put(`${API_URL}/${editingId}`, payload)
      toast.success('Appointment updated successfully')
      fetchAll()
      closeModal()
    } catch {
      fetchAll()
      toast.error('Error updating appointment')
    }
  }

  // Close modal and reset
  const closeModal = () => {
    setShowModal(false)
    setIsEditing(false)
    setEditingId(null)
    setForm({
      patientId: '', patientName: '', patientModel: 'Patient', category: '', scheduleType: 'Scheduled Appointment', service: '',
      date: new Date().toISOString().split('T')[0], time: '9:00 AM',
      urgency: 'Normal', location: 'Health Center', notes: ''
    })
    setServiceType('Scheduled Appointment')
    setShowConflictModal(false)
    setConflictData(null)
  }

  // Export to CSV Algorithm
  const exportToCSV = () => {
    const headers = ['Patient Name', 'Category', 'Service', 'Date', 'Time', 'Location', 'Urgency', 'Status', 'Notes']
    const rows = appointments.map(a => [
      getPatientDisplayName(a) || '',
      a.category || '',
      a.service || '',
      a.date ? new Date(a.date).toLocaleDateString() : '',
      a.time || '',
      a.location || '',
      a.urgency || '',
      a.status || '',
      a.notes || ''
    ])
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `appointments_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const updateStatus = async (id, status, dataSource) => {
    try {
      if (dataSource === 'appointment') {
        await axios.put(`${APPOINTMENTS_API_URL}/${id}`, { status })
      } else {
        await axios.patch(`${API_URL}/${id}/status`, { status })
      }
      fetchAll()
      setSelected(null)
      toast.success('Status updated')
    } catch {
      fetchAll()
      toast.error('Error updating status')
    }
  }

  const createAppointment = async () => {
    setSubmitting(true)
    
    // FINAL VALIDATION - Same as submitForm
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    if (form.date < todayStr) {
      setSubmitting(false)
      submittingRef.current = false
      toast.error('Cannot book appointments for past dates')
      return
    }
    
    if (form.date === todayStr) {
      const selectedMinutes = timeToMinutes(form.time)
      const fivePMMinutes = 17 * 60
      
      if (selectedMinutes >= fivePMMinutes) {
        setSubmitting(false)
        submittingRef.current = false
        toast.error('Cannot book after 5:00 PM - clinic hours ended')
        return
      }
    }
    
    try {
      const payload = {
        patient: form.patientId,
        patientModel: form.patientModel,
        patientName: form.patientName,
        category: form.category,
        scheduleType: form.scheduleType || serviceType,
        service: form.service,
        date: form.date,
        time: form.time,
        urgency: form.urgency,
        location: form.location,
        notes: form.notes,
        status: 'Pending'
      }

      if (getIsConsecutive(form.scheduleType)) {
        const start = new Date(form.date)
        for (const p of PROTOCOLS[form.scheduleType]) {
          const d = new Date(start)
          d.setDate(d.getDate() + p.weeks * 7)
          await axios.post(API_URL, { ...payload, date: d.toISOString().split('T')[0], focus: p.focus })
        }
        toast.success(`Created ${PROTOCOLS[form.scheduleType].length} appointments`)
      } else {
        await axios.post(API_URL, payload)
        toast.success('Appointment created')
      }
      fetchAll()
      closeModal()
    } catch (err) { 
      fetchAll()
      toast.error(err.response?.data?.message || 'Error creating appointment') 
    } finally {
      setSubmitting(false)
      submittingRef.current = false
    }
  }

  const focusedDayAppts = useMemo(() => getAppts(selectedDayForList), [appointments, selectedDayForList, filterStatus])
  const stats = useMemo(() => {
    const list = Array.isArray(appointments) ? appointments : []
    return {
      pending: list.filter(a => a.status === 'Pending').length,
      confirmed: list.filter(a => a.status === 'Confirmed').length,
      total: list.length,
      today: getAppts(new Date()).length
    }
  }, [appointments])

  const getStatusConfig = (status) => APPOINTMENT_STATUS.find(s => s.value === status) || APPOINTMENT_STATUS[0]

  if (loading) return <Layout title="Schedule" subtitle="Loading..."><div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Loading schedules...</div></Layout>

  return (
    <Layout title="Schedule" subtitle="Appointment & scheduling management">
      <Toaster position="top-right" />
      
      <style>{`
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); background: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; }
        .cal-head { background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%); padding: 14px 8px; text-align: center; font-weight: 700; font-size: 0.7rem; color: #475569; border-right: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; }
        .cal-head.today { background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%); color: white; border-color: #1E293B; }
        .cal-cell { background: white; min-height: 120px; padding: 6px; transition: background 0.2s; border-right: 1px solid #F1F5F9; border-bottom: 1px solid #F1F5F9; }
        .cal-cell:hover { background: #FAFBFC; }
        .cal-cell.today { border-left: 4px solid #1E293B; background: #F8FAFC; }
        .apt-item { background: white; border-radius: 8px; padding: 6px 8px; margin-bottom: 4px; font-size: 0.65rem; cursor: pointer; border-left: 3px solid; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .apt-item:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .day-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; background: #F1F5F9; padding: 8px; border-radius: 16px; }
        .day-cell { background: white; min-height: 80px; padding: 6px; border-radius: 10px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; }
        .day-cell:hover { transform: scale(1.02); }
        .day-cell.dim { background: #F8FAFC; }
        .day-cell.dim .dn { color: #CBD5E1; }
        .day-cell.today { border: 2px solid #1E293B; }
        .apt-dot { padding: 2px 6px; border-radius: 4px; font-size: 0.55rem; font-weight: 600; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .apt-dot-more { font-size: 0.55rem; font-weight: 600; color: #64748B; text-align: center; }
        .stat-card { background: white; padding: 16px 20px; border-radius: 14px; border: 1px solid #E2E8F0; transition: all 0.2s; }
        .stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .type-btn { padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 0.75rem; border: 1px solid #E2E8F0; background: white; color: #64748B; cursor: pointer; transition: all 0.2s; }
        .type-btn.active { background: #1E293B; color: white; border-color: #1E293B; }
        .view-toggle-btn { padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 0.75rem; border: none; background: transparent; color: #64748B; cursor: pointer; transition: all 0.2s; }
        .view-toggle-btn.active { background: #1E293B; color: white; border-color: #1E293B; }
        .cat-btn { padding: 14px 10px; border-radius: 12px; border: 2px solid #E2E8F0; background: white; cursor: pointer; transition: all 0.2s; text-align: center; }
        .cat-btn:hover { border-color: #CBD5E1; }
        .cat-btn.active { border-color: currentColor; background: currentColor; }
        .cat-btn.active * { color: white !important; }
        .cat-btn.active .cat-label { color: white !important; }
        .status-btn { padding: 8px 12px; border-radius: 8px; font-weight: 700; font-size: 0.7rem; border: none; cursor: pointer; transition: all 0.2s; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => { closeModal(); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #1E293B, #334155)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(30,41,59,0.3)' }}>
            <FontAwesomeIcon icon={faPlus} /> New Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div className="stat-card" onClick={() => setFilterStatus(filterStatus === 'Pending' ? null : 'Pending')} style={{ cursor: 'pointer', outline: filterStatus === 'Pending' ? '2px solid #F59E0B' : 'none' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#F59E0B' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Pending</div>
        </div>
        <div className="stat-card" onClick={() => setFilterStatus(filterStatus === 'Confirmed' ? null : 'Confirmed')} style={{ cursor: 'pointer', outline: filterStatus === 'Confirmed' ? '2px solid #10B981' : 'none' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10B981' }}>{stats.confirmed}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Confirmed</div>
        </div>
        <div className="stat-card" onClick={() => setFilterStatus(null)} style={{ cursor: 'pointer', outline: filterStatus === null ? '2px solid #6366F1' : 'none' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#6366F1' }}>{stats.total}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Total</div>
        </div>
        <div className="stat-card" onClick={() => { setFilterStatus(null); setCurrentDate(new Date()) }} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EC4899' }}>{stats.today}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Today</div>
        </div>
      </div>

      {filterStatus && (
        <div style={{ marginBottom: '12px', padding: '10px 16px', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#16A34A' }}>Showing: <b>{filterStatus}</b> appointments</span>
          <button onClick={() => setFilterStatus(null)} style={{ background: 'none', border: 'none', color: '#16A34A', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>Clear filter</button>
        </div>
      )}

      {/* Navigation Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px', background: 'white', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => nav(-1)} style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FontAwesomeIcon icon={faChevronLeft} size="sm" /></button>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '180px', textAlign: 'center' }}>
            {view === 'week' ? `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => nav(1)} style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FontAwesomeIcon icon={faChevronRight} size="sm" /></button>
          <button onClick={() => setCurrentDate(new Date())} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Today</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '10px', padding: '4px' }}>
            <button onClick={() => setView('week')} className={`view-toggle-btn ${view === 'week' ? 'active' : ''}`}>Week</button>
            <button onClick={() => setView('month')} className={`view-toggle-btn ${view === 'month' ? 'active' : ''}`}>Month</button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      {view === 'week' ? (
        <div className="cal-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {weekDays.map((d, i) => <div key={i} className={`cal-head ${d.toDateString() === new Date().toDateString() ? 'today' : ''}`}><div>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div><div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{d.getDate()}</div></div>)}
          {weekDays.map((d, i) => {
            const dayAppts = getAppts(d)
            const slotStatus = getTimeSlotStatus(d)
            const vacantCount = slotStatus.filter(s => s.status === 'vacant').length
            const occupiedCount = slotStatus.filter(s => s.status === 'occupied').length
            return (
              <div key={i} className={`cal-cell ${d.toDateString() === new Date().toDateString() ? 'today' : ''}`} style={{ maxHeight: '400px', overflowY: 'auto' }} onClick={() => setSelectedDayForList(d)}>
                {/* Summary Bar - Click to see all appointments */}
                <div 
                  onClick={() => { setSelectedCalendarDate(d); setShowDateSlotsModal(true); }}
                  style={{ 
                    marginBottom: '6px', 
                    padding: '6px 8px', 
                    background: dayAppts.length > 0 ? '#1E293B' : '#F1F5F9', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '0.6rem',
                    fontWeight: 700
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ color: '#10B981' }}>{vacantCount} Available</span>
                    <span style={{ color: '#EF4444' }}>{occupiedCount} Booked</span>
                  </div>
                  <div style={{ color: dayAppts.length > 0 ? 'white' : '#64748B', fontSize: '0.55rem' }}>
                    {dayAppts.length > 0 ? `View all ${dayAppts.length} appointments` : 'No appointments'}
                  </div>
                </div>
                {/* All Appointments for the day */}
                {dayAppts.map(a => (
                  <div key={a._id} className="apt-item" style={{ borderLeftColor: getCaseColor(a.category), marginBottom: '6px', padding: '8px' }} onClick={() => setSelected(a)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.7rem' }}>{a.time}</span>
                      <span style={{ fontSize: '0.55rem', padding: '2px 6px', borderRadius: '4px', background: getCaseColor(a.category), color: 'white', fontWeight: 600 }}>{a.category}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#1E293B', marginBottom: '2px' }}>{getPatientDisplayName(a)}</div>
                    <div style={{ color: '#64748B', fontSize: '0.6rem' }}>{a.service}</div>
                    <div style={{ color: '#94A3B8', fontSize: '0.55rem', marginTop: '2px' }}>{a.location}</div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="day-grid">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.65rem', color: '#64748B', padding: '8px' }}>{d}</div>)}
          {monthDays.map((item, i) => {
            const as = getAppts(item.date)
            const slotStatus = getTimeSlotStatus(item.date)
            const vacantCount = slotStatus.filter(s => s.status === 'vacant').length
            const occupiedCount = slotStatus.filter(s => s.status === 'occupied').length
            return (
              <div key={i} className={`day-cell ${!item.cur ? 'dim' : ''} ${item.date.toDateString() === new Date().toDateString() ? 'today' : ''}`} style={{ minHeight: '100px' }} onClick={() => { setSelectedDay({ date: item.date, appointments: as }); setSelectedDayForList(item.date); }}>
                <div className="dn" style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{item.date.getDate()}</span>
                  {as.length > 0 && (
                    <span onClick={(e) => { e.stopPropagation(); setSelectedDay({ date: item.date, appointments: as }); }} style={{ background: '#1E293B', color: 'white', borderRadius: '10px', padding: '2px 6px', fontSize: '0.55rem', cursor: 'pointer' }}>{as.length}</span>
                  )}
                </div>
                {/* Show first 2 appointments with details */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  {as.slice(0, 2).map(a => (
                    <div key={a._id} style={{ 
                      background: getCaseColor(a.category), 
                      color: 'white', 
                      borderRadius: '4px', 
                      padding: '4px 6px', 
                      marginBottom: '3px', 
                      fontSize: '0.55rem',
                      fontWeight: 600
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700 }}>{a.time}</span>
                        <span>{a.category}</span>
                      </div>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getPatientDisplayName(a)}</div>
                    </div>
                  ))}
                </div>
                {as.length > 2 && (
                  <div onClick={(e) => { e.stopPropagation(); setSelectedDay({ date: item.date, appointments: as }); }} style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748B', textAlign: 'center', padding: '4px', background: '#F1F5F9', borderRadius: '4px', cursor: 'pointer' }}>
                    +{as.length - 2} more
                  </div>
                )}
                {/* Vacant/Occupied indicator */}
                {as.length > 0 && (
                  <div style={{ marginTop: '6px', display: 'flex', gap: '4px', fontSize: '0.5rem', fontWeight: 600 }}>
                    <span style={{ color: '#10B981' }}>{vacantCount} Available</span>
                    <span style={{ color: '#EF4444' }}>{occupiedCount} Booked</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Dynamic List for Focused Day */}
      <div style={{ marginTop: '24px', background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#1E293B' }} /> 
          {selectedDayForList.toDateString() === new Date().toDateString() ? "Today's" : selectedDayForList.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} Schedule ({focusedDayAppts.length})
        </h3>
        {focusedDayAppts.length === 0 ? <div style={{ color: '#94A3B8', textAlign: 'center', padding: '2rem' }}>No appointments scheduled for this day</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {focusedDayAppts.map(a => {
              const sc = getStatusConfig(a.status)
              return (
                <div key={a._id} onClick={() => setSelected(a)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: '#F8FAFC', borderRadius: '12px', cursor: 'pointer', border: '1px solid #E2E8F0', transition: 'all 0.2s' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: getCaseColor(a.category), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1rem' }}>{getPatientDisplayName(a)?.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{getPatientDisplayName(a)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{a.time} • {a.service} • {a.scheduleType}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: sc.bg, color: sc.color }}>{a.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSelected(null)}>
            <div style={{ background: 'white', borderRadius: '20px', width: '95%', maxWidth: '450px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            {/* Header with Date & Time */}
            <div style={{ padding: '20px', background: getCaseColor(selected.category), color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>{getPatientDisplayName(selected)}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.95rem', opacity: 0.9 }}>{selected.service}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', color: 'white', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
              </div>
              {/* Date & Time Banner */}
              <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '1.2rem' }} />
                  <div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>DATE</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                      {new Date(selected.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FontAwesomeIcon icon={faClock} style={{ fontSize: '1.2rem' }} />
                  <div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>TIME</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{selected.time}</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.6rem', color: '#64748B', fontWeight: 700 }}>TYPE</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{selected.scheduleType}</div>
                </div>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.6rem', color: '#64748B', fontWeight: 700 }}>LOCATION</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{selected.location}</div>
                </div>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.6rem', color: '#64748B', fontWeight: 700 }}>CATEGORY</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{selected.category}</div>
                </div>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.6rem', color: '#64748B', fontWeight: 700 }}>STATUS</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{selected.status}</div>
                </div>
              </div>
              {selected.notes && <div style={{ marginBottom: '16px', padding: '12px', background: '#FEFCE8', borderRadius: '10px', fontSize: '0.8rem', color: '#854D0E' }}><b>Notes:</b> {selected.notes}</div>}
              
              {/* Confirmed Badge */}
              {selected.status === 'Confirmed' && (
                <div style={{ marginBottom: '16px', padding: '12px', background: '#D1FAE5', borderRadius: '10px', fontSize: '0.85rem', color: '#059669', fontWeight: 700, textAlign: 'center' }}>
                  ✓ This appointment has been confirmed
                </div>
              )}
               
              {/* Edit & Delete Actions */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button 
                  onClick={() => openEditModal(selected)}
                  disabled={selected.status === 'Confirmed'}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    background: selected.status === 'Confirmed' ? '#E2E8F0' : '#FEF3C7', 
                    color: selected.status === 'Confirmed' ? '#94A3B8' : '#D97706', 
                    border: `1px solid ${selected.status === 'Confirmed' ? '#CBD5E1' : '#FCD34D'}`,
                    borderRadius: '10px', 
                    fontWeight: 700, 
                    fontSize: '0.85rem', 
                    cursor: selected.status === 'Confirmed' ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px',
                    opacity: selected.status === 'Confirmed' ? 0.6 : 1
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </button>
                <button 
                  onClick={() => { setDeletingAppointment(selected); setShowDeleteConfirm(true); }}
                  disabled={selected.status === 'Confirmed'}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    background: selected.status === 'Confirmed' ? '#E2E8F0' : '#FEE2E2', 
                    color: selected.status === 'Confirmed' ? '#94A3B8' : '#DC2626', 
                    border: `1px solid ${selected.status === 'Confirmed' ? '#CBD5E1' : '#FCA5A5'}`,
                    borderRadius: '10px', 
                    fontWeight: 700, 
                    fontSize: '0.85rem', 
                    cursor: selected.status === 'Confirmed' ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px',
                    opacity: selected.status === 'Confirmed' ? 0.6 : 1
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
              
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, marginBottom: '10px' }}>UPDATE STATUS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {APPOINTMENT_STATUS.slice(0, 3).map(s => {
                  const isActive = selected.status === s.value
                  const isDisabled = selected.status === 'Confirmed'
                  return (
                    <button 
                      key={s.value} 
                      onClick={() => !isDisabled && updateStatus(selected._id, s.value, selected.dataSource)} 
                      className="status-btn" 
                      disabled={isDisabled}
                      style={{ 
                        background: isActive ? s.bg : '#F1F5F9', 
                        color: isDisabled ? '#94A3B8' : (isActive ? s.color : '#64748B'), 
                        border: `1px solid ${isActive ? s.color : '#E2E8F0'}`,
                        opacity: isDisabled ? 0.5 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day List Modal */}
      {selectedDay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSelectedDay(null)}>
          <div style={{ background: 'white', borderRadius: '20px', width: '95%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', background: 'linear-gradient(135deg, #1E293B, #334155)', color: 'white', borderRadius: '20px 20px 0 0', position: 'sticky', top: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.3rem' }}>{selectedDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3><p style={{ margin: '6px 0 0', fontSize: '0.9rem', opacity: 0.85 }}>{selectedDay.appointments.length} Appointments</p></div>
                <button onClick={() => setSelectedDay(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', color: 'white', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              {selectedDay.appointments.map(a => {
                const sc = getStatusConfig(a.status)
                return (
                  <div key={a._id} onClick={() => { setSelectedDay(null); setSelected(a) }} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: '#F8FAFC', borderRadius: '12px', cursor: 'pointer', border: '1px solid #E2E8F0', marginBottom: '10px', transition: 'all 0.2s' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: getCaseColor(a.category), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1rem' }}>{getPatientDisplayName(a)?.charAt(0)}</div>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{getPatientDisplayName(a)}</div><div style={{ fontSize: '0.75rem', color: '#64748B' }}>{a.time} - {a.service}</div><div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '2px' }}>{a.category} • {a.location || 'Health Center'}</div></div>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: sc.bg, color: sc.color }}>{a.status}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => closeModal()}>
          <div style={{ background: 'white', borderRadius: '24px', width: '95%', maxWidth: '540px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', background: isEditing ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'linear-gradient(135deg, #1E293B, #334155)', color: 'white', borderRadius: '24px 24px 0 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem' }}>{isEditing ? 'Edit Appointment' : 'Book Appointment'}</h3><p style={{ margin: '6px 0 0', fontSize: '0.85rem', opacity: 0.85 }}>{isEditing ? 'Update appointment details' : 'Schedule a patient visit'}</p></div>
                <button onClick={() => closeModal()} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', color: 'white', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
              </div>
            </div>
            
            <form onSubmit={submitForm} style={{ padding: '24px' }}>
              {/* Service Type */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>SERVICE TYPE</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SCHEDULE_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setServiceType(t)} className={`type-btn ${serviceType === t ? 'active' : ''}`}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Patient */}
              <div style={{ marginBottom: '18px', position: 'relative' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>PATIENT *</label>
                <div style={{ position: 'relative' }}>
                  <FontAwesomeIcon icon={faUser} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input type="text" placeholder="Search patient or resident..." value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value, patientId: ''})} style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '12px', border: '2px solid #E2E8F0', fontWeight: 600, fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                {form.patientName && !form.patientId && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', maxHeight: '150px', overflow: 'auto', zIndex: 20, boxShadow: '0 8px 20px rgba(0,0,0,0.1)', marginTop: '4px' }}>
                    {patients.filter(p => p.name?.toLowerCase().includes(form.patientName.toLowerCase())).map(p => (
                      <div key={p._id} onClick={() => setForm({...form, patientId: p._id, patientName: p.name, patientModel: 'Patient'})} style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{p.patientId} • {p.gender} • {p.age} years old</div>
                      </div>
                    ))}
                    {residents
                      .filter(r => `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase().includes(form.patientName.toLowerCase()))
                      .map(r => {
                        const residentName = `${r.firstName || ''} ${r.lastName || ''}`.replace(/\s+/g, ' ').trim()
                        return (
                          <div key={r._id} onClick={() => setForm({...form, patientId: r._id, patientName: residentName, patientModel: 'Resident'})} style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{residentName}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{r.residentId || 'Resident'} • {r.gender || 'N/A'} • {r.age || 'N/A'} years old</div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Category */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>CATEGORY *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {Object.entries(CASE_CATEGORIES).map(([cat, data]) => (
                    <div key={cat} onClick={() => handleCategoryChange(cat)} className="cat-btn" style={{ color: data.color, borderColor: form.category === cat ? data.color : '#E2E8F0', background: form.category === cat ? data.bg : 'white' }}>
                      <FontAwesomeIcon icon={CATEGORY_ICONS[cat] || faStethoscope} style={{ fontSize: '1.1rem', marginBottom: '4px' }} />
                      <div className="cat-label" style={{ fontWeight: 700, fontSize: '0.55rem', color: data.color }}>{cat}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Type */}
              {form.category && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>CASE TYPE</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {CASE_CATEGORIES[form.category]?.cases.map(c => (
                      <button key={c} type="button" onClick={() => setForm({...form, scheduleType: c, service: c})} style={{ padding: '8px 14px', borderRadius: '8px', border: form.scheduleType === c ? `2px solid ${CASE_CATEGORIES[form.category].color}` : '2px solid #E2E8F0', background: form.scheduleType === c ? CASE_CATEGORIES[form.category].bg : 'white', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', color: form.scheduleType === c ? CASE_CATEGORIES[form.category].color : '#64748B' }}>{c}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date & Time Selection */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>APPOINTMENT DATE & TIME *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#64748B', fontSize: '0.7rem' }} />
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748B' }}>SELECT DATE</span>
                    </div>
                    <input type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e => setForm({...form, date: e.target.value, time: '9:00 AM'})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E2E8F0', fontWeight: 600, fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <FontAwesomeIcon icon={faClock} style={{ color: '#64748B', fontSize: '0.7rem' }} />
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748B' }}>SELECT TIME</span>
                    </div>
                    <select value={form.time} onChange={e => setForm({...form, time: e.target.value})} disabled={isPastDate(form.date) || isWeekendDate(form.date)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E2E8F0', fontWeight: 600, fontSize: '0.9rem', boxSizing: 'border-box', background: getTimeSlotStatus(form.date).find(s => s.slot === form.time)?.status === 'occupied' ? '#FEE2E2' : getTimeSlotStatus(form.date).find(s => s.slot === form.time)?.status === 'closed' ? '#FEF3C7' : 'white' }}>
                      {getTimeSlotStatus(form.date).map(({ slot, status }) => (
                        <option key={slot} value={slot} disabled={status === 'past' || status === 'closed'} style={{ color: status === 'occupied' ? '#DC2626' : status === 'closed' ? '#D97706' : '#1E293B' }}>
                          {slot} {status === 'occupied' ? '(BOOKED)' : status === 'closed' ? '(CLOSED)' : '(Available)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Existing Appointments for Selected Date */}
                {form.date && (() => {
                  const dayAppointments = appointments.filter(a => {
                    if (!a.date || a.status === 'Cancelled') return false
                    return toDateKey(a.date) === toDateKey(form.date)
                  }).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                  
                  return (
                    <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#1E293B', fontSize: '0.9rem' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B' }}>
                          APPOINTMENTS ON {form.date ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : ''}
                        </span>
                      </div>
                      
                      {dayAppointments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', background: '#D1FAE5', borderRadius: '8px' }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>✓</div>
                          <div style={{ fontWeight: 700, color: '#059669' }}>All Slots Available</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>No appointments scheduled for this date</div>
                        </div>
                      ) : (
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {dayAppointments.map(a => (
                            <div key={a._id} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px', 
                              padding: '10px', 
                              background: 'white', 
                              borderRadius: '8px', 
                              marginBottom: '8px',
                              borderLeft: `4px solid ${getCaseColor(a.category)}`
                            }}>
                              <div style={{ 
                                padding: '6px 10px', 
                                background: '#FEE2E2', 
                                borderRadius: '6px', 
                                fontWeight: 800, 
                                fontSize: '0.75rem',
                                color: '#DC2626'
                              }}>
                                {a.time}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>{getPatientDisplayName(a)}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{a.service} • {a.category}</div>
                              </div>
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.6rem', 
                                fontWeight: 700,
                                background: getCaseColor(a.category),
                                color: 'white'
                              }}>
                                {a.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                {/* Time Slot Availability Grid */}
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
                  {/* Warning: Past Date */}
                  {isPastDate(form.date) && (
                    <div style={{ background: '#FEE2E2', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '16px', border: '2px solid #FCA5A5' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✕</div>
                      <div style={{ fontWeight: 800, color: '#DC2626', fontSize: '1rem' }}>DATE HAS PASSED</div>
                      <div style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '4px' }}>Cannot book appointments for past dates</div>
                    </div>
                  )}
                  
                  {/* Warning: Weekend */}
                  {!isPastDate(form.date) && isWeekendDate(form.date) && (
                    <div style={{ background: '#FEF3C7', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '16px', border: '2px solid #FCD34D' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>!</div>
                      <div style={{ fontWeight: 800, color: '#D97706', fontSize: '1rem' }}>NOT AN OFFICE DAY</div>
                      <div style={{ fontSize: '0.75rem', color: '#92400E', marginTop: '4px' }}>Clinic operates Monday to Friday only</div>
                    </div>
                  )}
                  
                  {/* Warning: After 5 PM Today */}
                  {isTodayDate(form.date) && isAfter5PMToday() && (
                    <div style={{ background: '#FEE2E2', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '16px', border: '2px solid #FCA5A5' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>!</div>
                      <div style={{ fontWeight: 800, color: '#DC2626', fontSize: '1rem' }}>CLINIC HOURS ENDED</div>
                      <div style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '4px' }}>Booking closed for today. Office hours: 8:00 AM - 5:00 PM</div>
                    </div>
                  )}
                  
                  {/* Only show time slots for valid weekdays */}
                  {!isPastDate(form.date) && !isWeekendDate(form.date) && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FontAwesomeIcon icon={faClock} style={{ color: '#1E293B', fontSize: '0.9rem' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E293B' }}>
                            TIME SLOT AVAILABILITY
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B' }}>
                          {getTimeSlotStatus(form.date).filter(t => t.status === 'vacant').length} Available / {getTimeSlotStatus(form.date).filter(t => t.status === 'occupied').length} Booked / {getTimeSlotStatus(form.date).filter(t => t.status === 'closed').length} Closed
                        </span>
                      </div>
                      
                      {/* Legend */}
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', padding: '8px 12px', background: 'white', borderRadius: '8px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#D1FAE5', border: '2px solid #10B981' }}></div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669' }}>Available</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#FEE2E2', border: '2px solid #EF4444' }}></div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#DC2626' }}>Booked</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#FEF3C7', border: '2px solid #F59E0B' }}></div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D97706' }}>Closed</span>
                        </div>
                      </div>
                      
                      {/* Time Slots Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                        {getTimeSlotStatus(form.date).map(({ slot, status, appointment }) => {
                          const isSelected = form.time === slot
                          const isPast = status === 'past'
                          const isClosed = status === 'closed'
                          const isDisabled = isPast || isClosed
                          return (
                            <div
                              key={slot}
                              onClick={() => !isDisabled && setForm({...form, time: slot})}
                              style={{
                                padding: '10px 6px',
                                borderRadius: '8px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                textAlign: 'center',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                background: isSelected ? '#1E293B' : (status === 'occupied' ? '#FEE2E2' : status === 'closed' ? '#FEF3C7' : status === 'past' ? '#E2E8F0' : '#D1FAE5'),
                                color: isSelected ? 'white' : (status === 'occupied' ? '#DC2626' : status === 'closed' ? '#D97706' : status === 'past' ? '#94A3B8' : '#059669'),
                                border: `2px solid ${isSelected ? '#1E293B' : (status === 'occupied' ? '#EF4444' : status === 'closed' ? '#F59E0B' : status === 'past' ? '#CBD5E1' : '#10B981')}`,
                                transition: 'all 0.2s',
                                boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                                opacity: isDisabled ? 0.5 : 1,
                                textDecoration: isPast ? 'line-through' : 'none'
                              }}
                              title={isPast ? 'Time has passed' : (isClosed ? 'Clinic closed at 5:00 PM' : (status === 'occupied' ? `${getPatientDisplayName(appointment)} - ${appointment?.service}` : 'Available'))}
                            >
                              <div style={{ marginBottom: '2px' }}>{slot}</div>
                              <div style={{ fontSize: '0.5rem', opacity: 0.8 }}>
                                {status === 'occupied' ? '✕ Booked' : status === 'closed' ? 'CLOSED' : status === 'past' ? '' : '✓ Available'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Selected Time Summary */}
                      {form.time && (() => {
                        const slotStatus = getTimeSlotStatus(form.date).find(s => s.slot === form.time)
                        const isClosed = slotStatus?.status === 'closed'
                        const isPast = slotStatus?.status === 'past'
                        const isOccupied = slotStatus?.status === 'occupied'
                        return (
                          <div style={{ marginTop: '12px', padding: '10px 12px', background: isOccupied ? '#FEE2E2' : isClosed ? '#FEF3C7' : isPast ? '#E2E8F0' : '#D1FAE5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isOccupied ? '#DC2626' : isClosed ? '#D97706' : isPast ? '#94A3B8' : '#059669' }}>
                              {form.date && new Date(form.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {form.time} - 
                              {isOccupied ? 'SLOT BOOKED' : isClosed ? 'CLINIC CLOSED' : 'SLOT AVAILABLE'}
                            </span>
                          </div>
                        )
                      })()}
                    </>
                  )}
                </div>
              </div>

              {/* Urgency & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div><label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>URGENCY</label><select value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E2E8F0', fontWeight: 600, fontSize: '0.9rem', boxSizing: 'border-box' }}>{URGENCY_LEVELS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}</select></div>
                <div><label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>LOCATION</label><select value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E2E8F0', fontWeight: 600, fontSize: '0.9rem', boxSizing: 'border-box' }}>{LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '8px' }}>NOTES</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Additional notes..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #E2E8F0', fontWeight: 600, fontSize: '0.85rem', minHeight: '80px', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              {/* Protocol Preview */}
              {form.category && form.scheduleType && getIsConsecutive(form.scheduleType) && (
                <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '16px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', marginBottom: '10px' }}>PROTOCOL SCHEDULE ({PROTOCOLS[form.scheduleType].length} VISITS)</div>
                  {PROTOCOLS[form.scheduleType].map((v, i) => { const d = new Date(form.date); d.setDate(d.getDate() + v.weeks * 7); return <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.75rem', borderBottom: i < PROTOCOLS[form.scheduleType].length - 1 ? '1px solid #E2E8F0' : 'none' }}><span>{v.focus}</span><span style={{ color: '#64748B' }}>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div> })}
                </div>
              )}

              {(() => {
                // Check all conditions that block booking
                const isPast = isPastDate(form.date);
                const isWeekend = isWeekendDate(form.date);
                const isAfter5PM = isTodayDate(form.date) && isAfter5PMToday();
                
                if (isPast) {
                  return (
                    <div style={{ width: '100%', padding: '16px', background: '#FEE2E2', color: '#DC2626', border: '2px solid #FCA5A5', borderRadius: '14px', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>
                      Cannot book appointments for past dates
                    </div>
                  );
                }
                
                if (isWeekend) {
                  return (
                    <div style={{ width: '100%', padding: '16px', background: '#FEF3C7', color: '#D97706', border: '2px solid #FCD34D', borderRadius: '14px', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>
                      Cannot book appointments on weekends
                    </div>
                  );
                }
                
                if (isAfter5PM) {
                  return (
                    <div style={{ width: '100%', padding: '16px', background: '#FEE2E2', color: '#DC2626', border: '2px solid #FCA5A5', borderRadius: '14px', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>
                      Cannot book - clinic hours ended (after 5:00 PM)
                    </div>
                  );
                }
                
                return (
                  <button type="submit" disabled={submitting} style={{ width: '100%', padding: '16px', background: submitting ? '#94A3B8' : (isEditing ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'linear-gradient(135deg, #1E293B, #334155)'), color: 'white', border: 'none', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(30,41,59,0.3)', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Creating...' : (isEditing ? 'Update Appointment' : 'Create Appointment')}</button>
                );
              })()}
            </form>
          </div>
        </div>
      )}

      {/* Conflict Detection Modal */}
      {showConflictModal && conflictData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '450px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', color: '#EF4444' }}>
              <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Scheduling Conflict Detected</h3>
            </div>
            <p style={{ margin: '0 0 1rem', color: '#64748B', fontSize: '0.9rem' }}>
              <strong>{conflictData.patient}</strong> already has an appointment at this date and time.
            </p>
            <div style={{ background: '#FEF2F2', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B' }}>Existing:</span>
                <span style={{ fontWeight: 700, color: '#1E293B' }}>
                  {new Date(conflictData.existingDate).toLocaleDateString()} at {conflictData.existingTime}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B' }}>Service:</span>
                <span style={{ fontWeight: 700, color: '#1E293B' }}> {conflictData.existingService}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => { setShowConflictModal(false); setConflictData(null); }}
                style={{ flex: 1, padding: '14px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => !submitting && createAppointment()}
                disabled={submitting}
                style={{ flex: 1, padding: '14px', background: submitting ? '#94A3B8' : '#EF4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Creating...' : 'Save Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '400px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', color: '#EF4444' }}>
              <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Delete Appointment?</h3>
            </div>
            <p style={{ margin: '0 0 1.5rem', color: '#64748B', fontSize: '0.9rem' }}>
              Are you sure you want to delete this appointment? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => { setShowDeleteConfirm(false); setDeletingAppointment(null); }}
                style={{ flex: 1, padding: '14px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                style={{ flex: 1, padding: '14px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Time Slots Modal - Shows when clicking on a date */}
      {showDateSlotsModal && selectedCalendarDate && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', maxWidth: '500px', width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1E293B' }}>
                  {selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  Time Slot Availability
                </p>
              </div>
              <button 
                onClick={() => { setShowDateSlotsModal(false); setSelectedCalendarDate(null); }}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', width: '32px', height: '32px', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '1rem', padding: '10px', background: '#F8FAFC', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#D1FAE5', border: '1px solid #6EE7B7' }}></div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#FEE2E2', border: '1px solid #FCA5A5' }}></div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#DC2626' }}>Booked</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#FEF3C7', border: '1px solid #FCD34D' }}></div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#D97706' }}>Closed</span>
              </div>
            </div>
            
            {/* Time Slots Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '1rem' }}>
              {getTimeSlotStatus(selectedCalendarDate).map(({ slot, status, appointment }) => (
                <div
                  key={slot}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    background: status === 'occupied' ? '#FEE2E2' : status === 'closed' ? '#FEF3C7' : status === 'past' ? '#E2E8F0' : '#D1FAE5',
                    color: status === 'occupied' ? '#DC2626' : status === 'closed' ? '#D97706' : status === 'past' ? '#94A3B8' : '#059669',
                    border: `1px solid ${status === 'occupied' ? '#FCA5A5' : status === 'closed' ? '#FCD34D' : status === 'past' ? '#CBD5E1' : '#6EE7B7'}`,
                    opacity: status === 'past' || status === 'closed' ? 0.6 : 1,
                    cursor: 'default',
                  }}
                >
                  <div style={{ marginBottom: '2px' }}>{slot}</div>
                  {status === 'occupied' && appointment && (
                    <div style={{ fontSize: '0.55rem', fontWeight: 600, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {getPatientDisplayName(appointment)}
                    </div>
                  )}
                  {status === 'closed' && <div style={{ fontSize: '0.5rem' }}>CLOSED</div>}
                </div>
              ))}
            </div>
            
            {/* Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#F1F5F9', borderRadius: '10px', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669' }}>
                  {getTimeSlotStatus(selectedCalendarDate).filter(s => s.status === 'vacant').length}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Available</div>
              </div>
              <div style={{ width: '1px', background: '#E2E8F0' }}></div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#DC2626' }}>
                  {getTimeSlotStatus(selectedCalendarDate).filter(s => s.status === 'occupied').length}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Booked</div>
              </div>
              <div style={{ width: '1px', background: '#E2E8F0' }}></div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D97706' }}>
                  {getTimeSlotStatus(selectedCalendarDate).filter(s => s.status === 'closed').length}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Closed</div>
              </div>
            </div>
            
            {/* Past date / 5PM cutoff message */}
            {(() => {
              if (!selectedCalendarDate) return null;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const checkDate = new Date(selectedCalendarDate);
              checkDate.setHours(0, 0, 0, 0);
              if (checkDate < today) {
                return <div style={{ textAlign: 'center', padding: '10px', background: '#FEE2E2', borderRadius: '8px', marginBottom: '1rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: 600 }}>Cannot book appointments for past dates</div>;
              }
              if (checkDate.getTime() === today.getTime()) {
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const fivePMMinutes = 17 * 60;
                if (currentMinutes >= fivePMMinutes) {
                  return <div style={{ textAlign: 'center', padding: '10px', background: '#FEE2E2', borderRadius: '8px', marginBottom: '1rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: 600 }}>Clinic hours ended. Booking closed for today.</div>;
                }
              }
              return null;
            })()}
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { 
                  setShowDateSlotsModal(false);
                  closeModal();
                  setForm(prev => ({
                    ...prev,
                    date: selectedCalendarDate ? `${selectedCalendarDate.getFullYear()}-${String(selectedCalendarDate.getMonth() + 1).padStart(2, '0')}-${String(selectedCalendarDate.getDate()).padStart(2, '0')}` : prev.date,
                    time: '9:00 AM'
                  }));
                  setShowModal(true);
                }}
                disabled={(() => {
                  if (!selectedCalendarDate) return true;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const checkDate = new Date(selectedCalendarDate);
                  checkDate.setHours(0, 0, 0, 0);
                  if (checkDate < today) return true;
                  if (checkDate.getTime() === today.getTime()) {
                    const now = new Date();
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    const fivePMMinutes = 17 * 60;
                    if (currentMinutes >= fivePMMinutes) return true;
                  }
                  return false;
                })()}
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  background: (() => {
                    if (!selectedCalendarDate) return '#94A3B8';
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkDate = new Date(selectedCalendarDate);
                    checkDate.setHours(0, 0, 0, 0);
                    if (checkDate < today) return '#94A3B8';
                    if (checkDate.getTime() === today.getTime()) {
                      const now = new Date();
                      const currentMinutes = now.getHours() * 60 + now.getMinutes();
                      const fivePMMinutes = 17 * 60;
                      if (currentMinutes >= fivePMMinutes) return '#94A3B8';
                    }
                    return 'linear-gradient(135deg, #1E293B, #334155)';
                  })(), 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontWeight: 700, 
                  fontSize: '0.85rem', 
                  cursor: (() => {
                    if (!selectedCalendarDate) return 'not-allowed';
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkDate = new Date(selectedCalendarDate);
                    checkDate.setHours(0, 0, 0, 0);
                    if (checkDate < today) return 'not-allowed';
                    if (checkDate.getTime() === today.getTime()) {
                      const now = new Date();
                      const currentMinutes = now.getHours() * 60 + now.getMinutes();
                      const fivePMMinutes = 17 * 60;
                      if (currentMinutes >= fivePMMinutes) return 'not-allowed';
                    }
                    return 'pointer';
                  })(),
                  opacity: (() => {
                    if (!selectedCalendarDate) return 0.6;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkDate = new Date(selectedCalendarDate);
                    checkDate.setHours(0, 0, 0, 0);
                    if (checkDate < today) return 0.6;
                    if (checkDate.getTime() === today.getTime()) {
                      const now = new Date();
                      const currentMinutes = now.getHours() * 60 + now.getMinutes();
                      const fivePMMinutes = 17 * 60;
                      if (currentMinutes >= fivePMMinutes) return 0.6;
                    }
                    return 1;
                  })()
                }}
              >
                Book Appointment
              </button>
              <button 
                onClick={() => { setShowDateSlotsModal(false); setSelectedCalendarDate(null); }}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
