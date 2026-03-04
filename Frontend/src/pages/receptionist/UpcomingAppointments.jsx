import React, { useState, useEffect } from 'react';
import { getUpcomingAppointmentsAPI, getAvailableDoctorsAPI, cancelAppointmentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, X, XCircle, CalendarClock, AlertTriangle, ChevronDown } from 'lucide-react';

const UpcomingAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [doctorFilter, setDoctorFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [cancelAppt, setCancelAppt] = useState(null); // For cancel confirmation modal

    const loadAppointments = () => {
        setLoading(true);
        const params = {};
        if (doctorFilter) params.doctorId = doctorFilter;
        getUpcomingAppointmentsAPI(params).then(r => setAppointments(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { getAvailableDoctorsAPI().then(r => setDoctors(r.data.data)); }, []);
    useEffect(() => { loadAppointments(); }, [doctorFilter]);

    const handleCancelAppointment = async () => {
        try {
            await cancelAppointmentAPI(cancelAppt._id);
            toast.success('Appointment cancelled successfully');
            setCancelAppt(null);
            loadAppointments();
        } catch {
            toast.error('Failed to cancel appointment');
        }
    };

    // Filter appointments by selected date if any
    const filteredAppointments = appointments.filter(apt => {
        if (!dateFilter) return true;
        const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
        return aptDate === dateFilter;
    });

    const groupedAppointments = filteredAppointments.reduce((acc, apt) => {
        const dateKey = new Date(apt.appointmentDate).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(apt);
        return acc;
    }, {});

    // Sort appointments within each date by token number
    Object.keys(groupedAppointments).forEach(dateKey => {
        groupedAppointments[dateKey].sort((a, b) => a.tokenNumber - b.tokenNumber);
    });

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
                                    <div>Date: {new Date(cancelAppt.appointmentDate).toLocaleDateString()}</div>
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

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <CalendarClock size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-800">Upcoming Appointments</h2>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <div className="relative">
                        <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}
                            className="pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none w-full cursor-pointer">
                            <option value="">All Doctors</option>
                            {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    {(dateFilter || doctorFilter) && (
                        <button
                            onClick={() => { setDateFilter(''); setDoctorFilter(''); }}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 text-slate-600 font-medium whitespace-nowrap"
                        >
                            Clear Filters
                        </button>
                    )}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm font-medium text-blue-700 text-center whitespace-nowrap">
                        {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-16 text-center text-slate-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm md:text-base">No upcoming appointments</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(groupedAppointments).map(([dateLabel, apts]) => (
                        <div key={dateLabel} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-blue-600" />
                                    <h3 className="font-semibold text-blue-900 text-sm">{dateLabel}</h3>
                                    <span className="text-xs text-blue-600 ml-auto">{apts.length} appointment{apts.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[700px]">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>{['Token', 'Patient', 'Doctor', 'Time', 'Type', 'Status', 'Action'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">{h}</th>
                                        ))}</tr>
                                    </thead>
                                    <tbody>
                                        {apts.map(a => (
                                            <tr key={a._id} className="border-b border-slate-50 hover:bg-slate-50">
                                                <td className="px-4 py-3 text-blue-600 font-bold whitespace-nowrap">#{a.tokenNumber}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <p className="font-medium text-slate-800">{a.patient?.name}</p>
                                                    <p className="text-xs text-slate-400">{a.patient?.phone}</p>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <p className="font-medium text-slate-700">Dr. {a.doctor?.name}</p>
                                                    <p className="text-xs text-slate-400">{a.doctor?.specialization || 'General'}</p>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{a.timeSlot}</td>
                                                <td className="px-4 py-3 capitalize text-slate-500 whitespace-nowrap">{a.type}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${a.status === 'confirmed' ? 'bg-blue-50 text-blue-700' : a.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                                                            }`}>{a.status}</span>
                                                        {a.status === 'cancelled' && a.cancelledByRole && (
                                                            <span className="text-xs text-slate-500">by {a.cancelledByRole}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {a.status !== 'completed' && a.status !== 'cancelled' && (
                                                        <button onClick={() => setCancelAppt(a)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-xs">
                                                            <XCircle size={14} /> Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingAppointments;
