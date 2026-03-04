import AppointmentModel from "../../../models/AppointmentModel.js";
import UserModel from "../../../models/UserModel.js";
import { INTERNAL_SERVER_ERROR_MESSAGE } from "../../../constants/index.js";
import bcrypt from "bcrypt";

// Register new patient
export const registerPatient = async (req, res) => {
    try {
        const { name, email, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact } = req.body;
        if (!name || !email) {
            return res.status(400).json({ success: false, message: "Name and email are required" });
        }

        const existing = await UserModel.findOne({ email });
        if (existing) return res.status(409).json({ success: false, message: "Email already registered" });

        // Generate temp password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const patient = await UserModel.create({
            name, email, password: hashedPassword, role: "patient",
            phone: phone || "", dateOfBirth: dateOfBirth || null,
            gender: gender || "male", bloodGroup: bloodGroup || "",
            address: address || "", emergencyContact: emergencyContact || "",
        });

        const { password: _, ...safePatient } = patient.toObject();
        res.status(201).json({
            success: true,
            message: "Patient registered successfully",
            data: safePatient,
            tempPassword, // Send back for receptionist to give to patient
        });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE, error: err.message });
    }
};

// Book appointment
export const bookAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, timeSlot, type, reason } = req.body;
        if (!patientId || !doctorId || !appointmentDate || !timeSlot) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        // Check for slot conflict
        const conflict = await AppointmentModel.findOne({
            doctor: doctorId,
            appointmentDate: new Date(appointmentDate),
            timeSlot,
            status: { $in: ["pending", "confirmed"] },
        });
        if (conflict) {
            return res.status(409).json({ success: false, message: "Time slot already booked" });
        }

        // Get token number for the day
        const dayStart = new Date(appointmentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(appointmentDate);
        dayEnd.setHours(23, 59, 59, 999);
        const count = await AppointmentModel.countDocuments({
            doctor: doctorId,
            appointmentDate: { $gte: dayStart, $lte: dayEnd },
        });

        const appointment = await AppointmentModel.create({
            patient: patientId,
            doctor: doctorId,
            bookedBy: req.user.id,
            appointmentDate: new Date(appointmentDate),
            timeSlot,
            type: type || "general",
            reason: reason || "",
            tokenNumber: count + 1,
            status: "confirmed",
        });

        const populated = await appointment.populate([
            { path: "patient", select: "name email phone" },
            { path: "doctor", select: "name specialization consultationFee" },
        ]);

        res.status(201).json({ success: true, message: "Appointment booked", data: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE, error: err.message });
    }
};

// Get today's schedule
export const getDailySchedule = async (req, res) => {
    try {
        const { date, doctorId } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
        const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

        const filter = {
            appointmentDate: { $gte: dayStart, $lte: dayEnd },
        };
        if (doctorId) filter.doctor = doctorId;

        const appointments = await AppointmentModel.find(filter)
            .populate("patient", "name email phone gender bloodGroup")
            .populate("doctor", "name specialization")
            .sort({ timeSlot: 1 });

        res.status(200).json({ success: true, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Get all appointments (for receptionist)
export const getAllAppointments = async (req, res) => {
    try {
        const { date, status, doctorId } = req.query;

        const filter = {};
        if (date) {
            const targetDate = new Date(date);
            const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
            const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));
            filter.appointmentDate = { $gte: dayStart, $lte: dayEnd };
        }
        if (status) filter.status = status;
        if (doctorId) filter.doctor = doctorId;

        const appointments = await AppointmentModel.find(filter)
            .populate("patient", "name email phone gender bloodGroup")
            .populate("doctor", "name specialization")
            .populate("cancelledBy", "name role")
            .sort({ appointmentDate: -1, timeSlot: 1 });

        res.status(200).json({ success: true, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Update patient info
export const updatePatientInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact } = req.body;
        const patient = await UserModel.findOneAndUpdate(
            { _id: id, role: "patient" },
            { name, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact },
            { new: true }
        ).select("-password");
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
        res.status(200).json({ success: true, data: patient });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await AppointmentModel.findByIdAndUpdate(
            id,
            {
                status: "cancelled",
                cancelledBy: req.user.id,
                cancelledByRole: req.user.role
            },
            { new: true }
        ).populate("patient doctor")
            .populate("cancelledBy", "name role");
        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
        res.status(200).json({ success: true, message: "Appointment cancelled", data: appointment });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Search patients
export const searchPatients = async (req, res) => {
    try {
        const { q } = req.query;
        const patients = await UserModel.find({
            role: "patient",
            $or: [
                { name: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
                { phone: { $regex: q, $options: "i" } },
            ],
        }).select("-password").limit(20);
        res.status(200).json({ success: true, data: patients });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Get available doctors
export const getAvailableDoctors = async (req, res) => {
    try {
        const doctors = await UserModel.find({ role: "doctor", isActive: true }).select("-password");
        res.status(200).json({ success: true, data: doctors });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Get upcoming appointments (all future appointments)
export const getUpcomingAppointments = async (req, res) => {
    try {
        const { doctorId } = req.query;
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const filter = {
            appointmentDate: { $gte: tomorrow },
            status: { $in: ["pending", "confirmed"] },
        };
        if (doctorId) filter.doctor = doctorId;

        const appointments = await AppointmentModel.find(filter)
            .populate("patient", "name email phone gender bloodGroup")
            .populate("doctor", "name specialization")
            .sort({ appointmentDate: 1, timeSlot: 1 });

        res.status(200).json({ success: true, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};
