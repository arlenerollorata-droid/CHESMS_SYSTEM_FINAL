import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes, faPills, faCalendarCheck } from "@fortawesome/free-solid-svg-icons"

export default function PrescriptionForm({ patientId, onClose, onSuccess, onSave }) {
  const today = new Date().toISOString().split('T')[0]
  
  const [formData, setFormData] = useState({
    medicine: '',
    dosage: '',
    frequency: 'Twice a day',
    duration: '',
    datePrescribed: today,
    notes: ''
  })

  const frequencies = ['Once a day', 'Twice a day', '3x a day', 'Every 6 hours', 'Every 8 hours', 'As needed']

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.medicine || !formData.dosage || !formData.duration) {
      alert('Please fill in required fields')
      return
    }
    
    if (onSave) {
      await onSave(formData)
    }
    alert('Prescription saved successfully!')
    onSuccess && onSuccess()
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
        maxWidth: '500px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
          padding: '1.5rem 2rem',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
              <FontAwesomeIcon icon={faPills} style={{ marginRight: '10px' }} />
              Add Prescription
            </h2>
            <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.85rem' }}>Record a new prescription</p>
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
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>MEDICINE NAME *</label>
              <input
                type="text"
                value={formData.medicine}
                onChange={(e) => setFormData({ ...formData, medicine: e.target.value })}
                placeholder="e.g. Amlodipine"
                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>DOSAGE *</label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g. 500mg"
                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>FREQUENCY *</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }}
              >
                {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>DURATION *</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 7 days"
                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>DATE PRESCRIBED</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  value={formData.datePrescribed}
                  onChange={(e) => setFormData({ ...formData, datePrescribed: e.target.value })}
                  style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: '2px solid #8B5CF6', fontWeight: 600, outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, datePrescribed: today })}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px', background: '#F3E8FF', border: '2px solid #8B5CF6', borderRadius: '12px', color: '#8B5CF6', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  <FontAwesomeIcon icon={faCalendarCheck} style={{ fontSize: '0.9rem' }} />
                  Today
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>NOTES</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} className="button button--secondary" style={{ flex: 1, padding: '1rem', borderRadius: '12px' }}>Cancel</button>
            <button type="submit" className="button button--primary" style={{ flex: 2, padding: '1rem', borderRadius: '12px' }}>Save Prescription</button>
          </div>
        </form>
      </div>
    </div>
  )
}
