import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Request interceptor - add token from localStorage
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - handle 401
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const loginAPI = (data) => API.post('/auth/login', data);
export const registerAPI = (data) => API.post('/auth/register', data);
export const logoutAPI = () => API.post('/auth/logout');
export const getMeAPI = () => API.get('/auth/me');

// Admin
export const getAdminAnalytics = () => API.get('/admin/analytics');
export const getAdminUsers = (role) => API.get(`/admin/users${role ? `?role=${role}` : ''}`);
export const createStaffAPI = (data) => API.post('/admin/staff', data);
export const updateUserAPI = (id, data) => API.patch(`/admin/users/${id}`, data);
export const toggleUserStatusAPI = (id) => API.patch(`/admin/users/${id}/toggle`);
export const deleteUserAPI = (id) => API.delete(`/admin/users/${id}`);
// Subscription plans
export const getSubscriptionPlansAPI = () => API.get('/admin/subscriptions');
export const createSubscriptionPlanAPI = (data) => API.post('/admin/subscriptions', data);
export const updateSubscriptionPlanAPI = (id, data) => API.patch(`/admin/subscriptions/${id}`, data);
export const toggleSubscriptionPlanAPI = (id) => API.patch(`/admin/subscriptions/${id}/toggle`);
export const deleteSubscriptionPlanAPI = (id) => API.delete(`/admin/subscriptions/${id}`);
// System usage
export const getSystemUsageAPI = () => API.get('/admin/system-usage');

// Doctor
export const getDoctorAppointmentsAPI = (params) => API.get('/doctor/appointments', { params });
export const getPatientHistoryAPI = (patientId) => API.get(`/doctor/patients/${patientId}/history`);
export const addDiagnosisAPI = (data) => API.post('/doctor/diagnosis', data);
export const writePrescriptionAPI = (data) => API.post('/doctor/prescriptions', data);
export const getDoctorPrescriptionsAPI = () => API.get('/doctor/prescriptions');
export const aiDiagnosisAssistAPI = (data) => API.post('/doctor/ai-diagnosis', data);
export const getDoctorAnalyticsAPI = () => API.get('/doctor/analytics');
export const updateAppointmentStatusAPI = (id, data) => API.patch(`/doctor/appointments/${id}/status`, data);

// Receptionist
export const registerPatientAPI = (data) => API.post('/receptionist/patients', data);
export const searchPatientsAPI = (q) => API.get(`/receptionist/patients/search?q=${q}`);
export const updatePatientAPI = (id, data) => API.patch(`/receptionist/patients/${id}`, data);
export const bookAppointmentAPI = (data) => API.post('/receptionist/appointments', data);
export const getDailyScheduleAPI = (params) => API.get('/receptionist/schedule', { params });
export const cancelAppointmentAPI = (id) => API.patch(`/receptionist/appointments/${id}/cancel`);
export const getAvailableDoctorsAPI = () => API.get('/receptionist/doctors');

// Patient
export const getPatientProfileAPI = () => API.get('/patient/profile');
export const updatePatientProfileAPI = (data) => API.patch('/patient/profile', data);
export const getPatientAppointmentsAPI = () => API.get('/patient/appointments');
export const getPatientPrescriptionsAPI = () => API.get('/patient/prescriptions');
export const downloadPrescriptionAPI = (id) =>
    API.get(`/patient/prescriptions/${id}/download`, { responseType: 'blob' });

export default API;
