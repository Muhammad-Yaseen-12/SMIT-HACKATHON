import AppointmentModel from "../../../models/AppointmentModel.js";
import PrescriptionModel from "../../../models/PrescriptionModel.js";
import DiagnosisModel from "../../../models/DiagnosisModel.js";
import UserModel from "../../../models/UserModel.js";
import { INTERNAL_SERVER_ERROR_MESSAGE } from "../../../constants/index.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";

// Get doctor's appointments
export const getDoctorAppointments = async (req, res) => {
    try {
        const { date, status } = req.query;
        const filter = { doctor: req.user.id };
        if (status) filter.status = status;
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            filter.appointmentDate = { $gte: start, $lte: end };
        }
        const appointments = await AppointmentModel.find(filter)
            .populate("patient", "name email phone gender bloodGroup profileImageUrl dateOfBirth")
            .sort({ appointmentDate: 1, timeSlot: 1 });
        res.status(200).json({ success: true, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Get patient history for doctor
export const getPatientHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        const [appointments, prescriptions, diagnoses] = await Promise.all([
            AppointmentModel.find({ patient: patientId, doctor: req.user.id })
                .sort({ appointmentDate: -1 }),
            PrescriptionModel.find({ patient: patientId })
                .populate("doctor", "name specialization")
                .sort({ createdAt: -1 }),
            DiagnosisModel.find({ patient: patientId })
                .populate("doctor", "name specialization")
                .sort({ createdAt: -1 }),
        ]);
        const patient = await UserModel.findById(patientId).select("-password");
        res.status(200).json({ success: true, data: { patient, appointments, prescriptions, diagnoses } });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Add diagnosis
export const addDiagnosis = async (req, res) => {
    try {
        const { patientId, appointmentId, symptoms, finalDiagnosis, notes, severity } = req.body;
        const diagnosis = await DiagnosisModel.create({
            patient: patientId,
            doctor: req.user.id,
            appointment: appointmentId || null,
            symptoms,
            finalDiagnosis,
            notes,
            severity: severity || "mild",
        });
        // Update appointment status to completed
        if (appointmentId) {
            await AppointmentModel.findByIdAndUpdate(appointmentId, { status: "completed" });
        }
        res.status(201).json({ success: true, message: "Diagnosis saved", data: diagnosis });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE, error: err.message });
    }
};

// Write prescription
export const writePrescription = async (req, res) => {
    try {
        const { patientId, appointmentId, diagnosis, symptoms, medications, labTests, advice, followUpDate, isAiEnabled } = req.body;

        let aiExplanation = "";
        if (isAiEnabled && process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                const prompt = `You are a friendly medical explainer. A doctor diagnosed a patient with "${diagnosis}" and prescribed these medications: ${medications?.map(m => `${m.name} ${m.dosage} ${m.frequency} for ${m.duration}`).join(", ")}. 
                Write a simple, reassuring explanation in 2-3 sentences that a non-medical patient can easily understand. Include what the condition is and how the medicines help.`;
                const result = await model.generateContent(prompt);
                aiExplanation = result.response.text();
            } catch (aiErr) {
                console.error("AI explanation failed:", aiErr.message);
            }
        }

        const prescription = await PrescriptionModel.create({
            patient: patientId,
            doctor: req.user.id,
            appointment: appointmentId || null,
            diagnosis,
            symptoms: symptoms || [],
            medications: medications || [],
            labTests: labTests || [],
            advice: advice || "",
            followUpDate: followUpDate || null,
            aiExplanation,
            isAiEnabled: !!isAiEnabled,
        });

        const populated = await prescription.populate([
            { path: "patient", select: "name email phone gender bloodGroup dateOfBirth" },
            { path: "doctor", select: "name specialization qualification" },
        ]);

        res.status(201).json({ success: true, message: "Prescription created", data: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE, error: err.message });
    }
};

// Get doctor's prescriptions
export const getDoctorPrescriptions = async (req, res) => {
    try {
        const prescriptions = await PrescriptionModel.find({ doctor: req.user.id })
            .populate("patient", "name email phone")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: prescriptions });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// ── AI fallback data builder ──────────────────────────────────────────────────
const buildFallbackDiagnosis = (symptoms) => ({
    isFallback: true,
    fallbackReason: "AI service is currently unavailable. Showing general guidance.",
    diagnoses: [
        {
            condition: "Clinical evaluation required",
            likelihood: "high",
            description: `Based on the reported symptoms (${Array.isArray(symptoms) ? symptoms.join(", ") : symptoms}), a thorough in-person clinical examination is necessary for accurate diagnosis.`,
        },
    ],
    tests: [
        "Complete Blood Count (CBC)",
        "Basic Metabolic Panel",
        "Urinalysis",
        "Vital signs assessment",
    ],
    treatments: [
        "Conduct a comprehensive physical examination",
        "Review patient's complete medical history",
        "Order appropriate diagnostic tests based on clinical findings",
        "Consult relevant specialist if required",
    ],
    redFlags: [
        "Sudden severe onset of symptoms",
        "High fever (>39°C / 102°F)",
        "Difficulty breathing or chest pain",
        "Altered consciousness or severe confusion",
        "Symptoms rapidly worsening over hours",
    ],
});

// ── Gemini call with retry + JSON extraction ──────────────────────────────────
const callGeminiDiagnosis = async (symptoms, patientAge, patientGender, medicalHistory) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an AI medical assistant helping a qualified doctor (not a patient).
Patient info: Age: ${patientAge || "unknown"}, Gender: ${patientGender || "unknown"}.
Medical history: ${medicalHistory || "none provided"}.
Current symptoms: ${Array.isArray(symptoms) ? symptoms.join(", ") : symptoms}.

Please provide:
1. Top 3 possible diagnoses (with likelihood: high/medium/low)
2. Recommended diagnostic tests
3. General treatment recommendations
4. Red flags to watch for

IMPORTANT: This is for a qualified doctor's reference only. 
Respond ONLY with valid JSON. No markdown, no explanation outside JSON.
Format: { "diagnoses": [{"condition": "", "likelihood": "high|medium|low", "description": ""}], "tests": [], "treatments": [], "redFlags": [] }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    return { raw: responseText };
};

// AI Diagnosis assistance
export const aiDiagnosisAssist = async (req, res) => {
    try {
        const { symptoms, patientAge, patientGender, medicalHistory } = req.body;

        if (!symptoms || symptoms.length === 0) {
            return res.status(400).json({ success: false, message: "Symptoms are required" });
        }

        // ── No API key configured (missing or still the default placeholder) ──
        const PLACEHOLDER = "your_gemini_api_key_here";
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === PLACEHOLDER) {
            return res.status(200).json({
                success: true,
                data: buildFallbackDiagnosis(symptoms),
                warning: "AI service is not configured. Showing general clinical guidance.",
            });
        }

        // ── Try Gemini; fall back gracefully on any error ─────────────────────
        try {
            const aiData = await callGeminiDiagnosis(symptoms, patientAge, patientGender, medicalHistory);
            return res.status(200).json({ success: true, data: aiData });
        } catch (aiErr) {
            console.error("[AI] Gemini diagnosis failed:", aiErr.message);

            // Classify the error for a meaningful warning message
            // Check numeric HTTP status FIRST (before scanning message text),
            // because the SDK always wraps errors as "Error fetching from ..."
            // which would otherwise falsely match the network-error branch.
            const errMsg = aiErr.message?.toLowerCase() ?? "";
            const errStatus = aiErr.status ?? aiErr.httpStatus ?? aiErr.response?.status;
            let warning = "AI analysis encountered an error. Showing general clinical guidance.";
            if (errStatus === 429 || errMsg.includes("quota") || errMsg.includes("resource_exhausted") || errMsg.includes("too many requests")) {
                warning = "AI quota exceeded. Please try again in a few minutes.";
            } else if (
                errStatus === 400 || errStatus === 403 ||
                errMsg.includes("api_key") || errMsg.includes("api key") ||
                errMsg.includes("permission") || errMsg.includes("unauthorized")
            ) {
                warning = "AI API key is invalid or unauthorised. Set a valid GEMINI_API_KEY in the backend .env file.";
            } else if (errStatus === 404 || errMsg.includes("not found") || errMsg.includes("model")) {
                warning = "AI model unavailable. Please contact support.";
            } else if (aiErr.code === "ENOTFOUND" || errMsg.includes("enotfound") || errMsg.includes("network")) {
                warning = "Backend cannot reach the Gemini API. Check server internet access and your GEMINI_API_KEY.";
            }

            return res.status(200).json({
                success: true,
                data: buildFallbackDiagnosis(symptoms),
                warning,
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE, error: err.message });
    }
};

// Doctor analytics
export const getDoctorAnalytics = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const [total, completed, pending, cancelled, totalPrescriptions, todayAppointments] = await Promise.all([
            AppointmentModel.countDocuments({ doctor: doctorId }),
            AppointmentModel.countDocuments({ doctor: doctorId, status: "completed" }),
            AppointmentModel.countDocuments({ doctor: doctorId, status: "pending" }),
            AppointmentModel.countDocuments({ doctor: doctorId, status: "cancelled" }),
            PrescriptionModel.countDocuments({ doctor: doctorId }),
            AppointmentModel.countDocuments({
                doctor: doctorId,
                appointmentDate: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lte: new Date(new Date().setHours(23, 59, 59, 999)),
                },
            }),
        ]);

        const weeklyData = await AppointmentModel.aggregate([
            { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
            {
                $group: {
                    _id: { $dayOfWeek: "$appointmentDate" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id": 1 } },
        ]);

        res.status(200).json({
            success: true,
            data: { total, completed, pending, cancelled, totalPrescriptions, todayAppointments, weeklyData },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const appointment = await AppointmentModel.findOneAndUpdate(
            { _id: id, doctor: req.user.id },
            { status, notes },
            { new: true }
        ).populate("patient", "name email phone");
        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
        res.status(200).json({ success: true, data: appointment });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};
