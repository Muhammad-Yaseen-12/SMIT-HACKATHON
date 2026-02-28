import React, { useState, useEffect } from 'react';
import { getDoctorAnalyticsAPI } from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/shared/StatCard';
import { Calendar, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DoctorAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDoctorAnalyticsAPI().then(r => setStats(r.data.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    const pieData = [
        { name: 'Completed', value: stats?.completed || 0 },
        { name: 'Pending', value: stats?.pending || 0 },
        { name: 'Cancelled', value: stats?.cancelled || 0 },
    ];

    const weekData = (stats?.weeklyData || []).map(d => ({
        day: DAYS[(d._id - 1) % 7] || `D${d._id}`,
        count: d.count,
    }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Calendar} label="Total Appointments" value={stats?.total || 0} color="blue" />
                <StatCard icon={CheckCircle} label="Completed" value={stats?.completed || 0} color="green" />
                <StatCard icon={Clock} label="Pending" value={stats?.pending || 0} color="orange" />
                <StatCard icon={FileText} label="Prescriptions" value={stats?.totalPrescriptions || 0} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Appointment Breakdown</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Weekly Activity</h3>
                    {weekData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={weekData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No weekly data yet</div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Performance Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-2xl font-bold text-green-600">
                            {stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </p>
                        <p className="text-xs text-green-700 mt-1">Completion Rate</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-xl">
                        <p className="text-2xl font-bold text-orange-600">{stats?.todayAppointments || 0}</p>
                        <p className="text-xs text-orange-700 mt-1">Today's Appointments</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-2xl font-bold text-blue-600">{stats?.cancelled || 0}</p>
                        <p className="text-xs text-blue-700 mt-1">Cancelled</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorAnalytics;
