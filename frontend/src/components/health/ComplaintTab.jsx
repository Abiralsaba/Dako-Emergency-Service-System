import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ComplaintTab() {
    const [complaints, setComplaints] = useState([]);
    const [formData, setFormData] = useState({
        complaintType: 'Hospital Service',
        hospitalName: '',
        division: '',
        district: '',
        description: ''
    });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/health/complaints');
            setComplaints(res.data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/health/complaints', formData);
            fetchComplaints();
            alert('Complaint submitted successfully!');
            setFormData({ ...formData, description: '', hospitalName: '' });
        } catch (error) {
            console.error('Error submitting complaint:', error);
            alert('Failed to submit complaint.');
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-red-600">File a Health Complaint</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Type</label>
                            <select name="complaintType" value={formData.complaintType} onChange={handleChange} className="health-input">
                                <option value="Hospital Service">Hospital Service</option>
                                <option value="Doctor Behavior">Doctor Behavior</option>
                                <option value="Irregularity">Irregularity / Corruption</option>
                                <option value="Overcharging">Overcharging</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Clinic Name</label>
                            <input required type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange} className="health-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                            <input required type="text" name="division" value={formData.division} onChange={handleChange} className="health-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                            <input required type="text" name="district" value={formData.district} onChange={handleChange} className="health-input" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" className="health-input" placeholder="Please describe your complaint in detail..."></textarea>
                        </div>
                    </div>
                    <button type="submit" className="health-btn-primary px-6 py-3 rounded-lg font-semibold w-full mt-4">
                        Submit Complaint
                    </button>
                </form>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Your Complaints</h2>
                {complaints.length === 0 ? (
                    <p className="text-gray-500">No complaints filed.</p>
                ) : (
                    <div className="space-y-4">
                        {complaints.map(comp => (
                            <div key={comp.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{comp.complaintType}</h3>
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                                        {comp.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2"><strong>Hospital:</strong> {comp.hospitalName}</p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{comp.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
