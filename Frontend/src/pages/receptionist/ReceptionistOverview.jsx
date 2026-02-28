import React, { useState, useEffect } from 'react';
import { getDailyScheduleAPI, getAvailableDoctorsAPI } from '../../services/api';
import StatCard from '../../components/shared/StatCard';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';

const ReceptionistOverview = () => {
    const [schedule, setSchedule] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        Promise.all([getDailyScheduleAPI({ date: today }), getAvailableDoctorsAPI()])
            .then(([schedRes, docRes]) => {
                setSchedule(schedRes.data.data);
                setDoctors(docRes.data.data);
            }).finally(() => setLoading(false));
    }, []);

    const completed = schedule.filter(a => a.status === 'completed').length;
    const pending = schedule.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Calendar} label="Today's Total" value={schedule.length} color="blue" />
                <StatCard icon={CheckCircle} label="Completed" value={completed} color="green" />
                <StatCard icon={Clock} label="Remaining" value={pending} color="orange" />
                <StatCard icon={Users} label="Active Doctors" value={doctors.length} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Today's Appointments</h3>
                    {loading ? (
                        <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : schedule.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">No appointments today</div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {schedule.slice(0, 8).map(appt => (
                                <div key={appt._id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                                    <span className="text-xs font-bold text-blue-600 w-6 text-center">#{appt.tokenNumber}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{appt.patient?.name}</p>
                                        <p className="text-xs text-slate-400">{appt.timeSlot} — Dr. {appt.doctor?.name}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${appt.status === 'completed' ? 'bg-green-50 text-green-700' :
                                        appt.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                            'bg-blue-50 text-blue-700'
                                        }`}>{appt.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Available Doctors</h3>
                    <div className="space-y-2">
                        {doctors.map(doc => (
                            <div key={doc._id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-blue-700 text-xs font-bold">{doc.name[0]}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800">Dr. {doc.name}</p>
                                    <p className="text-xs text-slate-400">{doc.specialization || 'General Physician'}</p>
                                </div>
                                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Available</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistOverview;
