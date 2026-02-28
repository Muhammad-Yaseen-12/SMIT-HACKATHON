import React from 'react';
import Sidebar from '../shared/Sidebar';
import Header from '../shared/Header';

const DashboardLayout = ({ title, children }) => (
    <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
            <Header title={title} />
            <main className="flex-1 overflow-y-auto p-6">
                {children}
            </main>
        </div>
    </div>
);

export default DashboardLayout;
