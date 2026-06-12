import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AppointmentTab() {
    const [appointments, setAppointments] = useState([]);
    const [formData, setFormData] = useState({
        patientName: '', age: '', gender: '', phone: '',
        hospital: '', department: '', preferredDoctor: '',
        appointmentDate: '', appointmentTime: '', urgency: 'Normal', symptoms: ''
    });

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/health/appointments');
            setAppointments(res.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/health/appointments', formData);
            fetchAppointments();
            alert('Appointment requested successfully!');
            setFormData({
                patientName: '', age: '', gender: '', phone: '',
                hospital: '', department: '', preferredDoctor: '',
                appointmentDate: '', appointmentTime: '', urgency: 'Normal', symptoms: ''
            });
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment.');
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Book an Appointment</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                            <input required type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="health-input" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <input required type="number" name="age" value={formData.age} onChange={handleChange} className="health-input" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select required name="gender" value={formData.gender} onChange={handleChange} className="health-input">
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="health-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Clinic</label>
                            <input required type="text" name="hospital" value={formData.hospital} onChange={handleChange} className="health-input" placeholder="e.g. Dhaka Medical College" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select required name="department" value={formData.department} onChange={handleChange} className="health-input">
                                <option value="">Select Department</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Neurology">Neurology</option>
                                <option value="Orthopedics">Orthopedics</option>
                                <option value="Pediatrics">Pediatrics</option>
                                <option value="General Medicine">General Medicine</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Doctor (Optional)</label>
                            <input type="text" name="preferredDoctor" value={formData.preferredDoctor} onChange={handleChange} className="health-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input required type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} className="health-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time (Optional)</label>
                            <input type="time" name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} className="health-input" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                            <select name="urgency" value={formData.urgency} onChange={handleChange} className="health-input">
                                <option value="Normal">Normal</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Emergency">Emergency</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms Description</label>
                            <textarea required name="symptoms" value={formData.symptoms} onChange={handleChange} rows="3" className="health-input"></textarea>
                        </div>
                    </div>
                    <button type="submit" className="health-btn-primary px-6 py-3 rounded-lg font-semibold w-full mt-4">
                        Book Appointment
                    </button>
                </form>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Your Appointments</h2>
                {appointments.length === 0 ? (
                    <p className="text-gray-500">No appointments found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {appointments.map(apt => (
                            <div key={apt.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{apt.department}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${apt.status === 'PENDING' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                        {apt.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600"><strong>Hospital:</strong> {apt.hospital}</p>
                                <p className="text-sm text-gray-600"><strong>Date:</strong> {apt.appointmentDate} {apt.appointmentTime}</p>
                                <p className="text-sm text-gray-600"><strong>Doctor:</strong> {apt.preferredDoctor || 'Any Available'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
