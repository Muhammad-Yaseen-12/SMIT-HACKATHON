import React, { useState, useEffect } from 'react';
import { getPatientProfileAPI, updatePatientProfileAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { User, Save } from 'lucide-react';

const PatientProfile = () => {
    const [form, setForm] = useState({ name: '', phone: '', dateOfBirth: '', gender: '', bloodGroup: '', address: '', emergencyContact: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getPatientProfileAPI().then(r => {
            const d = r.data.data;
            setForm({
                name: d.name || '',
                phone: d.phone || '',
                dateOfBirth: d.dateOfBirth ? d.dateOfBirth.split('T')[0] : '',
                gender: d.gender || '',
                bloodGroup: d.bloodGroup || '',
                address: d.address || '',
                emergencyContact: d.emergencyContact || '',
            });
        }).finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updatePatientProfileAPI(form);
            toast.success('Profile updated!');
        } catch { toast.error('Failed to save'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    const field = (label, key, type = 'text', opts = null) => (
        <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
            {opts ? (
                <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">-- Select --</option>
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : (
                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            )}
        </div>
    );

    return (
        <div className="max-w-lg">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                    </div>
                    <h2 className="font-semibold text-slate-800">My Profile</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {field('Full Name', 'name')}
                    {field('Phone Number', 'phone', 'tel')}
                    {field('Date of Birth', 'dateOfBirth', 'date')}
                    {field('Gender', 'gender', 'text', ['male', 'female', 'other'])}
                    {field('Blood Group', 'bloodGroup', 'text', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])}
                    {field('Address', 'address')}
                    {field('Emergency Contact', 'emergencyContact', 'tel')}

                    <button type="submit" disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
                        {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</> : <><Save size={16} /> Save Changes</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PatientProfile;
