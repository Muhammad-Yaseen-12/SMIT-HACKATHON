import AppointmentModel from "../../../models/AppointmentModel.js";
import PrescriptionModel from "../../../models/PrescriptionModel.js";
import UserModel from "../../../models/UserModel.js";
import { INTERNAL_SERVER_ERROR_MESSAGE } from "../../../constants/index.js";
import PDFDocument from "pdfkit";

// Get patient profile
export const getPatientProfile = async (req, res) => {
    try {
        const patient = await UserModel.findById(req.user.id).select("-password");
        res.status(200).json({ success: true, data: patient });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Get patient's appointments
export const getPatientAppointments = async (req, res) => {
    try {
        const appointments = await AppointmentModel.find({ patient: req.user.id })
            .populate("doctor", "name specialization profileImageUrl consultationFee")
            .sort({ appointmentDate: -1 });
        res.status(200).json({ success: true, data: appointments });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Get patient's prescriptions
export const getPatientPrescriptions = async (req, res) => {
    try {
        const prescriptions = await PrescriptionModel.find({ patient: req.user.id })
            .populate("doctor", "name specialization qualification profileImageUrl")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: prescriptions });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Update patient profile
export const updatePatientProfile = async (req, res) => {
    try {
        const { name, phone, address, emergencyContact, bloodGroup } = req.body;
        const updated = await UserModel.findByIdAndUpdate(
            req.user.id,
            { name, phone, address, emergencyContact, bloodGroup },
            { new: true }
        ).select("-password");
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Download prescription as PDF
export const downloadPrescriptionPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const prescription = await PrescriptionModel.findOne({ _id: id, patient: req.user.id })
            .populate("doctor", "name specialization qualification phone")
            .populate("patient", "name email phone gender bloodGroup dateOfBirth address");

        if (!prescription) return res.status(404).json({ success: false, message: "Prescription not found" });

        const doc = new PDFDocument({ margin: 50, size: "A4" });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=prescription-${id}.pdf`);
        doc.pipe(res);

        // Header
        doc.rect(0, 0, doc.page.width, 80).fill("#1d4ed8");
        doc.fontSize(22).fillColor("white").font("Helvetica-Bold")
            .text("AI Clinic Management System", 50, 20, { align: "center" });
        doc.fontSize(11).fillColor("white").font("Helvetica")
            .text("Medical Prescription", 50, 50, { align: "center" });

        doc.moveDown(3);
        doc.fillColor("#1e293b");

        // Doctor info
        doc.fontSize(13).font("Helvetica-Bold").text("Prescribing Doctor", 50, 100);
        doc.fontSize(11).font("Helvetica").fillColor("#374151")
            .text(`Dr. ${prescription.doctor.name}`, 50, 120)
            .text(`Specialization: ${prescription.doctor.specialization || "General Physician"}`, 50, 138)
            .text(`Qualification: ${prescription.doctor.qualification || "MBBS"}`, 50, 156);

        // Patient info box
        doc.rect(50, 180, doc.page.width - 100, 80).stroke("#cbd5e1").fillColor("#f8fafc").strokeColor("#cbd5e1");
        doc.rect(50, 180, doc.page.width - 100, 80).fill("#f8fafc");
        doc.fillColor("#1e293b").fontSize(12).font("Helvetica-Bold").text("Patient Information", 60, 190);
        doc.fontSize(10).font("Helvetica").fillColor("#374151")
            .text(`Name: ${prescription.patient.name}`, 60, 208)
            .text(`Gender: ${prescription.patient.gender || "N/A"}`, 60, 222)
            .text(`Blood Group: ${prescription.patient.bloodGroup || "N/A"}`, 300, 208)
            .text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, 300, 222);

        // Diagnosis
        doc.moveDown();
        doc.fillColor("#1e293b").fontSize(13).font("Helvetica-Bold").text("Diagnosis", 50, 280);
        doc.fontSize(11).font("Helvetica").fillColor("#374151").text(prescription.diagnosis, 50, 300);

        // Symptoms
        if (prescription.symptoms?.length > 0) {
            doc.fontSize(13).font("Helvetica-Bold").fillColor("#1e293b").text("Symptoms", 50, 330);
            doc.fontSize(11).font("Helvetica").fillColor("#374151")
                .text(prescription.symptoms.join(", "), 50, 350);
        }

        // Medications
        let y = 390;
        if (prescription.medications?.length > 0) {
            doc.fontSize(13).font("Helvetica-Bold").fillColor("#1e293b").text("Medications", 50, y);
            y += 20;
            doc.rect(50, y, doc.page.width - 100, 22).fill("#1d4ed8");
            doc.fontSize(10).font("Helvetica-Bold").fillColor("white")
                .text("Medicine", 60, y + 6)
                .text("Dosage", 200, y + 6)
                .text("Frequency", 300, y + 6)
                .text("Duration", 420, y + 6);
            y += 22;
            prescription.medications.forEach((med, i) => {
                if (i % 2 === 0) doc.rect(50, y, doc.page.width - 100, 20).fill("#f1f5f9");
                doc.fontSize(10).font("Helvetica").fillColor("#374151")
                    .text(med.name, 60, y + 4)
                    .text(med.dosage, 200, y + 4)
                    .text(med.frequency, 300, y + 4)
                    .text(med.duration, 420, y + 4);
                y += 20;
            });
        }

        y += 15;
        // Advice
        if (prescription.advice) {
            doc.fontSize(12).font("Helvetica-Bold").fillColor("#1e293b").text("Advice / Instructions", 50, y);
            y += 18;
            doc.fontSize(10).font("Helvetica").fillColor("#374151").text(prescription.advice, 50, y, { width: doc.page.width - 100 });
            y += 40;
        }

        // AI Explanation
        if (prescription.isAiEnabled && prescription.aiExplanation) {
            doc.rect(50, y, doc.page.width - 100, 8).fill("#dbeafe");
            y += 8;
            doc.rect(50, y, doc.page.width - 100, 60).fill("#eff6ff");
            doc.fontSize(11).font("Helvetica-Bold").fillColor("#1d4ed8").text("AI Explanation for Patient", 60, y + 8);
            doc.fontSize(10).font("Helvetica").fillColor("#374151").text(prescription.aiExplanation, 60, y + 24, { width: doc.page.width - 120 });
            y += 70;
        }

        // Follow-up
        if (prescription.followUpDate) {
            doc.fontSize(11).font("Helvetica-Bold").fillColor("#dc2626")
                .text(`Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString()}`, 50, y);
        }

        // Footer
        doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill("#1d4ed8");
        doc.fontSize(9).fillColor("white").font("Helvetica")
            .text("This prescription is generated digitally. Always consult your doctor for medical advice.", 50, doc.page.height - 30, { align: "center" });

        doc.end();
    } catch (err) {
        console.error("PDF Error:", err);
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};
