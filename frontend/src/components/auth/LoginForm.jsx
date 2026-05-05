import React, { useState } from 'react';
import { Fingerprint, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

export default function LoginForm({ switchMode }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login(phoneNumber, password);
      login(res.data);
      toast.success(`Welcome back, ${res.data.fullName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
         <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
           <Fingerprint color="var(--accent)" size={28} />
         </div>
         <div>
             <h2 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Network Authentication</h2>
             <p style={{ color: '#64748b', margin: 0, marginTop: '4px', fontSize: '14px' }}>Verify your identity to proceed.</p>
         </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Mobile Number</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Enter your registered mobile number"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '40px' }}>
           <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Passcode</label>
           <input 
            type="password" 
            className="input-field" 
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '10px', opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader size={20} className="spin" /> : <><span>Establish Connection</span><ArrowRight size={20} /></>}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
         <p style={{ color: '#64748b', fontSize: '14px' }}>
            Unrecognized entity? <span onClick={switchMode} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, borderBottom: '1px solid var(--accent)' }}>Register into the Grid</span>
         </p>
      </div>
    </div>
  );
}
