import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes, faStethoscope, faCalendarCheck } from "@fortawesome/free-solid-svg-icons"

export default function ConsultationForm({ patientId, onClose, onSuccess, onSave, prefillData, caseType }) {
  const today = new Date().toISOString().split('T')[0]
  
  const [formData, setFormData] = useState({
    date: prefillData?.date || today,
    chiefComplaint: prefillData?.chiefComplaint || '',
    diagnosis: prefillData?.diagnosis || '',
    treatment: prefillData?.treatment || '',
    notes: prefillData?.notes || '',
    bloodPressure: prefillData?.bloodPressure || '',
    temperature: prefillData?.temperature || '',
    weight: prefillData?.weight || '',
    pulseRate: prefillData?.pulseRate || '',
    gestationalAge: prefillData?.gestationalAge || '',
    trimester: prefillData?.trimester || (caseType === 'prenatal' ? '1st Trimester' : '')
  })
  
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (onSave) {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      await onSave({
        ...formData,
        time: formData.time || currentTime
      })
    }
    alert('Consultation record saved successfully!')
    onSuccess && onSuccess()
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4169E1, #1E40AF)',
          padding: '1.5rem 2rem',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
              <FontAwesomeIcon icon={faStethoscope} style={{ marginRight: '10px' }} />
              Add Consultation
            </h2>
            <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.85rem' }}>Record a new visit</p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>DATE OF VISIT *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: `2px solid ${errors.date ? '#EF4444' : '#4169E1'}`,
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleChange('date', today)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 14px',
                    background: '#EEF2FF',
                    border: '2px solid #4169E1',
                    borderRadius: '12px',
                    color: '#4169E1',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <FontAwesomeIcon icon={faCalendarCheck} style={{ fontSize: '0.9rem' }} />
                  Today
                </button>
              </div>
              {errors.date && <p style={{ color: '#EF4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.date}</p>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>CHIEF COMPLAINT *</label>
              <input
                type="text"
                value={formData.chiefComplaint}
                onChange={(e) => handleChange('chiefComplaint', e.target.value)}
                placeholder="e.g. Fever and cough for 3 days"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  border: `1px solid ${errors.chiefComplaint ? '#EF4444' : '#E2E8F0'}`,
                  fontWeight: 600
                }}
              />
              {errors.chiefComplaint && <p style={{ color: '#EF4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.chiefComplaint}</p>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>DIAGNOSIS *</label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => handleChange('diagnosis', e.target.value)}
                placeholder="e.g. Upper Respiratory Tract Infection"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  border: `1px solid ${errors.diagnosis ? '#EF4444' : '#E2E8F0'}`,
                  fontWeight: 600
                }}
              />
              {errors.diagnosis && <p style={{ color: '#EF4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.diagnosis}</p>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>TREATMENT GIVEN *</label>
              <textarea
                value={formData.treatment}
                onChange={(e) => handleChange('treatment', e.target.value)}
                placeholder="e.g. Rest, increase fluid intake, steam inhalation"
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  border: `1px solid ${errors.treatment ? '#EF4444' : '#E2E8F0'}`,
                  fontWeight: 600,
                  resize: 'vertical'
                }}
              />
              {errors.treatment && <p style={{ color: '#EF4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.treatment}</p>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>NOTES</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Optional notes"
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontWeight: 600,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>BLOOD PRESSURE</label>
                <input
                  type="text"
                  value={formData.bloodPressure}
                  onChange={(e) => handleChange('bloodPressure', e.target.value)}
                  placeholder="120/80 mmHg"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontWeight: 600
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>TEMPERATURE</label>
                <input
                  type="text"
                  value={formData.temperature}
                  onChange={(e) => handleChange('temperature', e.target.value)}
                  placeholder="36.5°C"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontWeight: 600
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>WEIGHT</label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  placeholder="60 kg"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontWeight: 600
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>PULSE RATE</label>
                <input
                  type="text"
                  value={formData.pulseRate}
                  onChange={(e) => handleChange('pulseRate', e.target.value)}
                  placeholder="72 bpm"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontWeight: 600
                  }}
                />
              </div>
              {caseType === 'prenatal' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>GESTATIONAL AGE (WEEKS)</label>
                    <input
                      type="number"
                      value={formData.gestationalAge}
                      onChange={(e) => handleChange('gestationalAge', e.target.value)}
                      placeholder="e.g. 12"
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontWeight: 600
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>TRIMESTER</label>
                    <select
                      value={formData.trimester}
                      onChange={(e) => handleChange('trimester', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontWeight: 600,
                        background: 'white'
                      }}
                    >
                      <option value="1st Trimester">1st Trimester</option>
                      <option value="2nd Trimester">2nd Trimester</option>
                      <option value="3rd Trimester">3rd Trimester</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="button"
              onClick={onClose}
              className="button button--secondary"
              style={{ flex: 1, padding: '1rem', borderRadius: '12px' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="button button--primary"
              style={{ flex: 2, padding: '1rem', borderRadius: '12px' }}
            >
              Save Consultation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
