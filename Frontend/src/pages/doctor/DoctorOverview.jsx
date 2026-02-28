import React, { useState, useEffect } from 'react';
import { getDoctorAnalyticsAPI, getDoctorAppointmentsAPI } from '../../services/api';
import StatCard from '../../components/shared/StatCard';
import { Calendar, CheckCircle, Clock, FileText, Users } from 'lucide-react';

const DoctorOverview = () => {
    const [stats, setStats] = useState(null);
    const [todayAppts, setTodayAppts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        Promise.all([
            getDoctorAnalyticsAPI(),
            getDoctorAppointmentsAPI({ date: today }),
        ]).then(([statsRes, apptRes]) => {
            setStats(statsRes.data.data);
            setTodayAppts(apptRes.data.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Calendar} label="Today's Appointments" value={stats?.todayAppointments ?? 0} color="blue" />
                <StatCard icon={CheckCircle} label="Completed Total" value={stats?.completed ?? 0} color="green" />
                <StatCard icon={Clock} label="Pending" value={stats?.pending ?? 0} color="orange" />
                <StatCard icon={FileText} label="Prescriptions Written" value={stats?.totalPrescriptions ?? 0} color="purple" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Today's Schedule</h3>
                {todayAppts.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <Calendar size={36} className="mx-auto mb-3 opacity-40" />
                        <p>No appointments scheduled for today</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayAppts.map(appt => (
                            <div key={appt._id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-blue-600 text-sm font-bold">{appt.tokenNumber}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-800 text-sm truncate">{appt.patient?.name}</p>
                                    <p className="text-xs text-slate-500">{appt.timeSlot} — {appt.type}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${appt.status === 'completed' ? 'bg-green-50 text-green-700' :
                                    appt.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                        'bg-blue-50 text-blue-700'
                                    }`}>{appt.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorOverview;
