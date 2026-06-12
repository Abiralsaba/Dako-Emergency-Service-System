import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Activity, ShieldCheck, HeartPulse, Clock, ArrowRight } from 'lucide-react';

export default function OverviewTab() {
    const [stats, setStats] = useState({
        hasHealthCard: false,
        vaccineCount: 0,
        appointmentCount: 0,
        complaintCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/health/stats');
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching health stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome to Health Portal</h2>
                    <p className="text-gray-500 mt-1">Manage your health records, appointments, and vaccinations.</p>
                </div>
                <div className="hidden sm:block">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg" alt="BD Govt" className="h-16 w-16 opacity-80" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="health-card p-6 flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="health-stat-label">Health Card Status</p>
                            <h3 className="health-stat-value mt-2 text-2xl flex items-center">
                                {stats.hasHealthCard ? <><ShieldCheck className="text-green-500 mr-2" /> Active</> : <span className="text-gray-400">Not Applied</span>}
                            </h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg text-red-600">
                            <Activity size={24} />
                        </div>
                    </div>
                </div>

                <div className="health-card p-6 flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="health-stat-label">Vaccinations</p>
                            <h3 className="health-stat-value mt-2 text-3xl">{stats.vaccineCount}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <HeartPulse size={24} />
                        </div>
                    </div>
                </div>

                <div className="health-card p-6 flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="health-stat-label">Appointments</p>
                            <h3 className="health-stat-value mt-2 text-3xl">{stats.appointmentCount}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <Clock size={24} />
                        </div>
                    </div>
                </div>

                <div className="health-card p-6 flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="health-stat-label">Complaints Filed</p>
                            <h3 className="health-stat-value mt-2 text-3xl">{stats.complaintCount}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                            <Activity size={24} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                        <p className="font-medium text-red-600 flex items-center justify-between">
                            Health Ministry Website <ArrowRight size={16} />
                        </p>
                    </div>
                    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                        <p className="font-medium text-red-600 flex items-center justify-between">
                            Emergency Hotline (16263) <ArrowRight size={16} />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
