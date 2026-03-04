import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ReceptionistOverview from './ReceptionistOverview';
import RegisterPatient from './RegisterPatient';
import BookAppointment from './BookAppointment';
import DailySchedule from './DailySchedule';
import ReceptionistAllAppointments from './ReceptionistAllAppointments';
import UpcomingAppointments from './UpcomingAppointments';
import PatientList from './PatientList';

const ReceptionistDashboard = () => (
    <Routes>
        <Route index element={<DashboardLayout><ReceptionistOverview /></DashboardLayout>} />
        <Route path="register-patient" element={<DashboardLayout><RegisterPatient /></DashboardLayout>} />
        <Route path="book-appointment" element={<DashboardLayout><BookAppointment /></DashboardLayout>} />
        <Route path="schedule" element={<DashboardLayout><DailySchedule /></DashboardLayout>} />
        <Route path="all-appointments" element={<DashboardLayout><ReceptionistAllAppointments /></DashboardLayout>} />
        <Route path="upcoming" element={<DashboardLayout><UpcomingAppointments /></DashboardLayout>} />
        <Route path="patients" element={<DashboardLayout><PatientList /></DashboardLayout>} />
    </Routes>
);

export default ReceptionistDashboard;
