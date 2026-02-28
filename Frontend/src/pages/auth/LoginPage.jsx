import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Stethoscope, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginAPI(form);
            login(res.data.user, res.data.token);
            toast.success(`Welcome back, ${res.data.user.name}!`);
            navigate(`/${res.data.user.role}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 flex-col justify-center items-center p-12 text-white">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                    <Stethoscope size={40} className="text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-4 text-center">AI Clinic Management</h1>
                <p className="text-blue-200 text-lg text-center max-w-sm leading-relaxed">
                    Digitizing healthcare workflows with intelligent AI assistance for doctors and patients.
                </p>
                <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
                    {[
                        ['Smart Diagnosis', 'AI-powered symptom analysis'],
                        ['Digital Prescriptions', 'Paperless prescription system'],
                        ['Analytics', 'Real-time clinic insights'],
                        ['4 Role System', 'Admin, Doctor, Receptionist, Patient'],
                    ].map(([title, desc]) => (
                        <div key={title} className="bg-white/10 rounded-xl p-4">
                            <p className="font-semibold text-sm mb-1">{title}</p>
                            <p className="text-blue-200 text-xs">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-6 lg:hidden">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Stethoscope size={20} className="text-white" />
                                </div>
                                <span className="font-bold text-slate-800">AI Clinic</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Sign in</h2>
                            <p className="text-slate-500 mt-1 text-sm">Enter your credentials to access your dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        placeholder="doctor@clinic.com"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Signing in...</>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <p className="text-xs text-slate-500 text-center mb-3 font-medium">Demo Accounts</p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                {[
                                    ['Admin', 'admin@clinic.com'],
                                    ['Doctor', 'doctor@clinic.com'],
                                    ['Receptionist', 'receptionist@clinic.com'],
                                    ['Patient', 'patient@clinic.com'],
                                ].map(([role, email]) => (
                                    <button key={role} type="button"
                                        onClick={() => setForm({ email, password: 'Admin12345!' })}
                                        className="bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg p-2 text-left transition-colors cursor-pointer">
                                        <span className="font-medium block">{role}</span>
                                        <span className="text-slate-400">{email}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
