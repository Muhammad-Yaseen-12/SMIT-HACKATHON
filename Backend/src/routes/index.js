import { Router } from 'express';
import authRoutes from '../modules/auth/route/authRoutes.js';
import userRoutes from '../modules/user/route/userRoutes.js';
import adminRoutes from '../modules/admin/route/adminRoutes.js';
import doctorRoutes from '../modules/doctor/route/doctorRoutes.js';
import receptionistRoutes from '../modules/receptionist/route/receptionistRoutes.js';
import patientRoutes from '../modules/patient/route/patientRoutes.js';

const router = Router();

router.use('/api', authRoutes);
router.use('/api', userRoutes);
router.use('/api', adminRoutes);
router.use('/api', doctorRoutes);
router.use('/api', receptionistRoutes);
router.use('/api', patientRoutes);

export default router;
