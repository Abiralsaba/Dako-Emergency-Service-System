import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserCog, Siren, ArrowRight, ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const roles = [
    { id: 'CITIZEN', label: 'Civilian', icon: <UserPlus size={24} color="#64748b"/>, color: '#64748b' },
    { id: 'POLICE', label: 'Police', icon: <Siren size={24} color="var(--police-blue)"/>, color: 'var(--police-blue)' },
    { id: 'AMBULANCE', label: 'Medical', icon: <Siren size={24} color="var(--ambulance-green)"/>, color: 'var(--ambulance-green)' },
    { id: 'FIRE_SERVICE', label: 'Fire Dept', icon: <Siren size={24} color="var(--fire-red)"/>, color: 'var(--fire-red)' },
    { id: 'ADMIN', label: 'Admin', icon: <UserCog size={24} color="#f59e0b"/>, color: '#f59e0b' }
];

export default function RegisterForm({ switchMode }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
      role: '',
      nid: '',
      fullName: '',
      phoneNumber: '',
      password: '',
      homeAddress: '',
      vehicleRegistrationNumber: '',
      emergencyContactNumber: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitRegistration = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        let res;
        if (formData.role === 'CITIZEN') {
          res = await authService.registerCitizen({
            fullName: formData.fullName,
            nid: formData.nid,
            phoneNumber: formData.phoneNumber,
            password: formData.password,
            homeAddress: formData.homeAddress,
            emergencyContactNumber: formData.emergencyContactNumber,
          });
        } else {
          const serviceTypeMap = { POLICE: 'POLICE', AMBULANCE: 'AMBULANCE', FIRE_SERVICE: 'FIRE_SERVICE' };
          res = await authService.registerResponder({
            fullName: formData.fullName,
            nid: formData.nid,
            phoneNumber: formData.phoneNumber,
            password: formData.password,
            serviceType: serviceTypeMap[formData.role] || formData.role,
            vehicleRegistrationNumber: formData.vehicleRegistrationNumber,
          });
        }

        login(res.data);
        toast.success('Registration successful!');
        navigate('/dashboard');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Registration failed');
      }
      setLoading(false);
  };

  return (
    <div>
        <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Enrollment</h2>
            <p style={{ color: '#64748b', margin: 0, marginTop: '4px', fontSize: '14px' }}>
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
                                padding: '16px', background: '#ffffff', border: `1px solid ${formData.role === r.id ? r.color : '#cbd5e1'}`, 
                                borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                                transition: 'all 0.2s',
                                boxShadow: formData.role === r.id ? `0 0 15px ${r.color}33` : 'none'
                            }}
                        >
                            {r.icon}
                            <span style={{ fontSize: '14px', fontWeight: 600, color: formData.role === r.id ? r.color : '#0f172a' }}>{r.label}</span>
                        </div>
                    ))}
                </div>
                
                <button onClick={() => setStep(2)} disabled={!formData.role} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: formData.role ? 1 : 0.5 }}>
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
                <input name="nid" placeholder="National ID" className="input-field" onChange={handleChange} required />
                <input name="phoneNumber" placeholder="Phone Number" className="input-field" onChange={handleChange} required />
                <input name="password" type="password" placeholder="Passcode" className="input-field" onChange={handleChange} required />
                
                {formData.role === 'CITIZEN' && (
                    <>
                        <input name="homeAddress" placeholder="Home Address" className="input-field" onChange={handleChange} required />
                        <input name="emergencyContactNumber" placeholder="Emergency Contact Number" className="input-field" onChange={handleChange} />
                    </>
                )}
                
                {['POLICE', 'AMBULANCE', 'FIRE_SERVICE'].includes(formData.role) && (
                    <input name="vehicleRegistrationNumber" placeholder="Vehicle Registration (Optional)" className="input-field" onChange={handleChange} />
                )}
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setStep(1)} style={{ padding: '14px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}><ArrowLeft size={20}/></button>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {loading ? <Loader size={18} className="spin" /> : 'Confirm Enrollment'}
                    </button>
                </div>
            </motion.form>
        )}
        </AnimatePresence>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
               Already have clearance? <span onClick={switchMode} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, borderBottom: '1px solid var(--accent)' }}>Login</span>
            </p>
        </div>
    </div>
  );
}
