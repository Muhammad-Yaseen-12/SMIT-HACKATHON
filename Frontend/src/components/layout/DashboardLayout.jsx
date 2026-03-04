import React, { useState } from 'react';
import Sidebar from '../shared/Sidebar';
import Header from '../shared/Header';

const DashboardLayout = ({ title, children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
