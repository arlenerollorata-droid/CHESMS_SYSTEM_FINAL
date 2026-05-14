import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes, faVial, faCalendarCheck } from "@fortawesome/free-solid-svg-icons"

export default function LabResultForm({ patientId, onClose, onSuccess, onSave }) {
  const today = new Date().toISOString().split('T')[0]
  
  const [formData, setFormData] = useState({
    testName: '',
    result: '',
    normalRange: '',
    dateOfTest: today,
    remarks: 'Normal',
    notes: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.testName || !formData.result || !formData.dateOfTest) {
      alert('Please fill in required fields')
      return
    }
    
    if (onSave) {
      await onSave(formData)
    }
    alert('Lab result saved successfully!')
    onSuccess && onSuccess()
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 5000, padding: '1rem'
    }}>
      <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #10B981, #059669)', padding: '1.5rem 2rem', color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
              <FontAwesomeIcon icon={faVial} style={{ marginRight: '10px' }} />
              Add Lab Result
            </h2>
            <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.85rem' }}>Record a lab test result</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>TEST NAME *</label>
              <input type="text" value={formData.testName} onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                placeholder="e.g. Complete Blood Count" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>RESULT *</label>
              <input type="text" value={formData.result} onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                placeholder="e.g. 5.6 mmol/L" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>NORMAL RANGE</label>
              <input type="text" value={formData.normalRange} onChange={(e) => setFormData({ ...formData, normalRange: e.target.value })}
                placeholder="e.g. 3.9-6.1 mmol/L" style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>DATE OF TEST *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="date" value={formData.dateOfTest} onChange={(e) => setFormData({ ...formData, dateOfTest: e.target.value })}
                  style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: '2px solid #10B981', fontWeight: 600, outline: 'none' }} />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, dateOfTest: today })}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px', background: '#D1FAE5', border: '2px solid #10B981', borderRadius: '12px', color: '#10B981', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  <FontAwesomeIcon icon={faCalendarCheck} style={{ fontSize: '0.9rem' }} />
                  Today
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>REMARKS</label>
              <select value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600 }}>
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
                <option value="For Review">For Review</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>NOTES</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600, resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} className="button button--secondary" style={{ flex: 1, padding: '1rem', borderRadius: '12px' }}>Cancel</button>
            <button type="submit" className="button button--primary" style={{ flex: 2, padding: '1rem', borderRadius: '12px' }}>Save Lab Result</button>
          </div>
        </form>
      </div>
    </div>
  )
}
