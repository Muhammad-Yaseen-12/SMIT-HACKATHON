import React, { useState, useEffect } from 'react';
import { getAdminAnalytics } from '../../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminAnalytics().then(r => setStats(r.data.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    const pieData = [
        { name: 'Completed', value: stats?.completedAppointments || 0 },
        { name: 'Pending', value: stats?.pendingAppointments || 0 },
        { name: 'Cancelled', value: stats?.cancelledAppointments || 0 },
    ];

    const monthlyBarData = (stats?.monthlyAppointments || []).map(item => ({
        name: MONTHS[(item._id.month - 1)] || `M${item._id.month}`,
        appointments: item.count,
    }));

    const staffData = [
        { name: 'Doctors', value: stats?.totalDoctors || 0 },
        { name: 'Receptionists', value: stats?.totalReceptionists || 0 },
        { name: 'Patients', value: stats?.totalPatients || 0 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Appointment Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Monthly Appointments</h3>
                    {monthlyBarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyBarData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No appointment data yet</div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Staff Overview</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={staffData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {staffData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Key Metrics</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Total Appointments', value: stats?.totalAppointments || 0, color: 'bg-blue-500' },
                            { label: 'Completed Appointments', value: stats?.completedAppointments || 0, color: 'bg-green-500' },
                            { label: 'Estimated Revenue (PKR)', value: (stats?.estimatedRevenue || 0).toLocaleString(), color: 'bg-orange-500' },
                            { label: 'Total Staff', value: (stats?.totalDoctors || 0) + (stats?.totalReceptionists || 0), color: 'bg-purple-500' },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                <span className="text-sm text-slate-600 flex-1">{item.label}</span>
                                <span className="font-semibold text-slate-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
