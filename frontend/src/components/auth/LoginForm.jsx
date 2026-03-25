import React, { useState } from 'react';
import { Fingerprint, ArrowRight } from 'lucide-react';

export default function LoginForm({ switchMode }) {
  const [nid, setNid] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login payload:", { nid, password });
    // TODO: wire up axios post to /api/auth/login
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
         <div style={{ background: 'rgba(225, 29, 72, 0.1)', padding: '12px', borderRadius: '12px' }}>
           <Fingerprint color="var(--accent)" size={28} />
         </div>
         <div>
             <h2 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Network Authentication</h2>
             <p style={{ color: '#71717a', margin: 0, marginTop: '4px', fontSize: '14px' }}>Verify your identity to proceed.</p>
         </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>National ID</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Enter your registered NID"
            value={nid}
            onChange={e => setNid(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '40px' }}>
           <label style={{ display: 'block', marginBottom: '8px', color: '#a1a1aa', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Passcode</label>
           <input 
            type="password" 
            className="input-field" 
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span>Establish Connection</span>
            <ArrowRight size={20} />
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
         <p style={{ color: '#a1a1aa', fontSize: '14px' }}>
            Unrecognized entity? <span onClick={switchMode} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, borderBottom: '1px solid var(--accent)' }}>Register into the Grid</span>
         </p>
      </div>
    </div>
  );
}
