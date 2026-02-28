import React, { useState } from 'react';
import { writePrescriptionAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Brain } from 'lucide-react';

const WritePrescription = ({ appointment, onBack }) => {
    const [form, setForm] = useState({
        diagnosis: '',
        symptoms: '',
        advice: '',
        followUpDate: '',
        isAiEnabled: false,
        labTests: '',
    });
    const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    const [loading, setLoading] = useState(false);

    const addMed = () => setMedications(m => [...m, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    const removeMed = (i) => setMedications(m => m.filter((_, idx) => idx !== i));
    const updateMed = (i, key, value) => setMedications(m => m.map((med, idx) => idx === i ? { ...med, [key]: value } : med));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.diagnosis) return toast.error('Diagnosis is required');
        setLoading(true);
        try {
            await writePrescriptionAPI({
                patientId: appointment.patient._id,
                appointmentId: appointment._id,
                diagnosis: form.diagnosis,
                symptoms: form.symptoms.split(',').map(s => s.trim()).filter(Boolean),
                medications: medications.filter(m => m.name),
                labTests: form.labTests.split(',').map(t => t.trim()).filter(Boolean),
                advice: form.advice,
                followUpDate: form.followUpDate || null,
                isAiEnabled: form.isAiEnabled,
            });
            toast.success('Prescription saved successfully!');
            onBack();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5 max-w-3xl">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800">
                <ArrowLeft size={16} /> Back to Appointments
            </button>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="font-semibold text-blue-900">Patient: {appointment.patient?.name}</p>
                <p className="text-sm text-blue-700 mt-0.5">
                    {appointment.type} — {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.timeSlot}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                    <h3 className="font-semibold text-slate-800">Diagnosis & Symptoms</h3>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Diagnosis *</label>
                        <input type="text" required value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                            placeholder="e.g. Acute Pharyngitis"
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Symptoms (comma separated)</label>
                        <input type="text" value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })}
                            placeholder="fever, sore throat, headache"
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">Medications</h3>
                        <button type="button" onClick={addMed} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                            <Plus size={14} /> Add Medicine
                        </button>
                    </div>
                    {medications.map((med, i) => (
                        <div key={i} className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg relative">
                            {medications.length > 1 && (
                                <button type="button" onClick={() => removeMed(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                    <Trash2 size={14} />
                                </button>
                            )}
                            {[['name', 'Medicine Name', true], ['dosage', 'Dosage (e.g. 500mg)', true], ['frequency', 'Frequency (e.g. Twice daily)', true], ['duration', 'Duration (e.g. 5 days)', true], ['instructions', 'Instructions (optional)', false]].map(([key, ph, req]) => (
                                <div key={key} className={key === 'instructions' ? 'col-span-2' : ''}>
                                    <input type="text" placeholder={ph} value={med[key]} onChange={e => updateMed(i, key, e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                    <h3 className="font-semibold text-slate-800">Additional Info</h3>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Lab Tests (comma separated)</label>
                        <input type="text" value={form.labTests} onChange={e => setForm({ ...form, labTests: e.target.value })}
                            placeholder="CBC, Blood sugar, X-ray"
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Advice / Instructions</label>
                        <textarea rows={3} value={form.advice} onChange={e => setForm({ ...form, advice: e.target.value })}
                            placeholder="Rest well, drink plenty of fluids..."
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Follow-up Date</label>
                        <input type="date" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })}
                            className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl cursor-pointer border border-blue-100">
                        <input type="checkbox" checked={form.isAiEnabled} onChange={e => setForm({ ...form, isAiEnabled: e.target.checked })}
                            className="w-4 h-4 accent-blue-600" />
                        <div>
                            <p className="text-sm font-medium text-blue-900 flex items-center gap-1"><Brain size={14} /> Enable AI Explanation for Patient</p>
                            <p className="text-xs text-blue-600">AI will generate a simple, easy-to-understand explanation of the prescription for the patient</p>
                        </div>
                    </label>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                        {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</> : 'Save Prescription'}
                    </button>
                    <button type="button" onClick={onBack} className="border border-slate-200 px-6 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default WritePrescription;
