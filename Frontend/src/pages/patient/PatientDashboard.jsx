import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PatientOverview from './PatientOverview';
import PatientAppointments from './PatientAppointments';
import PatientPrescriptions from './PatientPrescriptions';
import PatientProfile from './PatientProfile';

const PatientDashboard = () => (
    <DashboardLayout title="Patient Portal">
        <Routes>
            <Route index element={<PatientOverview />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
            <Route path="profile" element={<PatientProfile />} />
        </Routes>
    </DashboardLayout>
);

export default PatientDashboard;
