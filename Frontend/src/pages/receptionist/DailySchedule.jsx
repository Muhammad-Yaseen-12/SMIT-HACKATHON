import React, { useState, useEffect } from 'react';
import { getDailyScheduleAPI, getAvailableDoctorsAPI, cancelAppointmentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, XCircle, AlertTriangle } from 'lucide-react';

const DailySchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [doctorFilter, setDoctorFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [cancelAppt, setCancelAppt] = useState(null); // For cancel confirmation modal

    const loadSchedule = () => {
        setLoading(true);
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const params = { date: todayStr }; // Always fetch today's appointments
        if (doctorFilter) params.doctorId = doctorFilter;
        getDailyScheduleAPI(params).then(r => {
            // Additional client-side filtering to ensure only today's appointments
            const filtered = r.data.data.filter(apt => {
                const aptDate = new Date(apt.appointmentDate);
                const aptDateStr = `${aptDate.getFullYear()}-${String(aptDate.getMonth() + 1).padStart(2, '0')}-${String(aptDate.getDate()).padStart(2, '0')}`;
                return aptDateStr === todayStr;
            });
            // Sort by doctor name, then by token number
            filtered.sort((a, b) => {
                const doctorA = a.doctor?.name || '';
                const doctorB = b.doctor?.name || '';
                if (doctorA !== doctorB) return doctorA.localeCompare(doctorB);
                return a.tokenNumber - b.tokenNumber;
            });
            setSchedule(filtered);
        }).finally(() => setLoading(false));
    };

    useEffect(() => { getAvailableDoctorsAPI().then(r => setDoctors(r.data.data)); }, []);
    useEffect(() => { loadSchedule(); }, [doctorFilter]);

    const handleCancelAppointment = async () => {
        try {
            await cancelAppointmentAPI(cancelAppt._id);
            toast.success('Appointment cancelled successfully');
            setCancelAppt(null);
            loadSchedule();
        } catch {
            toast.error('Failed to cancel appointment');
        }
    };

    return (
        <div className="space-y-5">
            {/* Cancel Confirmation Modal */}
            {cancelAppt && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setCancelAppt(null)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Cancel Appointment?</h3>
                                <p className="text-sm text-slate-600">
                                    Are you sure you want to cancel this appointment with <span className="font-semibold">{cancelAppt.patient?.name}</span>?
                                </p>
                                <div className="mt-2 text-xs text-slate-500">
                                    <div>Token: #{cancelAppt.tokenNumber}</div>
                                    <div>Doctor: Dr. {cancelAppt.doctor?.name}</div>
                                    <div>Time: {cancelAppt.timeSlot}</div>
                                    <div>Date: {new Date(cancelAppt.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCancelAppt(null)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Keep Appointment
                            </button>
                            <button
                                onClick={handleCancelAppointment}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold text-white"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Calendar size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-800">Today's Appointments</h2>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">All Doctors</option>
                        {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name}</option>)}
                    </select>
                    {doctorFilter && (
                        <button
                            onClick={() => setDoctorFilter('')}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 text-slate-600 font-medium whitespace-nowrap"
                        >
                            Clear Filter
                        </button>
                    )}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm font-medium text-blue-700 text-center whitespace-nowrap">
                        {schedule.length} Appointment{schedule.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : schedule.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-16 text-center text-slate-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm md:text-base">No Appointments for Today</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[700px]">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>{['Token', 'Time', 'Patient', 'Contact', 'Doctor', 'Type', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody>
                                {schedule.map(a => (
                                    <tr key={a._id} className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="px-4 py-3 text-blue-600 font-bold whitespace-nowrap">#{a.tokenNumber}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-slate-400" />
                                                <span className="font-medium text-slate-700">{a.timeSlot}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {a.patient?.profileImageUrl ? (
                                                    <img src={a.patient.profileImageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                                        <User size={14} className="text-slate-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-slate-800">{a.patient?.name}</p>
                                                    <p className="text-xs text-slate-400">{a.patient?.gender} | {a.patient?.bloodGroup || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{a.patient?.phone}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <p className="font-medium text-slate-700">Dr. {a.doctor?.name}</p>
                                            <p className="text-xs text-slate-400">{a.doctor?.specialization || 'General'}</p>
                                        </td>
                                        <td className="px-4 py-3 capitalize text-slate-500 whitespace-nowrap">{a.type}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${a.status === 'completed' ? 'bg-green-50 text-green-700' :
                                                    a.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                        a.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                                                            'bg-orange-50 text-orange-600'
                                                    }`}>{a.status}</span>
                                                {a.status === 'cancelled' && a.cancelledByRole && (
                                                    <span className="text-xs text-slate-500">by {a.cancelledByRole}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {a.status !== 'completed' && a.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => setCancelAppt(a)}
                                                    className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs font-medium"
                                                    title="Cancel appointment"
                                                >
                                                    <XCircle size={14} />
                                                    <span>Cancel</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailySchedule;
