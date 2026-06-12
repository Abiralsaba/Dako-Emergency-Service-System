import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function VaccinationTab() {
    const [records, setRecords] = useState([]);
    const [formData, setFormData] = useState({
        vaccineType: 'COVID-19',
        vaccineName: '',
        doseNumber: 1,
        preferredDate: '',
        preferredCenter: ''
    });

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await api.get('/health/vaccinations');
            setRecords(res.data);
        } catch (error) {
            console.error('Error fetching vaccinations:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/health/vaccinations', formData);
            fetchRecords();
            alert('Vaccination registered successfully!');
            setFormData({ ...formData, vaccineName: '', preferredDate: '', preferredCenter: '' });
        } catch (error) {
            console.error('Error registering:', error);
            alert('Failed to register.');
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Vaccine Registration</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Type</label>
                            <select name="vaccineType" value={formData.vaccineType} onChange={handleChange} className="health-input">
                                <option value="COVID-19">COVID-19</option>
                                <option value="Hepatitis B">Hepatitis B</option>
                                <option value="Polio">Polio</option>
                                <option value="Tetanus">Tetanus</option>
                                <option value="Influenza">Influenza</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Name</label>
                            <input required type="text" name="vaccineName" value={formData.vaccineName} onChange={handleChange} className="health-input" placeholder="e.g. Pfizer, Moderna" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dose Number</label>
                            <input required type="number" min="1" name="doseNumber" value={formData.doseNumber} onChange={handleChange} className="health-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                            <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} className="health-input" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Center</label>
                            <input required type="text" name="preferredCenter" value={formData.preferredCenter} onChange={handleChange} className="health-input" placeholder="Hospital or Clinic name" />
                        </div>
                    </div>
                    <button type="submit" className="health-btn-primary px-6 py-3 rounded-lg font-semibold w-full mt-4">
                        Register for Vaccine
                    </button>
                </form>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Your Records</h2>
                {records.length === 0 ? (
                    <p className="text-gray-500">No vaccination records found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-3 font-semibold text-gray-600">Type</th>
                                    <th className="py-3 font-semibold text-gray-600">Name</th>
                                    <th className="py-3 font-semibold text-gray-600">Dose</th>
                                    <th className="py-3 font-semibold text-gray-600">Center</th>
                                    <th className="py-3 font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id} className="border-b border-gray-100">
                                        <td className="py-3">{record.vaccineType}</td>
                                        <td className="py-3 font-medium">{record.vaccineName}</td>
                                        <td className="py-3">Dose {record.doseNumber}</td>
                                        <td className="py-3">{record.preferredCenter}</td>
                                        <td className="py-3">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
