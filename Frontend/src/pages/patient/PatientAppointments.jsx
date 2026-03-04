import React, { useState, useEffect } from 'react';
import { getPatientAppointmentsAPI, cancelPatientAppointmentAPI } from '../../services/api';
import { Calendar, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = { pending: 'bg-orange-50 text-orange-600', confirmed: 'bg-blue-50 text-blue-700', completed: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-600' };

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [cancelAppt, setCancelAppt] = useState(null); // For cancel confirmation modal

    const loadAppointments = () => {
        setLoading(true);
        getPatientAppointmentsAPI().then(r => setAppointments(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { loadAppointments(); }, []);

    const handleCancelAppointment = async () => {
        try {
            await cancelPatientAppointmentAPI(cancelAppt._id);
            toast.success('Appointment cancelled successfully');
            setCancelAppt(null);
            loadAppointments();
        } catch {
            toast.error('Failed to cancel appointment');
        }
    };

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

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
                                    Are you sure you want to cancel your appointment with <span className="font-semibold">Dr. {cancelAppt.doctor?.name}</span>?
                                </p>
                                <div className="mt-2 text-xs text-slate-500">
                                    <div>Time: {cancelAppt.timeSlot}</div>
                                    <div>Date: {new Date(cancelAppt.appointmentDate).toLocaleDateString()}</div>
                                    <div className="capitalize">Type: {cancelAppt.type}</div>
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

            <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{s}</button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No appointments found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(a => (
                        <div key={a._id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                <Calendar size={20} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-slate-800">Dr. {a.doctor?.name}</h4>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[a.status] || 'bg-slate-50 text-slate-500'}`}>{a.status}</span>
                                        {a.status === 'cancelled' && a.cancelledByRole && (
                                            <span className="text-xs text-slate-500">
                                                by {a.cancelledByRole}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500">{a.doctor?.specialization || 'General'}</p>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                                    <span>📅 {new Date(a.appointmentDate).toLocaleDateString()}</span>
                                    <span>🕐 {a.timeSlot}</span>
                                    <span className="capitalize">📋 {a.type}</span>
                                    {a.tokenNumber && <span className="text-blue-500 font-semibold">Token #{a.tokenNumber}</span>}
                                </div>
                                {a.reason && <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">Reason: {a.reason}</p>}
                                {a.status !== 'completed' && a.status !== 'cancelled' && (
                                    <button
                                        onClick={() => setCancelAppt(a)}
                                        className="mt-3 text-red-600 hover:text-red-700 flex items-center gap-1 text-xs font-medium"
                                    >
                                        <XCircle size={14} />
                                        <span>Cancel Appointment</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientAppointments;
