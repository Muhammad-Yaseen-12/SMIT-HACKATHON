import { Router } from "express";
import tokenVerification from "../../../middlewares/tokenVerification.js";
import authorizeRoles from "../../../middlewares/authorizeRoles.js";
import {
    registerPatient, bookAppointment, getDailySchedule,
    updatePatientInfo, cancelAppointment, searchPatients, getAvailableDoctors,
} from "../controllers/receptionistController.js";

const router = Router();
const protect = [tokenVerification, authorizeRoles("receptionist", "admin")];

router.post("/receptionist/patients", ...protect, registerPatient);
router.get("/receptionist/patients/search", ...protect, searchPatients);
router.patch("/receptionist/patients/:id", ...protect, updatePatientInfo);
router.post("/receptionist/appointments", ...protect, bookAppointment);
router.get("/receptionist/schedule", ...protect, getDailySchedule);
router.patch("/receptionist/appointments/:id/cancel", ...protect, cancelAppointment);
router.get("/receptionist/doctors", ...protect, getAvailableDoctors);

export default router;
