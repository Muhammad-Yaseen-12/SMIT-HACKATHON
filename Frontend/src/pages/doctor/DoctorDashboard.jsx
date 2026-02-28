import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DoctorOverview from './DoctorOverview';
import DoctorAppointments from './DoctorAppointments';
import DoctorPrescriptions from './DoctorPrescriptions';
import DoctorAiAssist from './DoctorAiAssist';
import DoctorAnalytics from './DoctorAnalytics';

const DoctorDashboard = () => (
    <Routes>
        <Route index element={<DashboardLayout title="Doctor Dashboard"><DoctorOverview /></DashboardLayout>} />
        <Route path="appointments" element={<DashboardLayout title="My Appointments"><DoctorAppointments /></DashboardLayout>} />
        <Route path="prescriptions" element={<DashboardLayout title="Prescriptions"><DoctorPrescriptions /></DashboardLayout>} />
        <Route path="ai-assist" element={<DashboardLayout title="AI Diagnosis Assistant"><DoctorAiAssist /></DashboardLayout>} />
        <Route path="analytics" element={<DashboardLayout title="My Analytics"><DoctorAnalytics /></DashboardLayout>} />
    </Routes>
);

export default DoctorDashboard;
