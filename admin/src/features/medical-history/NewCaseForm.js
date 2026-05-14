import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faTimes,
  faCalendarCheck,
  faUserInjured,
  faBaby,
  faLungs,
  faSyringe,
  faHeartPulse,
  faTeeth,
  faUsers,
  faClipboardList
} from "@fortawesome/free-solid-svg-icons"

const caseTypeConfig = {
  prenatal: { label: 'Prenatal', icon: faUserInjured, color: '#DB2777', bg: '#FCE7F3' },
  tb: { label: 'TB DOTS', icon: faLungs, color: '#4F46E5', bg: '#E0E7FF' },
  pediatric: { label: 'Pediatric', icon: faBaby, color: '#059669', bg: '#D1FAE5' },
  vaccination: { label: 'Vaccination', icon: faSyringe, color: '#7C3AED', bg: '#EDE9FE' },
  consultation: { label: 'Consultation', icon: faClipboardList, color: '#4169E1', bg: '#EEF2FF' },
  ncd: { label: 'NCD', icon: faHeartPulse, color: '#DC2626', bg: '#FEE2E2' },
  dental: { label: 'Dental', icon: faTeeth, color: '#D97706', bg: '#FEF3C7' },
  familyplanning: { label: 'Family Planning', icon: faUsers, color: '#0891B2', bg: '#CFFAFE' }
}

export default function NewCaseForm({ caseType, onClose, onSave }) {
  const config = caseTypeConfig[caseType] || caseTypeConfig.consultation
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    date: today,
    chiefComplaint: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    bloodPressure: '',
    temperature: '',
    weight: ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.chiefComplaint.trim()) newErrors.chiefComplaint = 'Chief complaint is required'
    if (!formData.diagnosis.trim()) newErrors.diagnosis = 'Diagnosis is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const dataToSave = {
      ...formData,
      caseType: caseType,
      createdAt: new Date().toISOString()
    }

    if (onSave) {
      await onSave(dataToSave)
    }
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '1.25rem 1.5rem',
        background: `linear-gradient(135deg, ${config.color}, ${config.color}CC)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FontAwesomeIcon icon={config.icon} style={{ fontSize: '1.25rem' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              New {config.label} Record
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>
              Add a new {config.label.toLowerCase()} case for this patient
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                DATE OF VISIT *
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: `2px solid ${errors.date ? '#EF4444' : '#E2E8F0'}`,
                    fontWeight: 600,
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleChange('date', today)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0 12px',
                    background: config.bg,
                    border: `2px solid ${config.color}30`,
                    borderRadius: '10px',
                    color: config.color,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  <FontAwesomeIcon icon={faCalendarCheck} style={{ fontSize: '0.8rem' }} />
                  Today
                </button>
              </div>
              {errors.date && <p style={{ color: '#EF4444', fontSize: '0.7rem', margin: '4px 0 0' }}>{errors.date}</p>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                CASE TYPE
              </label>
              <div style={{
                padding: '0.75rem',
                borderRadius: '10px',
                border: `2px solid ${config.color}30`,
                background: config.bg,
                fontWeight: 700,
                fontSize: '0.85rem',
                color: config.color,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FontAwesomeIcon icon={config.icon} style={{ fontSize: '0.9rem' }} />
                {config.label}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              CHIEF COMPLAINT *
            </label>
            <input
              type="text"
              value={formData.chiefComplaint}
              onChange={(e) => handleChange('chiefComplaint', e.target.value)}
              placeholder="Enter chief complaint"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: `1px solid ${errors.chiefComplaint ? '#EF4444' : '#E2E8F0'}`,
                fontWeight: 600,
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {errors.chiefComplaint && <p style={{ color: '#EF4444', fontSize: '0.7rem', margin: '4px 0 0' }}>{errors.chiefComplaint}</p>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              DIAGNOSIS *
            </label>
            <input
              type="text"
              value={formData.diagnosis}
              onChange={(e) => handleChange('diagnosis', e.target.value)}
              placeholder="Enter diagnosis"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: `1px solid ${errors.diagnosis ? '#EF4444' : '#E2E8F0'}`,
                fontWeight: 600,
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {errors.diagnosis && <p style={{ color: '#EF4444', fontSize: '0.7rem', margin: '4px 0 0' }}>{errors.diagnosis}</p>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TREATMENT / ACTION TAKEN
            </label>
            <textarea
              value={formData.treatment}
              onChange={(e) => handleChange('treatment', e.target.value)}
              placeholder="Enter treatment or action taken"
              rows={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                fontWeight: 600,
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              CLINICAL NOTES
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes or remarks"
              rows={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                fontWeight: 600,
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                BLOOD PRESSURE
              </label>
              <input
                type="text"
                value={formData.bloodPressure}
                onChange={(e) => handleChange('bloodPressure', e.target.value)}
                placeholder="120/80"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                TEMPERATURE
              </label>
              <input
                type="text"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                placeholder="36.5°C"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                WEIGHT
              </label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="60 kg"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.875rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: 'white',
                color: '#64748B',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                padding: '0.875rem',
                borderRadius: '12px',
                border: 'none',
                background: `linear-gradient(135deg, ${config.color}, ${config.color}CC)`,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: `0 4px 12px ${config.color}30`,
                transition: 'all 0.2s'
              }}
            >
              Save {config.label} Record
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
