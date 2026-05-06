/*
  =========================================
  DASHBOARD ROUTER PAGE
  =========================================
  Acts as a route guard. If the user is authenticated,
  it checks `user.role` and renders the appropriate dashboard:
  - CITIZEN -> CitizenDashboard
  - ADMIN -> AdminDashboard
  - (POLICE / FIRE_SERVICE / AMBULANCE) -> ResponderDashboard
*/
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import Navbar from '../components/ui/Navbar';
import CitizenDashboard from '../components/dashboard/CitizenDashboard';
import ResponderDashboard from '../components/dashboard/ResponderDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" />;

  const renderDashboard = () => {
    switch (user.role) {
      case 'CITIZEN': return <CitizenDashboard />;
      case 'RESPONDER': return <ResponderDashboard />;
      case 'ADMIN': return <AdminDashboard />;
      default: return <CitizenDashboard />;
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar />
      {renderDashboard()}
    </div>
  );
}
