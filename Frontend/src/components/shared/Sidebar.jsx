import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
    LayoutDashboard, Users, Calendar, FileText, Brain,
    BarChart2, LogOut, Menu, X, UserPlus, Stethoscope, ClipboardList, User,
    CreditCard, Activity
} from 'lucide-react';

const roleMenus = {
    admin: [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
        { to: '/admin/receptionists', icon: Users, label: 'Receptionists' },
        { to: '/admin/patients', icon: User, label: 'Patients' },
        { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
        { to: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
        { to: '/admin/system', icon: Activity, label: 'System Usage' },
    ],
    doctor: [
        { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
        { to: '/doctor/prescriptions', icon: FileText, label: 'Prescriptions' },
        { to: '/doctor/ai-assist', icon: Brain, label: 'AI Diagnosis' },
        { to: '/doctor/analytics', icon: BarChart2, label: 'My Analytics' },
    ],
    receptionist: [
        { to: '/receptionist', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/receptionist/register-patient', icon: UserPlus, label: 'Register Patient' },
        { to: '/receptionist/book-appointment', icon: Calendar, label: 'Book Appointment' },
        { to: '/receptionist/schedule', icon: ClipboardList, label: 'Daily Schedule' },
        { to: '/receptionist/patients', icon: Users, label: 'Patients' },
    ],
    patient: [
        { to: '/patient', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
        { to: '/patient/prescriptions', icon: FileText, label: 'Prescriptions' },
        { to: '/patient/profile', icon: User, label: 'Profile' },
    ],
};

const roleBadgeColors = {
    admin: 'bg-purple-100 text-purple-700',
    doctor: 'bg-blue-100 text-blue-700',
    receptionist: 'bg-teal-100 text-teal-700',
    patient: 'bg-green-100 text-green-700',
};

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const menu = roleMenus[user?.role] || [];

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-md text-slate-700"
                onClick={() => setOpen(!open)}
            >
                {open ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Overlay */}
            {open && (
                <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300
                ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>

                {/* Logo */}
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Stethoscope size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight">AI Clinic</p>
                            <p className="text-xs text-slate-500">Management System</p>
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        {user?.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">{user?.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleBadgeColors[user?.role]}`}>
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 overflow-y-auto">
                    {menu.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === `/${user?.role}`}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors
                                ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
