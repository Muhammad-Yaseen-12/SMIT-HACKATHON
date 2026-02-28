import React, { useState, useEffect } from 'react';
import { getAdminUsers, createStaffAPI, updateUserAPI, toggleUserStatusAPI, deleteUserAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Trash2, ToggleLeft, ToggleRight, Search, Pencil, X } from 'lucide-react';

const ManageReceptionists = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'receptionist', phone: '' });
    const [editRec, setEditRec] = useState(null);
    const [editForm, setEditForm] = useState({});

    const loadList = () => getAdminUsers('receptionist').then(r => setList(r.data.data)).finally(() => setLoading(false));
    useEffect(() => { loadList(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            await createStaffAPI(fd);
            toast.success('Receptionist created!');
            setShowForm(false);
            setForm({ name: '', email: '', password: '', role: 'receptionist', phone: '' });
            loadList();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const openEdit = (rec) => {
        setEditRec(rec);
        setEditForm({ name: rec.name || '', phone: rec.phone || '' });
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
            await updateUserAPI(editRec._id, fd);
            toast.success('Receptionist updated');
            setEditRec(null);
            loadList();
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    };

    const filtered = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-5">
            {/* Edit Modal */}
            {editRec && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <button onClick={() => setEditRec(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={18} /></button>
                        <h3 className="font-semibold text-slate-800 mb-4">Edit Receptionist — {editRec.name}</h3>
                        <form onSubmit={handleEdit} className="space-y-4">
                            {[['name', 'Full Name', 'text'], ['phone', 'Phone', 'tel']].map(([key, label, type]) => (
                                <div key={key}>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                                    <input type={type} value={editForm[key] || ''}
                                        onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            ))}
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setEditRec(null)} className="border border-slate-200 px-5 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
                </div>
                <button onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <UserPlus size={16} /> Add Receptionist
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Add New Receptionist</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                        {[['name', 'Full Name', 'text', true], ['email', 'Email', 'email', true], ['password', 'Password', 'password', true], ['phone', 'Phone', 'tel', false]].map(([key, label, type, req]) => (
                            <div key={key}>
                                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                                <input type={type} required={req} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        ))}
                        <div className="col-span-2 flex gap-3">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">Create</button>
                            <button type="button" onClick={() => setShowForm(false)} className="border border-slate-200 px-6 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>{['Name', 'Email', 'Phone', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={5} className="text-center py-12 text-slate-500">Loading...</td></tr>
                            : filtered.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-slate-400">No receptionists</td></tr>
                                : filtered.map(r => (
                                    <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                                        <td className="px-4 py-3 text-slate-500">{r.email}</td>
                                        <td className="px-4 py-3 text-slate-500">{r.phone || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{r.isActive ? 'Active' : 'Inactive'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(r)} className="text-slate-400 hover:text-blue-600" title="Edit"><Pencil size={15} /></button>
                                                <button onClick={() => toggleUserStatusAPI(r._id).then(() => { toast.success('Updated'); loadList(); })} className="text-slate-400 hover:text-blue-600">
                                                    {r.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                                                </button>
                                                <button onClick={() => { if (window.confirm('Delete?')) deleteUserAPI(r._id).then(() => { toast.success('Deleted'); loadList(); }); }} className="text-slate-400 hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageReceptionists;

