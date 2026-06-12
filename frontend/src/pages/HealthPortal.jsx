import React, { useState, useEffect } from 'react';
import { ShieldPlus, Activity, FileText, Syringe, CalendarPlus, AlertTriangle, LogOut, Ambulance } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/health.css';

import OverviewTab from '../components/health/OverviewTab';
import HealthCardTab from '../components/health/HealthCardTab';
import VaccinationTab from '../components/health/VaccinationTab';
import AppointmentTab from '../components/health/AppointmentTab';
import ComplaintTab from '../components/health/ComplaintTab';

export default function HealthPortal() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
    }, [navigate]);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab />;
            case 'card': return <HealthCardTab />;
            case 'vaccination': return <VaccinationTab />;
            case 'appointment': return <AppointmentTab />;
            case 'complaint': return <ComplaintTab />;
            default: return <OverviewTab />;
        }
    };

    return (
        <div className="health-portal flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="health-sidebar w-64 flex-shrink-0 flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="p-6 flex items-center space-x-3 border-b border-red-700">
                        <Activity size={32} className="text-white" />
                        <div>
                            <h1 className="text-xl font-bold text-white">স্বাস্থ্য মন্ত্রণালয়</h1>
                            <p className="text-xs text-red-200">Govt of Bangladesh</p>
                        </div>
                    </div>
                    <nav className="p-4 space-y-2 mt-4">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        >
                            <ShieldPlus size={20} />
                            <span className="font-medium">Overview</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('card')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg nav-item ${activeTab === 'card' ? 'active' : ''}`}
                        >
                            <FileText size={20} />
                            <span className="font-medium">Health Card</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('vaccination')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg nav-item ${activeTab === 'vaccination' ? 'active' : ''}`}
                        >
                            <Syringe size={20} />
                            <span className="font-medium">Vaccination</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('appointment')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg nav-item ${activeTab === 'appointment' ? 'active' : ''}`}
                        >
                            <CalendarPlus size={20} />
                            <span className="font-medium">Appointments</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('complaint')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg nav-item ${activeTab === 'complaint' ? 'active' : ''}`}
                        >
                            <AlertTriangle size={20} />
                            <span className="font-medium">Complaints</span>
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-red-700">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg nav-item text-red-100 hover:text-white"
                    >
                        <Ambulance size={20} />
                        <span className="font-medium">Return to SERDS</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="health-header h-16 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center md:hidden text-red-700 font-bold">
                        <Activity size={24} className="mr-2" />
                        স্বাস্থ্য মন্ত্রণালয়
                    </div>
                    <div className="hidden md:block text-lg font-semibold text-gray-800">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login');
                        }}
                        className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="hidden sm:inline font-medium">Logout</span>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
}
