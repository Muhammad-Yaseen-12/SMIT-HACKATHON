import React, { useState, useEffect } from 'react';
import { getPatientProfileAPI, getPatientAppointmentsAPI, getPatientPrescriptionsAPI } from '../../services/api';
import StatCard from '../../components/shared/StatCard';
import { Calendar, FileText, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientOverview = () => {
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([getPatientProfileAPI(), getPatientAppointmentsAPI(), getPatientPrescriptionsAPI()])
            .then(([p, a, rx]) => { setProfile(p.data.data); setAppointments(a.data.data); setPrescriptions(rx.data.data); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    const upcoming = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <p className="text-blue-100 text-sm mb-1">Welcome back,</p>
                <h2 className="text-2xl font-bold">{profile?.name}</h2>
                <p className="text-blue-100 text-sm mt-1">{profile?.email}</p>
                {profile?.bloodGroup && <span className="mt-3 inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">Blood: {profile?.bloodGroup}</span>}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Appointments" value={appointments.length} icon={Calendar} color="blue" />
                <StatCard label="Upcoming" value={upcoming.length} icon={Clock} color="orange" />
                <StatCard label="Prescriptions" value={prescriptions.length} icon={FileText} color="green" />
                <StatCard label="Completed Visits" value={appointments.filter(a => a.status === 'completed').length} icon={User} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">Upcoming Appointments</h3>
                        <button onClick={() => navigate('appointments')} className="text-xs text-blue-600 hover:underline">View All</button>
                    </div>
                    {upcoming.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">No upcoming appointments</p>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.slice(0, 4).map(a => (
                                <div key={a._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                        <Calendar size={16} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 text-sm">Dr. {a.doctor?.name}</p>
                                        <p className="text-xs text-slate-500">{new Date(a.appointmentDate).toLocaleDateString()} · {a.timeSlot}</p>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full capitalize shrink-0">{a.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Prescriptions */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">Recent Prescriptions</h3>
                        <button onClick={() => navigate('prescriptions')} className="text-xs text-blue-600 hover:underline">View All</button>
                    </div>
                    {prescriptions.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">No prescriptions yet</p>
                    ) : (
                        <div className="space-y-3">
                            {prescriptions.slice(0, 4).map(rx => (
                                <div key={rx._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                                        <FileText size={16} className="text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 text-sm">{rx.diagnosis || 'Diagnosis'}</p>
                                        <p className="text-xs text-slate-500">Dr. {rx.doctor?.name} · {new Date(rx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientOverview;
