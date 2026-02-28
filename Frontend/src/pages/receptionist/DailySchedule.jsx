import React, { useState, useEffect } from 'react';
import { getDailyScheduleAPI, getAvailableDoctorsAPI, cancelAppointmentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, X } from 'lucide-react';

const DailySchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [doctorFilter, setDoctorFilter] = useState('');
    const [loading, setLoading] = useState(true);

    const loadSchedule = () => {
        setLoading(true);
        const params = { date: dateFilter };
        if (doctorFilter) params.doctorId = doctorFilter;
        getDailyScheduleAPI(params).then(r => setSchedule(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { getAvailableDoctorsAPI().then(r => setDoctors(r.data.data)); }, []);
    useEffect(() => { loadSchedule(); }, [dateFilter, doctorFilter]);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this appointment?')) return;
        try {
            await cancelAppointmentAPI(id);
            toast.success('Appointment cancelled');
            loadSchedule();
        } catch { toast.error('Failed'); }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">All Doctors</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name}</option>)}
                </select>
                <div className="ml-auto bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm font-medium text-blue-700">
                    {schedule.length} appointment{schedule.length !== 1 ? 's' : ''}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : schedule.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No appointments for this date</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>{['Token', 'Patient', 'Doctor', 'Time', 'Type', 'Status', 'Action'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody>
                            {schedule.map(a => (
                                <tr key={a._id} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="px-4 py-3 text-blue-600 font-bold">#{a.tokenNumber}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-800">{a.patient?.name}</p>
                                        <p className="text-xs text-slate-400">{a.patient?.phone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">Dr. {a.doctor?.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{a.timeSlot}</td>
                                    <td className="px-4 py-3 capitalize text-slate-500">{a.type}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.status === 'completed' ? 'bg-green-50 text-green-700' :
                                            a.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                a.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-orange-50 text-orange-600'
                                            }`}>{a.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {a.status !== 'completed' && a.status !== 'cancelled' && (
                                            <button onClick={() => handleCancel(a._id)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-xs">
                                                <X size={14} /> Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DailySchedule;
