import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmergencyScene from '../components/3d/EmergencyScene';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Left side: 3D Scene */}
      <div style={{ flex: 1, position: 'relative', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <EmergencyScene />
        <div style={{ position: 'absolute', bottom: 50, left: 50, pointerEvents: 'none' }}>
           <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '10px', letterSpacing: '-1px' }}>
             Dispatch<span style={{color: 'var(--accent)'}}>OS</span>
           </h1>
           <p style={{ color: '#a1a1aa', fontSize: '1.2rem', maxWidth: '450px', lineHeight: 1.5 }}>
             Next-generation emergency intelligence. Real-time coordination between citizens and first responders.
           </p>
        </div>
      </div>

      {/* Right side: Auth Forms */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'radial-gradient(circle at 50% 50%, rgba(20,20,25,1) 0%, rgba(9,9,11,1) 100%)' }}>
          <AnimatePresence mode="wait">
             {isLogin ? (
                 <motion.div 
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{ width: '100%', maxWidth: '480px', padding: '40px', borderRadius: '16px' }}
                    className="glass-panel"
                 >
                     <LoginForm switchMode={() => setIsLogin(false)} />
                 </motion.div>
             ) : (
                 <motion.div 
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{ width: '100%', maxWidth: '480px', padding: '40px', borderRadius: '16px' }}
                    className="glass-panel"
                 >
                     <RegisterForm switchMode={() => setIsLogin(true)} />
                 </motion.div>
             )}
          </AnimatePresence>
      </div>
    </div>
  );
}
