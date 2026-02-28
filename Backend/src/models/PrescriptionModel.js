import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String, default: "" },
});

const prescriptionSchema = new mongoose.Schema(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
        diagnosis: { type: String, required: true },
        symptoms: { type: [String], default: [] },
        medications: { type: [medicationSchema], default: [] },
        labTests: { type: [String], default: [] },
        advice: { type: String, default: "" },
        followUpDate: { type: Date },
        aiExplanation: { type: String, default: "" }, // AI-generated explanation for patient
        isAiEnabled: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const PrescriptionModel = mongoose.model("Prescription", prescriptionSchema);
export default PrescriptionModel;
