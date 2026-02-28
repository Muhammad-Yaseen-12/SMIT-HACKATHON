import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ReceptionistOverview from './ReceptionistOverview';
import RegisterPatient from './RegisterPatient';
import BookAppointment from './BookAppointment';
import DailySchedule from './DailySchedule';
import PatientList from './PatientList';

const ReceptionistDashboard = () => (
    <Routes>
        <Route index element={<DashboardLayout title="Receptionist Dashboard"><ReceptionistOverview /></DashboardLayout>} />
        <Route path="register-patient" element={<DashboardLayout title="Register Patient"><RegisterPatient /></DashboardLayout>} />
        <Route path="book-appointment" element={<DashboardLayout title="Book Appointment"><BookAppointment /></DashboardLayout>} />
        <Route path="schedule" element={<DashboardLayout title="Daily Schedule"><DailySchedule /></DashboardLayout>} />
        <Route path="patients" element={<DashboardLayout title="All Patients"><PatientList /></DashboardLayout>} />
    </Routes>
);

export default ReceptionistDashboard;
