import React, { useState, useEffect } from 'react';
import { searchPatientsAPI, updatePatientAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Users, Pencil, X, Save } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [editPatient, setEditPatient] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

    const load = (q = query) => {
        setLoading(true);
        searchPatientsAPI(q).then(r => setPatients(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { load(''); }, []);

    const handleSearch = (q) => { setQuery(q); load(q); };

    const openEdit = (p) => {
        setEditPatient(p);
        setEditForm({
            name: p.name || '',
            phone: p.phone || '',
            gender: p.gender || 'male',
            bloodGroup: p.bloodGroup || '',
            address: p.address || '',
            emergencyContact: p.emergencyContact || '',
            dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updatePatientAPI(editPatient._id, editForm);
            toast.success('Patient info updated');
            setEditPatient(null);
            load();
        } catch { toast.error('Failed to update'); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-5">
            {/* Edit Modal */}
            {editPatient && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditPatient(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="font-bold text-slate-800">Edit Patient Info</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{editPatient.email}</p>
                            </div>
                            <button onClick={() => setEditPatient(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-3">
                            {[['Full Name', 'name', 'text'], ['Phone', 'phone', 'tel'], ['Date of Birth', 'dateOfBirth', 'date'], ['Address', 'address', 'text'], ['Emergency Contact', 'emergencyContact', 'tel']].map(([label, key, type]) => (
                                <div key={key}>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                                    <input type={type} value={editForm[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                                    <select value={editForm.gender} onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Blood Group</label>
                                    <select value={editForm.bloodGroup} onChange={e => setEditForm(f => ({ ...f, bloodGroup: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option value="">-- Select --</option>
                                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setEditPatient(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                                    {saving ? 'Saving...' : <><Save size={14} /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="relative w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input placeholder="Search patients..." value={query} onChange={e => handleSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : patients.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No patients found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>{['Patient', 'Contact', 'Gender', 'Blood Group', 'Address', 'Registered', ''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {patients.map(p => (
                                <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                                                <span className="text-teal-700 text-xs font-bold">{p.name[0]}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{p.name}</p>
                                                <p className="text-xs text-slate-400">{p.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{p.phone || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500 capitalize">{p.gender || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500">{p.bloodGroup || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500">{p.address || '-'}</td>
                                    <td className="px-4 py-3 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => openEdit(p)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-100 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg font-medium">
                                            <Pencil size={12} /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PatientList;
