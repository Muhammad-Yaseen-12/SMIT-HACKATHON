import React, { useState } from 'react';
import { registerPatientAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Copy, CheckCircle } from 'lucide-react';

const RegisterPatient = () => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', dateOfBirth: '', gender: 'male', bloodGroup: '', address: '', emergencyContact: '' });
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await registerPatientAPI(form);
            setRegistered(res.data);
            toast.success('Patient registered successfully!');
            setForm({ name: '', email: '', phone: '', dateOfBirth: '', gender: 'male', bloodGroup: '', address: '', emergencyContact: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const copyCredentials = () => {
        navigator.clipboard.writeText(`Email: ${registered.data.email}\nPassword: ${registered.tempPassword}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-2xl space-y-6">
            {registered && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle size={20} className="text-green-600" />
                        <h3 className="font-semibold text-green-800">Patient Registered Successfully!</h3>
                    </div>
                    <p className="text-sm text-green-700 mb-3">Share these credentials with the patient:</p>
                    <div className="bg-white rounded-lg p-3 font-mono text-sm text-slate-700 border border-green-200">
                        <p>Email: <strong>{registered.data?.email}</strong></p>
                        <p>Password: <strong>{registered.tempPassword}</strong></p>
                    </div>
                    <button onClick={copyCredentials} className="mt-3 flex items-center gap-2 text-sm text-green-700 font-medium hover:text-green-900">
                        {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy Credentials</>}
                    </button>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                        <UserPlus size={20} className="text-teal-600" />
                    </div>
                    <h2 className="font-semibold text-slate-800">New Patient Registration</h2>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    {[
                        ['name', 'Full Name *', 'text', true, 'col-span-2'],
                        ['email', 'Email Address *', 'email', true, 'col-span-2'],
                        ['phone', 'Phone Number', 'tel', false, ''],
                        ['dateOfBirth', 'Date of Birth', 'date', false, ''],
                        ['bloodGroup', 'Blood Group', 'text', false, ''],
                        ['emergencyContact', 'Emergency Contact', 'tel', false, ''],
                        ['address', 'Address', 'text', false, 'col-span-2'],
                    ].map(([key, label, type, req, span]) => (
                        <div key={key} className={span}>
                            <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                            <input type={type} required={req} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                                placeholder={key === 'bloodGroup' ? 'A+, B-, O+...' : key === 'emergencyContact' ? '+923001234567' : ''}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                        <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <button type="submit" disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
                            {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Registering...</> : <><UserPlus size={16} /> Register Patient</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPatient;
