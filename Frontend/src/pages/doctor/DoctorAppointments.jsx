import React, { useState, useEffect } from 'react';
import { getDoctorAppointmentsAPI, updateAppointmentStatusAPI, getPatientHistoryAPI, addDiagnosisAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, User, Clock, CheckCircle, Stethoscope, Plus, X, XCircle, AlertTriangle } from 'lucide-react';
import WritePrescription from './WritePrescription';

const SEVERITY_OPTS = ['mild', 'moderate', 'severe', 'critical'];
const EMPTY_DIAG = { symptoms: [], symptomInput: '', finalDiagnosis: '', notes: '', severity: 'mild' };

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [patientHistory, setPatientHistory] = useState(null);
    const [showPrescription, setShowPrescription] = useState(false);
    const [diagnosisAppt, setDiagnosisAppt] = useState(null);
    const [diagForm, setDiagForm] = useState(EMPTY_DIAG);
    const [diagSaving, setDiagSaving] = useState(false);
    const [cancelAppt, setCancelAppt] = useState(null); // For cancel confirmation modal

    const fetchAppts = () => {
        const today = new Date();
        // Use local date components to avoid timezone issues
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const params = { date: todayStr }; // Always fetch today's appointments
        if (statusFilter) params.status = statusFilter;
        getDoctorAppointmentsAPI(params).then(r => {
            // Filter to only show today's appointments
            const filtered = r.data.data
                .filter(apt => {
                    // Convert appointment date to local date string for comparison
                    const aptDate = new Date(apt.appointmentDate);
                    const aptDateStr = `${aptDate.getFullYear()}-${String(aptDate.getMonth() + 1).padStart(2, '0')}-${String(aptDate.getDate()).padStart(2, '0')}`;
                    return aptDateStr === todayStr;
                })
                .sort((a, b) => a.tokenNumber - b.tokenNumber);
            setAppointments(filtered);
        }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchAppts(); }, [statusFilter]);

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateAppointmentStatusAPI(id, { status });
            toast.success(`Appointment ${status}`);
            fetchAppts();
        } catch { toast.error('Failed'); }
    };

    const viewHistory = async (patientId) => {
        try {
            const res = await getPatientHistoryAPI(patientId);
            setPatientHistory(res.data.data);
        } catch { toast.error('Could not load history'); }
    };

    const openDiagnosis = (appt) => { setDiagnosisAppt(appt); setDiagForm(EMPTY_DIAG); };
    const closeDiagnosis = () => { setDiagnosisAppt(null); setDiagForm(EMPTY_DIAG); };

    const addSymptomTag = () => {
        const s = diagForm.symptomInput.trim();
        if (s && !diagForm.symptoms.includes(s)) setDiagForm(f => ({ ...f, symptoms: [...f.symptoms, s], symptomInput: '' }));
    };

    const saveDiagnosis = async (e) => {
        e.preventDefault();
        if (!diagForm.finalDiagnosis) return toast.error('Enter a diagnosis');
        setDiagSaving(true);
        try {
            await addDiagnosisAPI({
                patientId: diagnosisAppt.patient._id,
                appointmentId: diagnosisAppt._id,
                symptoms: diagForm.symptoms,
                finalDiagnosis: diagForm.finalDiagnosis,
                notes: diagForm.notes,
                severity: diagForm.severity,
            });
            toast.success('Diagnosis saved & appointment marked completed');
            closeDiagnosis();
            fetchAppts();
        } catch { toast.error('Failed to save diagnosis'); }
        finally { setDiagSaving(false); }
    };

    const handleCancelAppointment = async () => {
        try {
            await updateAppointmentStatusAPI(cancelAppt._id, { status: 'cancelled' });
            toast.success('Appointment cancelled successfully');
            setCancelAppt(null);
            fetchAppts();
        } catch {
            toast.error('Failed to cancel appointment');
        }
    };

    if (showPrescription && selectedAppt) {
        return <WritePrescription appointment={selectedAppt} onBack={() => { setShowPrescription(false); setSelectedAppt(null); fetchAppts(); }} />;
    }

    // Group appointments by date (will mostly be today's date)
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

    return (
        <div className="space-y-5">
            {/* Patient History Modal */}
            {patientHistory && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPatientHistory(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800">Patient History — {patientHistory.patient?.name}</h3>
                            <button onClick={() => setPatientHistory(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 mb-2">Past Appointments ({patientHistory.appointments?.length})</p>
                                {patientHistory.appointments?.slice(0, 3).map(a => (
                                    <div key={a._id} className="text-sm bg-slate-50 rounded-lg p-3 mb-2">
                                        <span className="font-medium">{new Date(a.appointmentDate).toLocaleDateString()}</span> — {a.type} — <span className="capitalize text-blue-600">{a.status}</span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-600 mb-2">Prescriptions ({patientHistory.prescriptions?.length})</p>
                                {patientHistory.prescriptions?.slice(0, 3).map(p => (
                                    <div key={p._id} className="text-sm bg-slate-50 rounded-lg p-3 mb-2">
                                        <span className="font-medium">{p.diagnosis}</span>
                                        <span className="text-slate-400 ml-2">{new Date(p.createdAt).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Diagnosis Modal */}
            {diagnosisAppt && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeDiagnosis}>
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-800">Add Diagnosis</h3>
                                <p className="text-sm text-slate-500">{diagnosisAppt.patient?.name} — Token #{diagnosisAppt.tokenNumber}</p>
                            </div>
                            <button onClick={closeDiagnosis} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={saveDiagnosis} className="space-y-4">
                            {/* Symptoms */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Symptoms</label>
                                <div className="flex gap-2">
                                    <input value={diagForm.symptomInput} onChange={e => setDiagForm(f => ({ ...f, symptomInput: e.target.value }))}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSymptomTag())}
                                        placeholder="Type symptom & press Enter"
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <button type="button" onClick={addSymptomTag} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                {diagForm.symptoms.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {diagForm.symptoms.map(s => (
                                            <span key={s} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                                                {s} <button type="button" onClick={() => setDiagForm(f => ({ ...f, symptoms: f.symptoms.filter(x => x !== s) }))}><X size={11} /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Final Diagnosis */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Final Diagnosis *</label>
                                <input required value={diagForm.finalDiagnosis} onChange={e => setDiagForm(f => ({ ...f, finalDiagnosis: e.target.value }))}
                                    placeholder="e.g. Viral upper respiratory infection"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            {/* Severity */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Severity</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {SEVERITY_OPTS.map(s => (
                                        <button key={s} type="button" onClick={() => setDiagForm(f => ({ ...f, severity: s }))}
                                            className={`py-2 rounded-lg text-xs font-medium capitalize border ${diagForm.severity === s
                                                ? s === 'critical' ? 'bg-red-600 text-white border-red-600'
                                                    : s === 'severe' ? 'bg-orange-500 text-white border-orange-500'
                                                        : s === 'moderate' ? 'bg-yellow-500 text-white border-yellow-500'
                                                            : 'bg-green-500 text-white border-green-500'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Clinical Notes</label>
                                <textarea value={diagForm.notes} onChange={e => setDiagForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                                    placeholder="Additional clinical observations, follow-up instructions..."
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                <button type="button" onClick={closeDiagnosis} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={diagSaving} className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60">
                                    {diagSaving ? 'Saving...' : 'Save Diagnosis'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Calendar size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-800">Today's Appointments</h2>
                        {/* <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p> */}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    {statusFilter && (
                        <button
                            onClick={() => setStatusFilter('')}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 text-slate-600 font-medium whitespace-nowrap"
                        >
                            Clear Filter
                        </button>
                    )}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm font-medium text-blue-700 text-center whitespace-nowrap">
                        {appointments.length} Appointment{appointments.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : appointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-16 text-center text-slate-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm md:text-base">No Appointments for Today</p>
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
                                    isPast ? 'bg-slate-50 border-slate-100' :
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
                                        {/* <span className={`text-xs ml-auto ${isToday ? 'text-blue-600' :
                                            isPast ? 'text-slate-500' :
                                                'text-green-600'
                                            }`}>
                                            {apts.length} appointment{apts.length !== 1 ? 's' : ''}
                                        </span> */}
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[700px]">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                {['Token', 'Time', 'Patient', 'Contact', 'Type', 'Status', 'Actions'].map(h => (
                                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {apts.map(a => (
                                                <tr key={a._id} className="border-b border-slate-50 hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-blue-600 font-bold whitespace-nowrap">#{a.tokenNumber}</td>
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
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => { setSelectedAppt(a); setShowPrescription(true); }}
                                                                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs font-medium"
                                                                    title="Write Prescription"
                                                                >
                                                                    <CheckCircle size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => openDiagnosis(a)}
                                                                    className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-xs font-medium"
                                                                    title="Add Diagnosis"
                                                                >
                                                                    <Stethoscope size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => viewHistory(a.patient?._id)}
                                                                    className="text-slate-600 hover:text-slate-800 flex items-center gap-1 text-xs font-medium"
                                                                    title="Patient History"
                                                                >
                                                                    <User size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setCancelAppt(a)}
                                                                    className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs font-medium"
                                                                    title="Cancel appointment"
                                                                >
                                                                    <XCircle size={14} />
                                                                </button>
                                                            </div>
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

export default DoctorAppointments;
