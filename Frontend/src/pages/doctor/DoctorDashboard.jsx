import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DoctorOverview from './DoctorOverview';
import DoctorAppointments from './DoctorAppointments';
import DoctorAllAppointments from './DoctorAllAppointments';
import DoctorUpcomingSchedule from './DoctorUpcomingSchedule';
import DoctorPrescriptions from './DoctorPrescriptions';
import DoctorAiAssist from './DoctorAiAssist';
import DoctorAnalytics from './DoctorAnalytics';

const DoctorDashboard = () => (
    <Routes>
        <Route index element={<DashboardLayout><DoctorOverview /></DashboardLayout>} />
        <Route path="all-appointments" element={<DashboardLayout><DoctorAllAppointments /></DashboardLayout>} />
        <Route path="appointments" element={<DashboardLayout><DoctorAppointments /></DashboardLayout>} />
        <Route path="upcoming" element={<DashboardLayout><DoctorUpcomingSchedule /></DashboardLayout>} />
        <Route path="prescriptions" element={<DashboardLayout><DoctorPrescriptions /></DashboardLayout>} />
        <Route path="ai-assist" element={<DashboardLayout><DoctorAiAssist /></DashboardLayout>} />
        <Route path="analytics" element={<DashboardLayout><DoctorAnalytics /></DashboardLayout>} />
    </Routes>
);

export default DoctorDashboard;
