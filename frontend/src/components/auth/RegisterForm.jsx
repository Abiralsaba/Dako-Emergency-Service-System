import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserCog, Siren, ArrowRight, ArrowLeft } from 'lucide-react';

const roles = [
    { id: 'CITIZEN', label: 'Civilian', icon: <UserPlus size={24} color="#a1a1aa"/>, color: '#a1a1aa' },
    { id: 'POLICE', label: 'Police', icon: <Siren size={24} color="var(--police-blue)"/>, color: 'var(--police-blue)' },
    { id: 'AMBULANCE', label: 'Medical', icon: <Siren size={24} color="var(--ambulance-green)"/>, color: 'var(--ambulance-green)' },
    { id: 'FIRE_SERVICE', label: 'Fire Dept', icon: <Siren size={24} color="var(--accent)"/>, color: 'var(--accent)' },
    { id: 'ADMIN', label: 'Admin', icon: <UserCog size={24} color="#f59e0b"/>, color: '#f59e0b' }
];

export default function RegisterForm({ switchMode }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
      role: '',
      nid: '',
      fullName: '',
      phoneNumber: '',
      password: '',
      homeAddress: '',
      vehicleRegistrationNumber: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);
  
  const submitRegistration = (e) => {
      e.preventDefault();
      console.log("Submitting:", formData);
      // TODO axios POST to either /register/citizen or /register/responder
  }

  return (
    <div>
        <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Enrollment</h2>
            <p style={{ color: '#71717a', margin: 0, marginTop: '4px', fontSize: '14px' }}>
                {step === 1 ? 'Step 1: Declare your clearance level' : 'Step 2: Provide identity parameters'}
            </p>
        </div>

        <AnimatePresence mode="wait">
        {step === 1 && (
            <motion.div 
               key="step1" 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px' }}>
                    {roles.map(r => (
                        <div 
                            key={r.id}
                            onClick={() => setFormData({...formData, role: r.id})}
                            style={{ 
                                padding: '16px', background: 'rgba(0,0,0,0.5)', border: `1px solid ${formData.role === r.id ? r.color : 'rgba(255,255,255,0.1)'}`, 
                                borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                                transition: 'all 0.2s',
                                boxShadow: formData.role === r.id ? `0 0 15px ${r.color}33` : 'none'
                            }}
                        >
                            {r.icon}
                            <span style={{ fontSize: '14px', fontWeight: 600, color: formData.role === r.id ? r.color : '#fff' }}>{r.label}</span>
                        </div>
                    ))}
                </div>
                
                <button onClick={handleNext} disabled={!formData.role} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: formData.role ? 1 : 0.5 }}>
                    Continue <ArrowRight size={20} />
                </button>
            </motion.div>
        )}

        {step === 2 && (
            <motion.form 
                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={submitRegistration}
            >
                <input name="fullName" placeholder="Full Name" className="input-field" onChange={handleChange} required />
                <input name="nid" placeholder="National ID Formatted" className="input-field" onChange={handleChange} required />
                <input name="phoneNumber" placeholder="Phone Number" className="input-field" onChange={handleChange} required />
                <input name="password" type="password" placeholder="Passcode" className="input-field" onChange={handleChange} required />
                
                {formData.role === 'CITIZEN' && (
                    <input name="homeAddress" placeholder="Home Address" className="input-field" onChange={handleChange} required />
                )}
                
                {['POLICE', 'AMBULANCE', 'FIRE_SERVICE'].includes(formData.role) && (
                    <input name="vehicleRegistrationNumber" placeholder="Assigned Vehicle Plate (Optional)" className="input-field" onChange={handleChange} />
                )}
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={handleBack} style={{ padding: '14px', background: 'transparent', color: '#fff', border: '1px solid var(--surface-border)', borderRadius: '8px', cursor: 'pointer' }}><ArrowLeft size={20}/></button>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirm Enrollment</button>
                </div>
            </motion.form>
        )}
        </AnimatePresence>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>
               Already have clearance? <span onClick={switchMode} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, borderBottom: '1px solid var(--accent)' }}>Login</span>
            </p>
        </div>
    </div>
  );
}
