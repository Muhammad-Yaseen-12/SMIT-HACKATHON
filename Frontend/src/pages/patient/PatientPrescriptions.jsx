import React, { useState, useEffect } from 'react';
import { getPatientPrescriptionsAPI, downloadPrescriptionAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FileText, Download, Sparkles } from 'lucide-react';

const PatientPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        getPatientPrescriptionsAPI().then(r => setPrescriptions(r.data.data)).finally(() => setLoading(false));
    }, []);

    const handleDownload = async (id, patientName) => {
        setDownloading(id);
        try {
            const res = await downloadPrescriptionAPI(id);
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prescription-${id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('PDF downloaded!');
        } catch { toast.error('Download failed'); }
        finally { setDownloading(null); }
    };

    if (loading) return <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    if (prescriptions.length === 0)
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p>No prescriptions yet</p>
            </div>
        );

    return (
        <div className="space-y-4">
            {prescriptions.map(rx => (
                <div key={rx._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpanded(expanded === rx._id ? null : rx._id)}>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                            <FileText size={20} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-semibold text-slate-800">{rx.diagnosis || 'Prescription'}</h4>
                                {rx.isAiEnabled && (
                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
                                        <Sparkles size={10} /> AI
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-700 font-medium">Dr. {rx.doctor?.name}</p>
                            <p className="text-xs text-slate-500">
                                {rx.doctor?.specialization && <span>{rx.doctor.specialization}</span>}
                                {rx.doctor?.specialization && rx.doctor?.qualification && <span> · </span>}
                                {rx.doctor?.qualification && <span>{rx.doctor.qualification}</span>}
                                <span> · {new Date(rx.createdAt).toLocaleDateString()}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDownload(rx._id); }}
                                disabled={downloading === rx._id}
                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-60">
                                {downloading === rx._id ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={13} />}
                                PDF
                            </button>
                            <span className="text-slate-300">{expanded === rx._id ? '▲' : '▼'}</span>
                        </div>
                    </div>

                    {/* Expanded */}
                    {expanded === rx._id && (
                        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50">
                            {/* Doctor Details */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <h5 className="text-xs font-semibold text-blue-700 uppercase mb-1">Prescribed By</h5>
                                <p className="font-semibold text-blue-900">Dr. {rx.doctor?.name}</p>
                                <p className="text-xs text-blue-600 mt-0.5">
                                    {rx.doctor?.specialization || 'General Physician'}
                                    {rx.doctor?.qualification && ` · ${rx.doctor.qualification}`}
                                </p>
                            </div>
                            {/* Medications */}
                            {rx.medications?.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">Medications</h5>
                                    <div className="space-y-2">
                                        {rx.medications.map((m, i) => (
                                            <div key={i} className="bg-white rounded-lg px-3 py-2 border border-slate-100">
                                                <p className="font-medium text-slate-800 text-sm">{m.name} <span className="text-slate-400 font-normal text-xs">— {m.dosage}</span></p>
                                                <p className="text-xs text-slate-500">{m.frequency} · {m.duration}{m.instructions ? ` · ${m.instructions}` : ''}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Symptoms */}
                            {rx.symptoms?.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">Symptoms</h5>
                                    <div className="flex flex-wrap gap-2">{rx.symptoms.map((s, i) => <span key={i} className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">{s}</span>)}</div>
                                </div>
                            )}
                            {/* Lab Tests */}
                            {rx.labTests?.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">Lab Tests</h5>
                                    <div className="flex flex-wrap gap-2">{rx.labTests.map((t, i) => <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{t}</span>)}</div>
                                </div>
                            )}
                            {/* Advice */}
                            {rx.advice && <div className="bg-emerald-50 rounded-lg p-3 text-sm text-emerald-800"><span className="font-semibold">Advice: </span>{rx.advice}</div>}
                            {/* AI Explanation */}
                            {rx.aiExplanation && (
                                <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-800 border border-purple-100">
                                    <p className="font-semibold mb-1 flex items-center gap-1"><Sparkles size={13} /> AI Explanation</p>
                                    <p className="leading-relaxed">{rx.aiExplanation}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PatientPrescriptions;
