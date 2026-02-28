import React, { useState, useEffect } from 'react';
import { getSubscriptionPlansAPI, createSubscriptionPlanAPI, updateSubscriptionPlanAPI, toggleSubscriptionPlanAPI, deleteSubscriptionPlanAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { CreditCard, Plus, Trash2, ToggleLeft, ToggleRight, Check, Star, Pencil, X } from 'lucide-react';

const EMPTY_FORM = { name: '', price: '', billingCycle: 'monthly', maxDoctors: '', maxPatients: '', features: '' };

const AdminSubscriptions = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [editPlan, setEditPlan] = useState(null);
    const [editForm, setEditForm] = useState({});

    const load = () => {
        setLoading(true);
        getSubscriptionPlansAPI().then(r => setPlans(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createSubscriptionPlanAPI({
                ...form,
                price: Number(form.price),
                maxDoctors: form.maxDoctors === '' ? -1 : Number(form.maxDoctors),
                maxPatients: form.maxPatients === '' ? -1 : Number(form.maxPatients),
                features: form.features.split(',').map(f => f.trim()).filter(Boolean),
            });
            toast.success('Plan created');
            setForm(EMPTY_FORM);
            setShowForm(false);
            load();
        } catch { toast.error('Failed to create plan'); }
        finally { setSaving(false); }
    };

    const handleToggle = async (id) => {
        try {
            const r = await toggleSubscriptionPlanAPI(id);
            toast.success(r.data.message);
            load();
        } catch { toast.error('Failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this plan?')) return;
        try {
            await deleteSubscriptionPlanAPI(id);
            toast.success('Plan deleted');
            load();
        } catch { toast.error('Failed'); }
    };

    const openEditPlan = (plan) => {
        setEditPlan(plan);
        setEditForm({
            name: plan.name,
            price: plan.price,
            billingCycle: plan.billingCycle,
            maxDoctors: plan.maxDoctors === -1 ? '' : plan.maxDoctors,
            maxPatients: plan.maxPatients === -1 ? '' : plan.maxPatients,
            features: plan.features.join(', '),
        });
    };

    const handleEditPlan = async (e) => {
        e.preventDefault();
        try {
            await updateSubscriptionPlanAPI(editPlan.id, {
                ...editForm,
                price: Number(editForm.price),
                maxDoctors: editForm.maxDoctors === '' ? -1 : Number(editForm.maxDoctors),
                maxPatients: editForm.maxPatients === '' ? -1 : Number(editForm.maxPatients),
                features: editForm.features.split(',').map(f => f.trim()).filter(Boolean),
            });
            toast.success('Plan updated');
            setEditPlan(null);
            load();
        } catch { toast.error('Update failed'); }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="space-y-6">
            {/* Edit Plan Modal */}
            {editPlan && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
                        <button onClick={() => setEditPlan(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={18} /></button>
                        <h3 className="font-semibold text-slate-800 mb-4">Edit Plan — {editPlan.name}</h3>
                        <form onSubmit={handleEditPlan} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Plan Name *</label>
                                <input required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Price (PKR) *</label>
                                <input required type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Billing Cycle</label>
                                <select value={editForm.billingCycle} onChange={e => setEditForm({ ...editForm, billingCycle: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Max Doctors (blank = unlimited)</label>
                                <input type="number" value={editForm.maxDoctors} onChange={e => setEditForm({ ...editForm, maxDoctors: e.target.value })} placeholder="Unlimited"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Max Patients (blank = unlimited)</label>
                                <input type="number" value={editForm.maxPatients} onChange={e => setEditForm({ ...editForm, maxPatients: e.target.value })} placeholder="Unlimited"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Features (comma-separated)</label>
                                <input value={editForm.features} onChange={e => setEditForm({ ...editForm, features: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="col-span-2 flex gap-3 justify-end">
                                <button type="button" onClick={() => setEditPlan(null)} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-slate-800">Subscription Plans</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage clinic subscription tiers</p>
                </div>
                <button onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
                    <Plus size={16} /> New Plan
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="font-medium text-slate-800 mb-4">Create New Plan</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Plan Name *</label>
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Starter"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Price (PKR) *</label>
                            <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 9999"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Billing Cycle</label>
                            <select value={form.billingCycle} onChange={e => setForm({ ...form, billingCycle: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Max Doctors (blank = unlimited)</label>
                            <input type="number" value={form.maxDoctors} onChange={e => setForm({ ...form, maxDoctors: e.target.value })} placeholder="Unlimited"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Max Patients (blank = unlimited)</label>
                            <input type="number" value={form.maxPatients} onChange={e => setForm({ ...form, maxPatients: e.target.value })} placeholder="Unlimited"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Features (comma-separated)</label>
                            <input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="Appointments, Prescriptions, Analytics"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="col-span-2 flex gap-3 justify-end">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60">
                                {saving ? 'Creating...' : 'Create Plan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {plans.map(plan => (
                    <div key={plan.id} className={`bg-white rounded-xl border-2 p-5 relative ${plan.popular ? 'border-blue-400' : 'border-slate-200'} ${!plan.isActive ? 'opacity-60' : ''}`}>
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                <Star size={10} fill="white" /> Most Popular
                            </div>
                        )}
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <CreditCard size={18} className="text-blue-600" />
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${plan.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                {plan.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">{plan.name}</h3>
                        <p className="text-2xl font-bold text-blue-600 mt-1">PKR {plan.price.toLocaleString()}<span className="text-sm font-normal text-slate-400">/{plan.billingCycle}</span></p>
                        <div className="my-3 text-xs text-slate-500 space-y-1">
                            <p>👨‍⚕️ Doctors: {plan.maxDoctors === -1 ? 'Unlimited' : plan.maxDoctors}</p>
                            <p>🧑‍🤝‍🧑 Patients: {plan.maxPatients === -1 ? 'Unlimited' : plan.maxPatients}</p>
                        </div>
                        <ul className="space-y-1.5 mb-4">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                    <Check size={14} className="text-green-500 shrink-0" /> {f}
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-2 pt-3 border-t border-slate-100">
                            <button onClick={() => openEditPlan(plan)} className="flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                                <Pencil size={13} /> Edit
                            </button>
                            <button onClick={() => handleToggle(plan.id)} className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                                {plan.isActive ? <ToggleRight size={14} className="text-green-500" /> : <ToggleLeft size={14} className="text-slate-400" />}
                                {plan.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => handleDelete(plan.id)} className="px-3 py-2 rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Note */}
            <p className="text-xs text-slate-400 mt-2">⚠ Subscription plans are simulated for demo purposes. Payment gateway integration can be added in production.</p>
        </div>
    );
};

export default AdminSubscriptions;
