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
            .populate("cancelledBy", "name role")
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

        const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=prescription-${id}.pdf`);
        doc.pipe(res);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = 50;
        const contentWidth = pageWidth - (margin * 2);
        const footerHeight = 50;
        const maxY = pageHeight - footerHeight - 20;

        // Header
        doc.rect(0, 0, pageWidth, 80).fill("#1d4ed8");
        doc.fontSize(22).fillColor("white").font("Helvetica-Bold")
            .text("AI Clinic Management System", 0, 20, { width: pageWidth, align: "center" });
        doc.fontSize(11).fillColor("white").font("Helvetica")
            .text("Medical Prescription", 0, 50, { width: pageWidth, align: "center" });

        let y = 100;

        // Doctor info
        doc.fontSize(13).font("Helvetica-Bold").fillColor("#1e293b")
            .text("Prescribing Doctor", margin, y);
        y += 20;
        doc.fontSize(11).font("Helvetica").fillColor("#374151")
            .text(`Dr. ${prescription.doctor.name}`, margin, y);
        y += 16;
        doc.text(`Specialization: ${prescription.doctor.specialization || "General Physician"}`, margin, y);
        y += 16;
        doc.text(`Qualification: ${prescription.doctor.qualification || "MBBS"}`, margin, y);
        y += 25;

        // Patient info box
        const patientBoxHeight = 70;
        doc.rect(margin, y, contentWidth, patientBoxHeight).fillAndStroke("#f8fafc", "#cbd5e1");
        doc.fillColor("#1e293b").fontSize(12).font("Helvetica-Bold")
            .text("Patient Information", margin + 10, y + 10);
        y += 28;
        doc.fontSize(10).font("Helvetica").fillColor("#374151")
            .text(`Name: ${prescription.patient.name}`, margin + 10, y)
            .text(`Blood: ${prescription.patient.bloodGroup || "N/A"}`, margin + contentWidth - 150, y);
        y += 16;
        doc.text(`Gender: ${prescription.patient.gender || "N/A"}`, margin + 10, y)
            .text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, margin + contentWidth - 150, y);
        y += 35;

        // Diagnosis
        doc.fillColor("#1e293b").fontSize(13).font("Helvetica-Bold")
            .text("Diagnosis", margin, y);
        y += 18;
        doc.fontSize(11).font("Helvetica").fillColor("#374151")
            .text(prescription.diagnosis, margin, y, { width: contentWidth });
        y += 25;

        // Symptoms
        if (prescription.symptoms?.length > 0) {
            doc.fontSize(13).font("Helvetica-Bold").fillColor("#1e293b")
                .text("Symptoms", margin, y);
            y += 18;
            doc.fontSize(11).font("Helvetica").fillColor("#374151")
                .text(prescription.symptoms.join(", "), margin, y, { width: contentWidth });
            y += 25;
        }

        // Medications
        if (prescription.medications?.length > 0) {
            doc.fontSize(13).font("Helvetica-Bold").fillColor("#1e293b")
                .text("Medications", margin, y);
            y += 20;

            const headerHeight = 24;
            const rowHeight = 22;

            doc.rect(margin, y, contentWidth, headerHeight).fill("#1d4ed8");
            doc.fontSize(9).font("Helvetica-Bold").fillColor("white")
                .text("Medicine", margin + 8, y + 7, { width: 130 })
                .text("Dosage", margin + 143, y + 7, { width: 85 })
                .text("Frequency", margin + 233, y + 7, { width: 100 })
                .text("Duration", margin + 338, y + 7, { width: 80 });
            y += headerHeight;

            prescription.medications.forEach((med, i) => {
                const bgColor = i % 2 === 0 ? "#f8fafc" : "#ffffff";
                doc.rect(margin, y, contentWidth, rowHeight).fill(bgColor);
                doc.fontSize(9).font("Helvetica").fillColor("#374151")
                    .text(med.name || "", margin + 8, y + 6, { width: 130, lineBreak: false, ellipsis: true })
                    .text(med.dosage || "", margin + 143, y + 6, { width: 85, lineBreak: false })
                    .text(med.frequency || "", margin + 233, y + 6, { width: 100, lineBreak: false })
                    .text(med.duration || "", margin + 338, y + 6, { width: 80, lineBreak: false });
                y += rowHeight;
            });
            y += 20;
        }

        // Advice
        if (prescription.advice) {
            doc.fontSize(12).font("Helvetica-Bold").fillColor("#1e293b")
                .text("Advice / Instructions", margin, y);
            y += 18;
            const adviceHeight = doc.heightOfString(prescription.advice, { width: contentWidth, lineGap: 2 });
            doc.fontSize(10).font("Helvetica").fillColor("#374151")
                .text(prescription.advice, margin, y, { width: contentWidth, lineGap: 2 });
            y += Math.min(adviceHeight, 80) + 15;
        }

        // AI Explanation
        if (prescription.isAiEnabled && prescription.aiExplanation) {
            const aiTextHeight = doc.heightOfString(prescription.aiExplanation, { width: contentWidth - 20, lineGap: 2 });
            const aiBoxHeight = Math.min(aiTextHeight + 35, 100);

            doc.rect(margin, y, contentWidth, 5).fill("#dbeafe");
            y += 5;
            doc.rect(margin, y, contentWidth, aiBoxHeight).fill("#eff6ff");
            doc.fontSize(10).font("Helvetica-Bold").fillColor("#1d4ed8")
                .text("AI Explanation for Patient", margin + 10, y + 8);
            y += 24;
            doc.fontSize(9).font("Helvetica").fillColor("#374151")
                .text(prescription.aiExplanation, margin + 10, y, { width: contentWidth - 20, lineGap: 2 });
            y += Math.min(aiTextHeight, 70) + 12;
        }

        // Follow-up
        if (prescription.followUpDate) {
            y += 10;
            doc.fontSize(11).font("Helvetica-Bold").fillColor("#dc2626")
                .text(`Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString()}`, margin, y);
        }

        // Footer - only on the last page
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight).fill("#1d4ed8");
            doc.fontSize(9).fillColor("white").font("Helvetica")
                .text("This prescription is generated digitally. Always consult your doctor for medical advice.",
                    0, pageHeight - 30, { width: pageWidth, align: "center" });
        }

        doc.end();
    } catch (err) {
        console.error("PDF Error:", err);
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};

// Cancel appointment
export const cancelPatientAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await AppointmentModel.findOneAndUpdate(
            { _id: id, patient: req.user.id },
            {
                status: "cancelled",
                cancelledBy: req.user.id,
                cancelledByRole: req.user.role
            },
            { new: true }
        ).populate("doctor", "name specialization")
            .populate("cancelledBy", "name role");

        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
        res.status(200).json({ success: true, message: "Appointment cancelled", data: appointment });
    } catch (err) {
        res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
};
