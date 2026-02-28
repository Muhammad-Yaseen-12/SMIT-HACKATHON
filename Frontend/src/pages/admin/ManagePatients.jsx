import React, { useState, useEffect } from 'react';
import { getAdminUsers } from '../../services/api';
import { Search } from 'lucide-react';

const ManagePatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getAdminUsers('patient').then(r => setPatients(r.data.data)).finally(() => setLoading(false));
    }, []);

    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-5">
            <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>{['Patient', 'Email', 'Phone', 'Gender', 'Blood Group', 'Joined'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={6} className="text-center py-12 text-slate-500">Loading...</td></tr>
                            : filtered.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-slate-400">No patients found</td></tr>
                                : filtered.map(p => (
                                    <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <span className="text-green-700 text-xs font-bold">{p.name[0]}</span>
                                                </div>
                                                <span className="font-medium text-slate-800">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{p.email}</td>
                                        <td className="px-4 py-3 text-slate-500">{p.phone || '-'}</td>
                                        <td className="px-4 py-3 text-slate-500 capitalize">{p.gender || '-'}</td>
                                        <td className="px-4 py-3 text-slate-500">{p.bloodGroup || '-'}</td>
                                        <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagePatients;
