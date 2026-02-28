import React, { useState, useEffect } from 'react';
import { getDoctorAppointmentsAPI, updateAppointmentStatusAPI, getPatientHistoryAPI, addDiagnosisAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, User, Clock, CheckCircle, Stethoscope, Plus, X } from 'lucide-react';
import WritePrescription from './WritePrescription';

const SEVERITY_OPTS = ['mild', 'moderate', 'severe', 'critical'];
const EMPTY_DIAG = { symptoms: [], symptomInput: '', finalDiagnosis: '', notes: '', severity: 'mild' };

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [patientHistory, setPatientHistory] = useState(null);
    const [showPrescription, setShowPrescription] = useState(false);
    const [diagnosisAppt, setDiagnosisAppt] = useState(null);
    const [diagForm, setDiagForm] = useState(EMPTY_DIAG);
    const [diagSaving, setDiagSaving] = useState(false);

    const fetchAppts = () => {
        const params = {};
        if (dateFilter) params.date = dateFilter;
        if (statusFilter) params.status = statusFilter;
        getDoctorAppointmentsAPI(params).then(r => setAppointments(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { fetchAppts(); }, [dateFilter, statusFilter]);

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

    if (showPrescription && selectedAppt) {
        return <WritePrescription appointment={selectedAppt} onBack={() => { setShowPrescription(false); setSelectedAppt(null); fetchAppts(); }} />;
    }

    return (
        <div className="space-y-5">
            {/* Patient History Modal */}
            {patientHistory && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPatientHistory(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Patient History — {patientHistory.patient?.name}</h3>
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
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Add Diagnosis</h3>
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
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={closeDiagnosis} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={diagSaving} className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60">
                                    {diagSaving ? 'Saving...' : 'Save Diagnosis'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                {(dateFilter || statusFilter) && (
                    <button onClick={() => { setDateFilter(''); setStatusFilter(''); }} className="text-sm text-slate-500 hover:text-slate-800 px-3 py-2 border border-slate-200 rounded-lg">Clear</button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : appointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No appointments found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {appointments.map(appt => (
                        <div key={appt._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-blue-600 font-bold text-sm">#{appt.tokenNumber}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{appt.patient?.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{appt.patient?.phone} | {appt.patient?.gender}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Calendar size={12} />{new Date(appt.appointmentDate).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} />{appt.timeSlot}</span>
                                            <span className="capitalize bg-slate-100 px-2 py-0.5 rounded">{appt.type}</span>
                                        </div>
                                        {appt.reason && <p className="text-xs text-slate-500 mt-1 italic">"{appt.reason}"</p>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${appt.status === 'completed' ? 'bg-green-50 text-green-700' :
                                        appt.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                            appt.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                                                'bg-orange-50 text-orange-600'
                                        }`}>{appt.status}</span>
                                </div>
                            </div>
                            {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <button onClick={() => { setSelectedAppt(appt); setShowPrescription(true); }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                                        <CheckCircle size={13} /> Write Prescription
                                    </button>
                                    <button onClick={() => openDiagnosis(appt)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                                        <Stethoscope size={13} /> Add Diagnosis
                                    </button>
                                    <button onClick={() => viewHistory(appt.patient?._id)}
                                        className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                                        <User size={13} /> Patient History
                                    </button>
                                    {appt.status !== 'cancelled' && (
                                        <button onClick={() => handleStatusUpdate(appt._id, 'cancelled')}
                                            className="border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorAppointments;
