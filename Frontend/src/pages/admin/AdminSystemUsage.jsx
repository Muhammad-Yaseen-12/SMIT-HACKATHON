import React, { useState, useEffect } from 'react';
import { getSystemUsageAPI } from '../../services/api';
import { Server, Database, Activity, Users, Calendar, FileText, RefreshCw } from 'lucide-react';

const Meter = ({ label, value, max, color = 'blue' }) => {
    const pct = Math.min(Math.round((value / max) * 100), 100);
    const colors = { blue: 'bg-blue-500', green: 'bg-green-500', orange: 'bg-orange-500', red: 'bg-red-500' };
    const bar = colors[color] || colors.blue;
    return (
        <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{label}</span><span className="font-medium">{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
                <div className={`${bar} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{value} / {max} MB</div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
);

const AdminSystemUsage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);

    const load = () => {
        setLoading(true);
        getSystemUsageAPI()
            .then(r => { setData(r.data.data); setLastRefresh(new Date()); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Refresh */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-slate-800">System Usage</h2>
                    <p className="text-sm text-slate-500">Live server and database metrics</p>
                </div>
                <button onClick={load} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50">
                    <RefreshCw size={14} /> Refresh {lastRefresh && <span className="text-xs text-slate-400">— {lastRefresh.toLocaleTimeString()}</span>}
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Users', value: data.stats.totalUsers, icon: Users, color: 'blue' },
                    { label: 'Active Users', value: data.stats.activeUsers, icon: Users, color: 'green' },
                    { label: 'Appointments', value: data.stats.totalAppointments, icon: Calendar, color: 'orange' },
                    { label: "Today's Appts", value: data.stats.todayAppointments, icon: Calendar, color: 'purple' },
                    { label: 'Prescriptions', value: data.stats.totalPrescriptions, icon: FileText, color: 'teal' },
                ].map(s => {
                    const bgMap = { blue: 'bg-blue-50', green: 'bg-green-50', orange: 'bg-orange-50', purple: 'bg-purple-50', teal: 'bg-teal-50' };
                    const iconMap = { blue: 'text-blue-600', green: 'text-green-600', orange: 'text-orange-600', purple: 'text-purple-600', teal: 'text-teal-600' };
                    return (
                        <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className={`w-8 h-8 ${bgMap[s.color]} rounded-lg flex items-center justify-center mb-2`}>
                                <s.icon size={16} className={iconMap[s.color]} />
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Server */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Server size={18} className="text-blue-600" />
                        <h3 className="font-semibold text-slate-800">Server Info</h3>
                        <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</span>
                    </div>
                    <Meter label="Memory Usage" value={data.server.memoryUsedMB} max={data.server.memoryTotalMB} color={data.server.memoryUsagePercent > 80 ? 'red' : data.server.memoryUsagePercent > 60 ? 'orange' : 'blue'} />
                    <div className="mt-4 space-y-0">
                        <InfoRow label="Uptime" value={data.server.uptimeFormatted} />
                        <InfoRow label="Platform" value={data.server.platform} />
                        <InfoRow label="Node.js" value={data.server.nodeVersion} />
                        <InfoRow label="Memory Used" value={`${data.server.memoryUsedMB} MB / ${data.server.memoryTotalMB} MB`} />
                    </div>
                </div>

                {/* Database */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Database size={18} className="text-purple-600" />
                        <h3 className="font-semibold text-slate-800">Database (MongoDB)</h3>
                        <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Connected</span>
                    </div>
                    <Meter label="Storage Used" value={data.database.storageSizeMB} max={Math.max(data.database.storageSizeMB * 5, 50)} color="purple" />
                    <div className="mt-4 space-y-0">
                        <InfoRow label="Collections" value={data.database.collections} />
                        <InfoRow label="Total Documents" value={data.database.totalDocuments.toLocaleString()} />
                        <InfoRow label="Data Size" value={`${data.database.dataSizeMB} MB`} />
                        <InfoRow label="Storage Size" value={`${data.database.storageSizeMB} MB`} />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={18} className="text-orange-500" />
                    <h3 className="font-semibold text-slate-800">Recent Activity</h3>
                </div>
                {data.recentActivity.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">No recent activity</p>
                ) : (
                    <div className="space-y-3">
                        {data.recentActivity.map(a => (
                            <div key={a._id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                                <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></div>
                                <p className="text-sm text-slate-700 flex-1">
                                    <span className="font-medium">{a.patient?.name || 'Patient'}</span> booked with <span className="font-medium">Dr. {a.doctor?.name || 'Doctor'}</span>
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${a.status === 'completed' ? 'bg-green-50 text-green-700' : a.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>{a.status}</span>
                                <span className="text-xs text-slate-400 shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSystemUsage;
