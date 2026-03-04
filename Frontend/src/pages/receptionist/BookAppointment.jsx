import React, { useState, useEffect } from 'react';
import { searchPatientsAPI, getAvailableDoctorsAPI, bookAppointmentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Calendar } from 'lucide-react';

const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

const BookAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [query, setQuery] = useState('');
    const [form, setForm] = useState({ patientId: '', doctorId: '', appointmentDate: '', timeSlot: '', type: 'general', reason: '' });
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        getAvailableDoctorsAPI().then(r => setDoctors(r.data.data));
    }, []);

    const searchPatient = async (q) => {
        setQuery(q);
        if (q.length < 2) { setPatients([]); return; }
        setSearching(true);
        try {
            const res = await searchPatientsAPI(q);
            setPatients(res.data.data);
        } finally { setSearching(false); }
    };

    const selectPatient = (p) => {
        setSelectedPatient(p);
        setForm(f => ({ ...f, patientId: p._id }));
        setQuery(p.name);
        setPatients([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.patientId) return toast.error('Select a patient first');
        setLoading(true);
        try {
            await bookAppointmentAPI(form);
            toast.success('Appointment booked successfully!');
            setForm({ patientId: '', doctorId: '', appointmentDate: '', timeSlot: '', type: 'general', reason: '' });
            setSelectedPatient(null);
            setQuery('');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to book'); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Calendar size={20} className="text-blue-600" />
                    </div>
                    <h2 className="font-semibold text-slate-800">Book New Appointment</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Patient Search */}
                    <div className="relative">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Search Patient *</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={query}
                                onChange={e => searchPatient(e.target.value)}
                                placeholder="Search by name, email, or phone"
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {selectedPatient && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">{selectedPatient.name}</p>
                                    <p className="text-xs text-blue-600">{selectedPatient.email} | {selectedPatient.bloodGroup || 'N/A'}</p>
                                </div>
                                <button type="button" onClick={() => { setSelectedPatient(null); setForm(f => ({ ...f, patientId: '' })); setQuery(''); }} className="text-blue-400 hover:text-blue-600 text-lg font-bold">×</button>
                            </div>
                        )}
                        {patients.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                                {patients.map(p => (
                                    <button key={p._id} type="button" onClick={() => selectPatient(p)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                        <p className="font-medium text-sm text-slate-800">{p.name}</p>
                                        <p className="text-xs text-slate-400">{p.email} | {p.phone}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Select Doctor *</label>
                        <select required value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="">-- Select Doctor --</option>
                            {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization || 'General'} (PKR {d.consultationFee || 0})</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
                            <input type="date" required min={new Date().toISOString().split('T')[0]} value={form.appointmentDate} onChange={e => setForm({ ...form, appointmentDate: e.target.value })}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Time Slot *</label>
                            <select required value={form.timeSlot} onChange={e => setForm({ ...form, timeSlot: e.target.value })}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="">-- Select Time --</option>
                                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="general">General</option>
                                <option value="follow-up">Follow-up</option>
                                <option value="emergency">Emergency</option>
                                <option value="consultation">Consultation</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Reason (Optional)</label>
                            <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Brief reason"
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
                        {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Booking...</> : <><Calendar size={16} /> Book Appointment</>}
                    </button>
                </form>
            </div>
        </div>
    );
};


export default BookAppointment;
