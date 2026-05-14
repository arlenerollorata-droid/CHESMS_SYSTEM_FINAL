import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faCircle, 
  faClock, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faUsers,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';

const Calendar = ({ events = [], schedules = [], appointments = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const totalDays = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);
  const isSmall = screenWidth <= 520;

  React.useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getItemsForDay = (day) => {
    const dateStr = new Date(year, month, day).toDateString();
    
    const dayEvents = events.filter(e => new Date(e.date).toDateString() === dateStr);
    
    // Merge appointments into schedules as requested to simplify the UI
    const dayAppointments = appointments.filter(a => new Date(a.date || a.appointmentDate || a.scheduleDate).toDateString() === dateStr);
    const daySchedules = schedules.filter(s => new Date(s.date || s.scheduleDate).toDateString() === dateStr);

    const mappedEvents = dayEvents.map(e => ({
      ...e,
      type: 'event',
      typeLabel: 'Event',
      color: '#EF4444',
      title: e.title || 'Community Event',
      time: e.time || e.startTime || 'All Day'
    }));

    const mappedSchedules = daySchedules.map(s => {
      return {
        ...s,
        type: 'schedule',
        typeLabel: 'Schedule',
        color: '#8B5CF6',
        title: s.title || s.service || s.patient?.name || s.resident?.name || s.patientName || 'Clinic Schedule',
        time: s.time || s.scheduleTime || s.appointmentTime || 'Scheduled'
      };
    });

    const mappedAppointments = dayAppointments.map(a => ({
      ...a,
      type: 'schedule', // Changed from appointment to schedule
      typeLabel: 'Schedule',
      color: '#8B5CF6',
      title: a.title || a.patientName || a.patient?.name || a.resident?.name || 'Clinic Visit',
      time: a.time || a.appointmentTime || 'Scheduled'
    }));

    return [...mappedEvents, ...mappedAppointments, ...mappedSchedules];
  };

  const monthlyTotals = useMemo(() => {
    const totals = { event: 0, schedule: 0 };
    for (let d = 1; d <= totalDays; d++) {
      const dayItems = getItemsForDay(d);
      dayItems.forEach((item) => {
        if (totals[item.type] !== undefined) {
          totals[item.type] += 1;
        }
      });
    }
    return totals;
  }, [year, month, events, appointments, schedules, totalDays]);

  const selectedItems = useMemo(() => {
    const safeDay = Math.min(selectedDay, totalDays);
    return getItemsForDay(safeDay);
  }, [selectedDay, year, month, events, schedules, appointments, totalDays]);

  const selectedDateText = useMemo(() => {
    const safeDay = Math.min(selectedDay, totalDays);
    return new Date(year, month, safeDay).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDay, year, month, totalDays]);

  const styles = {
    card: {
      background: '#ffffff',
      borderRadius: isSmall ? '16px' : '20px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 10px 24px rgba(15,23,42,0.06)',
      padding: isSmall ? '0.85rem' : '1.25rem'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      gap: '0.8rem',
      flexWrap: 'wrap'
    },
    title: {
      margin: 0,
      fontSize: isSmall ? '0.9rem' : '1.1rem',
      fontWeight: 900,
      color: '#0F172A'
    },
    subtitle: {
      margin: 0,
      fontSize: '0.68rem',
      color: '#64748B',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em'
    },
    navWrap: {
      display: 'flex',
      gap: '8px',
      marginLeft: 'auto'
    },
    navBtn: {
      border: '1px solid #E2E8F0',
      background: '#F8FAFC',
      color: '#334155',
      width: '32px',
      height: '32px',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    weekdays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
      gap: '4px',
      marginBottom: '8px'
    },
    weekday: {
      textAlign: 'center',
      fontSize: isSmall ? '0.6rem' : '0.68rem',
      fontWeight: 800,
      color: '#94A3B8',
      padding: '4px 0'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
      gap: isSmall ? '4px' : '6px'
    },
    dayCell: (isToday, isSelected) => ({
      minHeight: isSmall ? '42px' : '52px',
      borderRadius: '12px',
      border: isSelected ? '2px solid #4169E1' : '1px solid #EEF2F7',
      background: isToday ? '#EFF6FF' : isSelected ? '#F8FAFC' : '#FFFFFF',
      color: isToday ? '#2563EB' : '#1E293B',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontSize: isSmall ? '0.75rem' : '0.85rem',
      fontWeight: isToday || isSelected ? 800 : 600,
      padding: '4px 2px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isSelected ? '0 4px 12px rgba(65, 105, 225, 0.15)' : 'none',
      zIndex: isSelected ? 2 : 1
    }),
    dayDots: {
      display: 'flex',
      gap: '3px',
      marginTop: '3px',
      height: '6px',
      alignItems: 'center',
      justifyContent: 'center'
    },
    dot: (color) => ({
      width: '5px',
      height: '5px',
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 0 1px white, 0 0 4px ${color}66`
    }),
    legend: {
      marginTop: '1.25rem',
      padding: '0.75rem',
      background: '#F8FAFC',
      borderRadius: '12px',
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      fontSize: '0.65rem',
      fontWeight: 800,
      color: '#64748B',
      border: '1px solid #F1F5F9'
    },
    legendItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    },
    agenda: {
      marginTop: '1.5rem',
      borderTop: '2px solid #F1F5F9',
      paddingTop: '1.25rem'
    },
    agendaHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    agendaTitle: {
      margin: 0,
      fontSize: '0.85rem',
      fontWeight: 900,
      color: '#0F172A',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    agendaCount: {
      fontSize: '0.65rem',
      fontWeight: 800,
      color: '#4169E1',
      background: '#E8EFFF',
      padding: '3px 10px',
      borderRadius: '999px'
    },
    agendaItem: {
      display: 'flex',
      gap: '12px',
      padding: '12px',
      borderRadius: '16px',
      background: '#FFFFFF',
      border: '1px solid #F1F5F9',
      marginBottom: '10px',
      transition: 'all 0.2s',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },
    itemIcon: (color) => ({
      width: '36px',
      height: '36px',
      borderRadius: '12px',
      background: `${color}15`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontSize: '0.9rem'
    }),
    typeBadge: (color) => ({
      fontSize: '0.62rem',
      fontWeight: 800,
      color,
      background: `${color}1A`,
      border: `1px solid ${color}33`,
      borderRadius: '999px',
      padding: '2px 8px',
      textTransform: 'uppercase'
    }),
    itemTitle: {
      fontSize: '0.8rem',
      fontWeight: 800,
      color: '#1E293B',
      lineHeight: 1.3
    },
    itemMeta: {
      fontSize: '0.65rem',
      color: '#64748B',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontWeight: 600
    }
  };

  const days = [];
  for (let i = 0; i < offset; i++) {
    days.push(<div key={`offset-${i}`} style={{ height: isSmall ? '42px' : '52px' }}></div>);
  }

  for (let d = 1; d <= totalDays; d++) {
    const isToday = isCurrentMonth && d === today.getDate();
    const items = getItemsForDay(d);
    const isSelected = d === selectedDay;

    days.push(
      <button
        type="button"
        key={d}
        onClick={() => setSelectedDay(d)}
        style={styles.dayCell(isToday, isSelected)}
      >
        <span>{d}</span>
        <div style={styles.dayDots}>
          {Array.from(new Set(items.map(item => item.color))).slice(0, 3).map((color, idx) => (
            <div key={idx} style={styles.dot(color)} />
          ))}
        </div>
      </button>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{monthNames[month]} {year}</h3>
          <p style={styles.subtitle}>Center Schedule & Events</p>
        </div>
        <div style={styles.navWrap}>
          <button onClick={prevMonth} style={styles.navBtn} title="Previous Month">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button onClick={nextMonth} style={styles.navBtn} title="Next Month">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      <div style={styles.weekdays}>
        {daysOfWeek.map(day => (
          <div key={day} style={styles.weekday}>{day}</div>
        ))}
      </div>

      <div style={styles.grid}>{days}</div>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{...styles.dot('#EF4444'), width: '6px', height: '6px'}} /> Events
        </div>
        <div style={styles.legendItem}>
          <div style={{...styles.dot('#8B5CF6'), width: '6px', height: '6px'}} /> Schedules
        </div>
      </div>

      <div style={styles.agenda}>
        <div style={styles.agendaHeader}>
          <p style={styles.agendaTitle}>
            <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#4169E1' }} />
            {selectedDateText}
          </p>
          <span style={styles.agendaCount}>{selectedItems.length} Activities</span>
        </div>
        
        <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
          {selectedItems.length > 0 ? selectedItems.map((item, idx) => (
            <div key={idx} style={styles.agendaItem} className="interactive-item">
              <div style={styles.itemIcon(item.color)}>
                <FontAwesomeIcon icon={item.type === 'event' ? faUsers : faClock} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={styles.typeBadge(item.color)}>{item.typeLabel}</span>
                  <div style={styles.itemMeta}>
                    <FontAwesomeIcon icon={faClock} />
                    <span>{item.time}</span>
                  </div>
                </div>
                <div style={styles.itemTitle}>{item.title}</div>
                {item.location && (
                  <div style={{ ...styles.itemMeta, marginTop: '4px' }}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} style={{ fontSize: '0.6rem' }} />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div style={{ 
              padding: '2.5rem 1rem', 
              textAlign: 'center', 
              background: '#F8FAFC', 
              borderRadius: '20px',
              border: '1px dashed #E2E8F0'
            }}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '1.8rem', color: '#CBD5E1', marginBottom: '1rem' }} />
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem', fontWeight: 800 }}>No activities scheduled for this day.</p>
              <p style={{ margin: '4px 0 0', color: '#CBD5E1', fontSize: '0.65rem', fontWeight: 600 }}>Enjoy your day!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
