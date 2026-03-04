import React, { useState } from 'react';
import { aiDiagnosisAssistAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Brain, Plus, X, Zap, AlertTriangle, TestTube, Pill, ChevronRight, WifiOff } from 'lucide-react';

const severityColors = { high: 'bg-red-50 border-red-200 text-red-700', medium: 'bg-yellow-50 border-yellow-200 text-yellow-700', low: 'bg-green-50 border-green-200 text-green-700' };

const DoctorAiAssist = () => {
    const [symptoms, setSymptoms] = useState([]);
    const [symptomInput, setSymptomInput] = useState('');
    const [patientAge, setPatientAge] = useState('');
    const [patientGender, setPatientGender] = useState('');
    const [medicalHistory, setMedicalHistory] = useState('');
    const [result, setResult] = useState(null);
    const [aiWarning, setAiWarning] = useState(null);
    const [loading, setLoading] = useState(false);

    const addSymptom = () => {
        const s = symptomInput.trim();
        if (s && !symptoms.includes(s)) {
            setSymptoms(prev => [...prev, s]);
            setSymptomInput('');
        }
    };

    const removeSymptom = (s) => setSymptoms(prev => prev.filter(x => x !== s));

    const handleAnalyze = async () => {
        if (symptoms.length === 0) return toast.error('Add at least one symptom');
        setLoading(true);
        setResult(null);
        setAiWarning(null);
        try {
            const res = await aiDiagnosisAssistAPI({ symptoms, patientAge, patientGender, medicalHistory });
            setResult(res.data.data);
            // Surface any fallback/degraded-mode warning from backend
            if (res.data.warning) {
                setAiWarning(res.data.warning);
                toast('AI unavailable – showing general guidance', { icon: '⚠️' });
            }
        } catch (err) {
            const status = err.response?.status;
            const msg = err.response?.data?.message;
            if (status === 503) {
                toast.error('AI service is not configured on the server.');
            } else if (status === 429) {
                toast.error('AI quota exceeded. Please try again later.');
            } else if (status === 401 || status === 403) {
                toast.error('Authentication error. Please log in again.');
            } else {
                toast.error(msg || 'AI service unavailable. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 sm:p-6 text-white">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <Brain size={24} className="sm:w-7 sm:h-7 shrink-0" />
                    <h2 className="text-lg sm:text-xl font-bold">AI Diagnosis Assistant</h2>
                </div>
                <p className="text-blue-100 text-xs sm:text-sm">Powered by Google Gemini AI. Enter patient symptoms for intelligent diagnostic support.</p>
                <p className="text-blue-200 text-xs mt-2 font-medium">⚠️ For clinical reference only. Always apply professional medical judgment.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4 sm:space-y-5">
                <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Patient Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Patient Age</label>
                        <input type="number" placeholder="e.g. 35" value={patientAge} onChange={e => setPatientAge(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                        <select value={patientGender} onChange={e => setPatientGender(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Medical History</label>
                        <input type="text" placeholder="Diabetes, hypertension, previous surgeries..." value={medicalHistory} onChange={e => setMedicalHistory(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Current Symptoms *</label>
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <input
                            type="text" placeholder="Type symptom and press Enter or Add"
                            value={symptomInput}
                            onChange={e => setSymptomInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                            className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="button" onClick={addSymptom}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                            <Plus size={16} /> Add
                        </button>
                    </div>
                    {symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {symptoms.map(s => (
                                <span key={s} className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm">
                                    {s}
                                    <button type="button" onClick={() => removeSymptom(s)} className="hover:text-blue-900"><X size={13} /></button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <button onClick={handleAnalyze} disabled={loading || symptoms.length === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-semibold py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm sm:text-base">
                    {loading ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> <span className="hidden sm:inline">Analyzing with AI...</span><span className="sm:hidden">Analyzing...</span></>
                    ) : (
                        <><Zap size={18} /> <span className="hidden sm:inline">Analyze Symptoms with AI</span><span className="sm:hidden">Analyze</span></>
                    )}
                </button>
            </div>

            {/* Fallback / degraded-mode warning banner */}
            {aiWarning && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <WifiOff size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-amber-700">AI Service Unavailable</p>
                        <p className="text-xs text-amber-600 mt-0.5">{aiWarning} Results below are general clinical guidance and are not AI-generated.</p>
                    </div>
                </div>
            )}

            {result && (
                <div className="space-y-4">
                    {result.diagnoses && (
                        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm sm:text-base">
                                <Brain size={18} className="text-blue-600 shrink-0" /> Possible Diagnoses
                            </h3>
                            <div className="space-y-3">
                                {result.diagnoses.map((d, i) => (
                                    <div key={i} className={`border rounded-xl p-3 sm:p-4 ${severityColors[d.likelihood?.toLowerCase()] || 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm sm:text-base">{d.condition}</p>
                                                <p className="text-xs sm:text-sm mt-1 opacity-80">{d.description}</p>
                                            </div>
                                            <span className="text-xs font-bold uppercase px-2 py-1 rounded-full border opacity-80 whitespace-nowrap self-start">{d.likelihood}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.tests?.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                                    <TestTube size={16} className="text-blue-600 shrink-0" /> Recommended Tests
                                </h4>
                                <ul className="space-y-2">
                                    {result.tests.map((t, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                            <ChevronRight size={14} className="text-blue-500 mt-0.5 flex-shrink-0" /> {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.treatments?.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                                    <Pill size={16} className="text-green-600 shrink-0" /> Treatment Recommendations
                                </h4>
                                <ul className="space-y-2">
                                    {result.treatments.map((t, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                            <ChevronRight size={14} className="text-green-500 mt-0.5 flex-shrink-0" /> {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {result.redFlags?.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5">
                            <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
                                <AlertTriangle size={16} className="shrink-0" /> Red Flags to Watch For
                            </h4>
                            <ul className="space-y-2">
                                {result.redFlags.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                                        <span className="mt-0.5 flex-shrink-0">⚠</span> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.raw && (
                        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                            <h4 className="font-semibold text-slate-800 mb-3 text-sm sm:text-base">AI Analysis</h4>
                            <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap">{result.raw}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorAiAssist;
