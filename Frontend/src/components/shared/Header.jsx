import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ title, onMenuClick }) => {
    const { user } = useAuth();
    return (
        <header className="bg-white border-b border-slate-100 px-4 py-3 lg:px-6 lg:py-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                >
                    <Menu size={22} />
                </button>
                <h1 className="text-base lg:text-xl font-semibold text-slate-800 truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors relative">
                    <Bell size={18} className="lg:w-5 lg:h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-2 pl-2 lg:pl-3 border-l border-slate-200">
                    {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-xs">{user?.name?.[0]?.toUpperCase()}</span>
                        </div>
                    )}
                    <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
