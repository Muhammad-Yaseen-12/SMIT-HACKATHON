import React, { useState, useEffect } from 'react';
import { getDoctorPrescriptionsAPI } from '../../services/api';
import { FileText, Search } from 'lucide-react';

const DoctorPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        getDoctorPrescriptionsAPI().then(r => setPrescriptions(r.data.data)).finally(() => setLoading(false));
    }, []);

    const filtered = prescriptions.filter(p =>
        p.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.diagnosis?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-5">
            <div className="relative w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input placeholder="Search by patient or diagnosis..." value={search} onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No prescriptions found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(p => (
                        <div key={p._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-50" onClick={() => setExpanded(expanded === p._id ? null : p._id)}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-purple-700 text-xs font-bold">{p.patient?.name?.[0]}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{p.patient?.name}</p>
                                        <p className="text-xs text-slate-500">{p.diagnosis}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                                    <span className="text-xs text-blue-600 font-medium">{p.medications?.length} medications</span>
                                </div>
                            </div>
                            {expanded === p._id && (
                                <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
                                    {p.symptoms?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-slate-600 mb-1">Symptoms</p>
                                            <div className="flex flex-wrap gap-1">
                                                {p.symptoms.map(s => <span key={s} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-xs">{s}</span>)}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs font-semibold text-slate-600 mb-1">Medications</p>
                                        <div className="space-y-1">
                                            {p.medications?.map((m, i) => (
                                                <div key={i} className="bg-white rounded-lg p-2 text-xs flex gap-4">
                                                    <span className="font-medium text-slate-800">{m.name}</span>
                                                    <span className="text-slate-500">{m.dosage}</span>
                                                    <span className="text-slate-500">{m.frequency}</span>
                                                    <span className="text-slate-500">{m.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {p.advice && <div><p className="text-xs font-semibold text-slate-600 mb-1">Advice</p><p className="text-xs text-slate-600">{p.advice}</p></div>}
                                    {p.aiExplanation && (
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                            <p className="text-xs font-semibold text-blue-800 mb-1">🤖 AI Explanation</p>
                                            <p className="text-xs text-blue-700">{p.aiExplanation}</p>
                                        </div>
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

export default DoctorPrescriptions;
