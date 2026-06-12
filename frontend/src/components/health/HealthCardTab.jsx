import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function HealthCardTab() {
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '', fatherName: '', motherName: '', nid: '', dob: '',
        gender: '', bloodGroup: '', phone: '', emergencyContact: '',
        division: '', district: '', upazila: '', address: '',
        allergies: '', chronicDiseases: '', disability: ''
    });

    useEffect(() => {
        fetchCard();
    }, []);

    const fetchCard = async () => {
        try {
            const res = await api.get('/health/cards');
            if (res.data) setCard(res.data);
        } catch (error) {
            console.error('Error fetching health card:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/health/cards', formData);
            setCard(res.data);
            alert('Health Card application submitted successfully!');
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Failed to submit application.');
        }
    };

    if (loading) return <div>Loading...</div>;

    if (card) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-red-600">Smart Health Card</h2>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-500 text-sm">Full Name</p>
                        <p className="font-medium text-lg">{card.fullName}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">NID Number</p>
                        <p className="font-medium">{card.nid}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Date of Birth</p>
                        <p className="font-medium">{card.dob}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Blood Group</p>
                        <p className="font-medium text-red-600 font-bold">{card.bloodGroup}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Phone</p>
                        <p className="font-medium">{card.phone}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Emergency Contact</p>
                        <p className="font-medium">{card.emergencyContact}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply for Health Card</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input required type="text" name="fullName" onChange={handleChange} className="health-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NID Number</label>
                        <input required type="text" name="nid" onChange={handleChange} className="health-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input required type="date" name="dob" onChange={handleChange} className="health-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select required name="gender" onChange={handleChange} className="health-input">
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                        <input type="text" name="bloodGroup" onChange={handleChange} className="health-input" placeholder="e.g. O+" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input required type="tel" name="phone" onChange={handleChange} className="health-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                        <input required type="text" name="division" onChange={handleChange} className="health-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                        <input required type="text" name="district" onChange={handleChange} className="health-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upazila</label>
                        <input required type="text" name="upazila" onChange={handleChange} className="health-input" />
                    </div>
                </div>
                <button type="submit" className="health-btn-primary px-6 py-3 rounded-lg font-semibold w-full mt-4">
                    Submit Application
                </button>
            </form>
        </div>
    );
}
