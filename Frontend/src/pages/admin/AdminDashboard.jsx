import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminOverview from './AdminOverview';
import ManageDoctors from './ManageDoctors';
import AdminAnalytics from './AdminAnalytics';
import ManageReceptionists from './ManageReceptionists';
import ManagePatients from './ManagePatients';
import AdminSubscriptions from './AdminSubscriptions';
import AdminSystemUsage from './AdminSystemUsage';

const AdminDashboard = () => (
    <Routes>
        <Route index element={<DashboardLayout title="Admin Dashboard"><AdminOverview /></DashboardLayout>} />
        <Route path="doctors" element={<DashboardLayout title="Manage Doctors"><ManageDoctors /></DashboardLayout>} />
        <Route path="receptionists" element={<DashboardLayout title="Manage Receptionists"><ManageReceptionists /></DashboardLayout>} />
        <Route path="patients" element={<DashboardLayout title="Manage Patients"><ManagePatients /></DashboardLayout>} />
        <Route path="analytics" element={<DashboardLayout title="Analytics"><AdminAnalytics /></DashboardLayout>} />
        <Route path="subscriptions" element={<DashboardLayout title="Subscription Plans"><AdminSubscriptions /></DashboardLayout>} />
        <Route path="system" element={<DashboardLayout title="System Usage"><AdminSystemUsage /></DashboardLayout>} />
    </Routes>
);

export default AdminDashboard;
