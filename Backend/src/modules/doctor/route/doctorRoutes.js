import { Router } from "express";
import tokenVerification from "../../../middlewares/tokenVerification.js";
import authorizeRoles from "../../../middlewares/authorizeRoles.js";
import {
    getDoctorAppointments, getPatientHistory, addDiagnosis,
    writePrescription, getDoctorPrescriptions, aiDiagnosisAssist,
    getDoctorAnalytics, updateAppointmentStatus,
} from "../controllers/doctorController.js";

const router = Router();
const protect = [tokenVerification, authorizeRoles("doctor")];

router.get("/doctor/appointments", ...protect, getDoctorAppointments);
router.get("/doctor/patients/:patientId/history", ...protect, getPatientHistory);
router.post("/doctor/diagnosis", ...protect, addDiagnosis);
router.post("/doctor/prescriptions", ...protect, writePrescription);
router.get("/doctor/prescriptions", ...protect, getDoctorPrescriptions);
router.post("/doctor/ai-diagnosis", ...protect, aiDiagnosisAssist);
router.get("/doctor/analytics", ...protect, getDoctorAnalytics);
router.patch("/doctor/appointments/:id/status", ...protect, updateAppointmentStatus);

export default router;
