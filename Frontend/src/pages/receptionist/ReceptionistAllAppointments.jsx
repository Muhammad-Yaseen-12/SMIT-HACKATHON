import React, { useState, useEffect } from 'react';
import { getAllAppointmentsAPI, getAvailableDoctorsAPI, cancelAppointmentAPI } from '../../services/api';
import { Calendar, Clock, User, ClipboardList, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const ReceptionistAllAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [doctorFilter, setDoctorFilter] = useState('');
    const [cancelAppt, setCancelAppt] = useState(null);

    const fetchAppts = () => {
        setLoading(true);
        const params = {};
        if (dateFilter) params.date = dateFilter;
        if (statusFilter) params.status = statusFilter;
        if (doctorFilter) params.doctorId = doctorFilter;
        getAllAppointmentsAPI(params).then(r => setAppointments(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => {
        getAvailableDoctorsAPI().then(r => setDoctors(r.data.data));
    }, []);
    useEffect(() => { fetchAppts(); }, [dateFilter, statusFilter, doctorFilter]);

    const handleCancelAppointment = async () => {
        try {
            await cancelAppointmentAPI(cancelAppt._id);
            toast.success('Appointment cancelled successfully');
            setCancelAppt(null);
            fetchAppts();
        } catch {
            toast.error('Failed to cancel appointment');
        }
    };

    // Group appointments by date
    const groupedAppointments = appointments.reduce((acc, apt) => {
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

    // Sort appointments within each date by doctor name, then by token number
    Object.keys(groupedAppointments).forEach(dateKey => {
        groupedAppointments[dateKey].sort((a, b) => {
            const doctorA = a.doctor?.name || '';
            const doctorB = b.doctor?.name || '';
            if (doctorA !== doctorB) return doctorA.localeCompare(doctorB);
            return a.tokenNumber - b.tokenNumber;
        });
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
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                        <ClipboardList size={20} className="text-purple-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-800">All Appointments</h2>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                    <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                        <option value="">All Doctors</option>
                        {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    {(dateFilter || statusFilter || doctorFilter) && (
                        <button
                            onClick={() => { setDateFilter(''); setStatusFilter(''); setDoctorFilter(''); }}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 text-slate-600 font-medium whitespace-nowrap"
                        >
                            Clear Filters
                        </button>
                    )}
                    <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-2 text-sm font-medium text-purple-700 text-center whitespace-nowrap">
                        {appointments.length} Appointment{appointments.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : appointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-16 text-center text-slate-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm md:text-base">No Appointments</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(groupedAppointments).map(([dateLabel, apts]) => {
                        const aptDate = new Date(apts[0].appointmentDate);
                        aptDate.setHours(0, 0, 0, 0);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isPast = aptDate < today;
                        const isToday = aptDate.getTime() === today.getTime();
                        const isUpcoming = aptDate > today;

                        return (
                            <div key={dateLabel} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className={`border-b px-4 py-2.5 ${isToday ? 'bg-blue-50 border-blue-100' :
                                    isPast ? 'bg-purple-50 border-purple-100' :
                                        'bg-green-50 border-green-100'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className={
                                            isToday ? 'text-blue-600' :
                                                isPast ? 'text-slate-400' :
                                                    'text-green-600'
                                        } />
                                        <h3 className={`font-semibold text-sm ${isToday ? 'text-blue-900' :
                                            isPast ? 'text-slate-600' :
                                                'text-green-900'
                                            }`}>
                                            {dateLabel}
                                            {isToday && <span className="ml-2 text-xs font-normal text-blue-600">(Today)</span>}
                                            {isPast && <span className="ml-2 text-xs font-normal text-slate-500">(Past)</span>}
                                            {isUpcoming && <span className="ml-2 text-xs font-normal text-green-600">(Upcoming)</span>}
                                        </h3>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[700px]">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                {['Token', 'Time', 'Patient', 'Contact', 'Doctor', 'Type', 'Status', 'Actions'].map(h => (
                                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {apts.map(a => (
                                                <tr key={a._id} className="border-b border-slate-50 hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-purple-600 font-bold whitespace-nowrap">#{a.tokenNumber}</td>
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
                                                                <span className="text-xs text-slate-500">
                                                                    by {a.cancelledByRole}
                                                                </span>
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
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ReceptionistAllAppointments;
