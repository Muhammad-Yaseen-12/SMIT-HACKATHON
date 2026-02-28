import { Router } from "express";
import tokenVerification from "../../../middlewares/tokenVerification.js";
import authorizeRoles from "../../../middlewares/authorizeRoles.js";
import {
    getPatientProfile, getPatientAppointments, getPatientPrescriptions,
    updatePatientProfile, downloadPrescriptionPDF,
} from "../controllers/patientController.js";

const router = Router();
const protect = [tokenVerification, authorizeRoles("patient")];

router.get("/patient/profile", ...protect, getPatientProfile);
router.patch("/patient/profile", ...protect, updatePatientProfile);
router.get("/patient/appointments", ...protect, getPatientAppointments);
router.get("/patient/prescriptions", ...protect, getPatientPrescriptions);
router.get("/patient/prescriptions/:id/download", ...protect, downloadPrescriptionPDF);

export default router;
