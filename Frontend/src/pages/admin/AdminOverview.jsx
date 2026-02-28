import React, { useState, useEffect } from 'react';
import { getAdminAnalytics } from '../../services/api';
import StatCard from '../../components/shared/StatCard';
import { Users, UserCheck, Stethoscope, Calendar, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

const AdminOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminAnalytics()
            .then(res => setStats(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Stethoscope} label="Active Doctors" value={stats?.totalDoctors ?? 0} color="blue" />
                <StatCard icon={Users} label="Patients" value={stats?.totalPatients ?? 0} color="green" />
                <StatCard icon={UserCheck} label="Receptionists" value={stats?.totalReceptionists ?? 0} color="purple" />
                <StatCard icon={DollarSign} label="Est. Revenue (PKR)" value={`${(stats?.estimatedRevenue ?? 0).toLocaleString()}`} color="orange" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={Calendar} label="Total Appointments" value={stats?.totalAppointments ?? 0} color="teal" />
                <StatCard icon={CheckCircle} label="Completed" value={stats?.completedAppointments ?? 0} color="green" />
                <StatCard icon={Clock} label="Pending" value={stats?.pendingAppointments ?? 0} color="orange" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Quick Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Completion Rate', value: stats?.totalAppointments ? `${Math.round((stats.completedAppointments / stats.totalAppointments) * 100)}%` : '0%', color: 'text-green-600' },
                        { label: 'Cancellation Rate', value: stats?.totalAppointments ? `${Math.round((stats.cancelledAppointments / stats.totalAppointments) * 100)}%` : '0%', color: 'text-red-500' },
                        { label: 'Pending Rate', value: stats?.totalAppointments ? `${Math.round((stats.pendingAppointments / stats.totalAppointments) * 100)}%` : '0%', color: 'text-orange-500' },
                        { label: 'Staff Members', value: (stats?.totalDoctors ?? 0) + (stats?.totalReceptionists ?? 0), color: 'text-blue-600' },
                    ].map(item => (
                        <div key={item.label} className="text-center p-4 bg-slate-50 rounded-xl">
                            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                            <p className="text-xs text-slate-500 mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
