import React, { useState, useEffect } from 'react';
import { getPatientAppointmentsAPI } from '../../services/api';
import { Calendar } from 'lucide-react';

const STATUS_COLORS = { pending: 'bg-orange-50 text-orange-600', confirmed: 'bg-blue-50 text-blue-700', completed: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-600' };

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPatientAppointmentsAPI().then(r => setAppointments(r.data.data)).finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

    return (
        <div className="space-y-5">
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
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[a.status] || 'bg-slate-50 text-slate-500'}`}>{a.status}</span>
                                </div>
                                <p className="text-sm text-slate-500">{a.doctor?.specialization || 'General'}</p>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                                    <span>📅 {new Date(a.appointmentDate).toLocaleDateString()}</span>
                                    <span>🕐 {a.timeSlot}</span>
                                    <span className="capitalize">📋 {a.type}</span>
                                    {a.tokenNumber && <span className="text-blue-500 font-semibold">Token #{a.tokenNumber}</span>}
                                </div>
                                {a.reason && <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">Reason: {a.reason}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientAppointments;
